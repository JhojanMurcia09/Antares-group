<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'httponly' => true,
    'secure' => $isHttps,
    'samesite' => 'Strict',
    'path' => '/',
]);
session_start();

function apiRespond(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function apiFail(string $message, int $status = 400): never
{
    apiRespond(['error' => $message], $status);
}

function apiConfig(): array
{
    $path = dirname(__DIR__, 2) . '/config.local.php';
    if (!is_file($path)) {
        apiFail('Falta crear config.local.php en la carpeta raíz del proyecto. Sigue los pasos del README.', 503);
    }

    $config = require $path;
    if (
        !is_array($config)
        || !isset($config['db'])
        || !is_array($config['db'])
        || !isset($config['admin'])
        || !is_array($config['admin'])
        || empty($config['db']['host'])
        || empty($config['db']['name'])
        || empty($config['db']['user'])
        || !isset($config['db']['password'])
        || empty($config['admin']['username'])
        || empty($config['admin']['password_hash'])
        || $config['admin']['password_hash'] === 'PEGA_AQUI_EL_HASH_GENERADO_CON_PASSWORD_HASH'
    ) {
        apiFail('La configuración de base de datos o administrador está incompleta.', 503);
    }

    return $config;
}

function apiDb(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = apiConfig()['db'];
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $db['host'],
        $db['name']
    );
    $pdo = new PDO($dsn, $db['user'], $db['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function apiRequireAdmin(): void
{
    if (($_SESSION['antares_admin'] ?? false) !== true) {
        apiFail('Inicia sesión como administrador para continuar.', 401);
    }
}

function apiRequireSameOrigin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }

    $originHost = parse_url($origin, PHP_URL_HOST);
    $originPort = parse_url($origin, PHP_URL_PORT);
    $requestUrl = '//' . ($_SERVER['HTTP_HOST'] ?? '');
    $requestHost = parse_url($requestUrl, PHP_URL_HOST);
    $requestPort = parse_url($requestUrl, PHP_URL_PORT);
    if (
        !is_string($originHost)
        || !is_string($requestHost)
        || strcasecmp($originHost, $requestHost) !== 0
        || $originPort !== $requestPort
    ) {
        apiFail('Origen de solicitud no permitido.', 403);
    }
}

function apiSlug(string $value): string
{
    $value = trim($value);
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    $slug = strtolower((string) $ascii);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    return trim($slug, '-');
}

function apiReadSizes(string $json): array
{
    $sizes = json_decode($json, true);
    if (!is_array($sizes)) {
        apiFail('Las tallas y el stock tienen un formato inválido.');
    }

    $normalized = [];
    foreach ($sizes as $size => $quantity) {
        if (
            !ctype_digit((string) $size)
            || (int) $size < 15
            || (int) $size > 60
            || filter_var($quantity, FILTER_VALIDATE_INT) === false
            || (int) $quantity < 0
            || (int) $quantity > 9999
        ) {
            apiFail('Cada talla debe ser un número entre 15 y 60 y su stock entre 0 y 9999.');
        }
        $normalized[(int) $size] = (int) $quantity;
    }

    ksort($normalized);
    return $normalized;
}

function apiPersistSizes(PDO $pdo, int $productId, array $sizes): void
{
    $pdo->prepare('DELETE FROM tallas_producto WHERE producto_id = :producto_id')
        ->execute(['producto_id' => $productId]);
    $statement = $pdo->prepare(
        'INSERT INTO tallas_producto (producto_id, talla, stock) VALUES (:producto_id, :talla, :stock)'
    );
    foreach ($sizes as $size => $stock) {
        $statement->execute(['producto_id' => $productId, 'talla' => $size, 'stock' => $stock]);
    }
}

function apiPersistImages(PDO $pdo, int $productId, array $uploads, string $mainImage): void
{
    $pdo->prepare('DELETE FROM imagenes_producto WHERE producto_id = :producto_id')
        ->execute(['producto_id' => $productId]);
    $images = $uploads === [] ? [$mainImage] : array_column($uploads, 'url');
    $statement = $pdo->prepare(
        'INSERT INTO imagenes_producto (producto_id, url_imagen, tipo_imagen, orden)
         VALUES (:producto_id, :url, :tipo, :orden)'
    );
    foreach (array_values(array_unique($images)) as $order => $url) {
        $statement->execute([
            'producto_id' => $productId,
            'url' => $url,
            'tipo' => $order === 0 ? 'principal' : 'detalle',
            'orden' => $order,
        ]);
    }
}

function apiSaveUploads(): array
{
    if (!isset($_FILES['images'])) {
        return [];
    }

    $field = $_FILES['images'];
    $names = is_array($field['name']) ? $field['name'] : [$field['name']];
    if (count($names) > 8) {
        apiFail('Puedes subir hasta 8 imágenes por producto.');
    }

    $directory = dirname(__DIR__) . '/assets/uploads';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        apiFail('No fue posible preparar la carpeta de imágenes.', 500);
    }

    $mimeExtensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    $saved = [];
    $failUpload = static function (string $message, int $status = 400) use (&$saved): never {
        apiDeleteUploadedImages(array_column($saved, 'path'));
        apiFail($message, $status);
    };

    foreach ($names as $index => $originalName) {
        $error = (int) (is_array($field['error']) ? $field['error'][$index] : $field['error']);
        if ($error === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($error !== UPLOAD_ERR_OK) {
            $failUpload('No se pudo subir una imagen. Verifica el tamaño máximo permitido por PHP.');
        }

        $temporaryPath = is_array($field['tmp_name']) ? $field['tmp_name'][$index] : $field['tmp_name'];
        $fileSize = (int) (is_array($field['size']) ? $field['size'][$index] : $field['size']);
        $imageInfo = @getimagesize($temporaryPath);
        $mime = is_array($imageInfo) ? ($imageInfo['mime'] ?? '') : '';
        if ($fileSize < 1 || $fileSize > 5 * 1024 * 1024 || !isset($mimeExtensions[$mime])) {
            $failUpload('Cada imagen debe ser JPG, PNG o WebP y pesar máximo 5 MB.');
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $mimeExtensions[$mime];
        $targetPath = $directory . '/' . $filename;
        if (!move_uploaded_file($temporaryPath, $targetPath)) {
            $failUpload('No fue posible guardar una de las imágenes.', 500);
        }
        $saved[] = [
            'url' => '../assets/uploads/' . $filename,
            'path' => $targetPath,
        ];
    }

    return $saved;
}

function apiDeleteUploadedImages(array $paths): void
{
    $uploadsDirectory = realpath(dirname(__DIR__) . '/assets/uploads');
    if ($uploadsDirectory === false) {
        return;
    }

    foreach ($paths as $path) {
        $realPath = realpath($path);
        if (
            $realPath !== false
            && str_starts_with($realPath, $uploadsDirectory . DIRECTORY_SEPARATOR)
            && is_file($realPath)
        ) {
            unlink($realPath);
        }
    }
}

function apiRun(callable $handler): void
{
    try {
        $handler();
    } catch (PDOException $error) {
        error_log('[Antares API] Database error: ' . $error->getMessage());
        if ($error->getCode() === '23000') {
            apiFail('La referencia del producto ya existe o hay una relación que impide el cambio.', 409);
        }
        apiFail('No fue posible guardar o consultar la base de datos. Revisa la conexión y las migraciones.', 500);
    } catch (Throwable $error) {
        error_log('[Antares API] ' . $error->getMessage());
        apiFail('Error interno del servidor.', 500);
    }
}
