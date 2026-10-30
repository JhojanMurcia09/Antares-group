<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';

function apiSeedInitialProducts(PDO $pdo): void
{
    if ((int) $pdo->query("SELECT GET_LOCK('antares_catalogo_semilla', 10)")->fetchColumn() !== 1) {
        throw new RuntimeException('No fue posible bloquear la carga inicial del catálogo.');
    }

    try {
        $seeded = $pdo->query("SELECT valor FROM ajustes_sistema WHERE clave = 'catalogo_semilla_cargado'")->fetchColumn();
        if ($seeded !== false) {
            return;
        }

        $path = dirname(__DIR__) . '/base-datos/seed-productos.json';
        if (!is_file($path)) {
            throw new RuntimeException('Falta el archivo de productos iniciales.');
        }
        $seed = json_decode((string) file_get_contents($path), true);
        if (!is_array($seed) || !is_array($seed['productos'] ?? null)) {
            throw new RuntimeException('El archivo de productos iniciales no tiene un formato válido.');
        }

        $pdo->beginTransaction();
        try {
            $brandStatement = $pdo->prepare(
                'INSERT INTO marcas (nombre, identificador) VALUES (:nombre, :identificador)
                 ON DUPLICATE KEY UPDATE identificador = VALUES(identificador)'
            );
            $productStatement = $pdo->prepare(
                'INSERT INTO productos
                    (marca_id, nombre_modelo, referencia, precio, descripcion, categoria, destacado, imagen_principal)
                 VALUES
                    (:marca_id, :nombre_modelo, :referencia, :precio, :descripcion, :categoria, :destacado, :imagen_principal)'
            );
            $existingStatement = $pdo->prepare('SELECT id FROM productos WHERE referencia = :referencia');
            $sizeStatement = $pdo->prepare(
                'INSERT INTO tallas_producto (producto_id, talla, stock) VALUES (:producto_id, :talla, 0)'
            );
            $imageStatement = $pdo->prepare(
                'INSERT INTO imagenes_producto (producto_id, url_imagen, tipo_imagen, orden)
                 VALUES (:producto_id, :url_imagen, :tipo_imagen, :orden)'
            );
            $brandIdStatement = $pdo->prepare('SELECT id FROM marcas WHERE identificador = :identificador');

            foreach ($seed['productos'] as $product) {
                $existingStatement->execute(['referencia' => $product['referencia']]);
                if ($existingStatement->fetchColumn() !== false) {
                    continue;
                }

                $brandSlug = (string) $product['marca'];
                $brandName = ucwords(str_replace('-', ' ', $brandSlug));
                $brandStatement->execute(['nombre' => $brandName, 'identificador' => $brandSlug]);
                $brandIdStatement->execute(['identificador' => $brandSlug]);
                $brandId = (int) $brandIdStatement->fetchColumn();

                $productStatement->execute([
                    'marca_id' => $brandId,
                    'nombre_modelo' => $product['nombreModelo'],
                    'referencia' => $product['referencia'],
                    'precio' => $product['precio'],
                    'descripcion' => $product['descripcion'],
                    'categoria' => $product['categoria'],
                    'destacado' => !empty($product['destacado']) ? 1 : 0,
                    'imagen_principal' => $product['imagenPrincipal'],
                ]);
                $productId = (int) $pdo->lastInsertId();

                foreach ($product['tallasDisponibles'] as $size) {
                    $sizeStatement->execute(['producto_id' => $productId, 'talla' => (int) $size]);
                }

                $images = array_values(array_unique(array_merge(
                    [$product['imagenPrincipal']],
                    $product['imagenesDetalle'] ?? []
                )));
                foreach ($images as $order => $image) {
                    $imageStatement->execute([
                        'producto_id' => $productId,
                        'url_imagen' => $image,
                        'tipo_imagen' => $order === 0 ? 'principal' : 'detalle',
                        'orden' => $order,
                    ]);
                }
            }

            $pdo->prepare(
                "INSERT INTO ajustes_sistema (clave, valor) VALUES ('catalogo_semilla_cargado', 'si')"
            )->execute();
            $pdo->commit();
        } catch (Throwable $error) {
            $pdo->rollBack();
            throw $error;
        }
    } finally {
        $pdo->query("SELECT RELEASE_LOCK('antares_catalogo_semilla')");
    }
}

function apiListProducts(PDO $pdo, bool $isAdmin): array
{
    $rows = $pdo->query(
        'SELECT p.id, p.nombre_modelo, p.referencia, p.precio, p.precio_promocion,
                p.promocion_activa, p.etiqueta_promocion, p.descripcion, p.categoria,
                p.destacado, p.imagen_principal, m.identificador AS marca,
                m.nombre AS marca_nombre
         FROM productos p
         INNER JOIN marcas m ON m.id = p.marca_id
         ORDER BY p.fecha_creacion DESC, p.id DESC'
    )->fetchAll();

    $imageRows = $pdo->query(
        'SELECT producto_id, url_imagen FROM imagenes_producto ORDER BY orden, id'
    )->fetchAll();
    $images = [];
    foreach ($imageRows as $image) {
        $images[(int) $image['producto_id']][] = $image['url_imagen'];
    }

    $sizeRows = $pdo->query(
        'SELECT producto_id, talla, stock FROM tallas_producto ORDER BY talla'
    )->fetchAll();
    $sizes = [];
    foreach ($sizeRows as $size) {
        if (!$isAdmin && (int) $size['stock'] < 1) {
            continue;
        }
        $sizes[(int) $size['producto_id']][(int) $size['talla']] = (int) $size['stock'];
    }

    foreach ($rows as &$row) {
        $id = (int) $row['id'];
        $row['id'] = $id;
        $row['precio'] = (float) $row['precio'];
        $row['precio_promocion'] = $row['precio_promocion'] === null ? null : (float) $row['precio_promocion'];
        $row['promocion_activa'] = (bool) $row['promocion_activa'];
        $row['destacado'] = (bool) $row['destacado'];
        $row['imagenes'] = array_values(array_unique($images[$id] ?? [$row['imagen_principal']]));
        $row['tallas'] = $sizes[$id] ?? [];
    }
    unset($row);

    return $rows;
}

apiRun(static function (): void {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') {
        $pdo = apiDb();
        apiSeedInitialProducts($pdo);
        $isAdmin = ($_SESSION['antares_admin'] ?? false) === true;
        apiRespond(['productos' => apiListProducts($pdo, $isAdmin)]);
    }

    apiRequireSameOrigin();
    apiRequireAdmin();
    if ($method !== 'POST') {
        apiFail('Método no permitido.', 405);
    }

    $pdo = apiDb();
    $name = trim((string) ($_POST['name'] ?? ''));
    $brandName = trim((string) ($_POST['brand'] ?? ''));
    $reference = strtoupper(trim((string) ($_POST['reference'] ?? '')));
    $category = trim((string) ($_POST['category'] ?? ''));
    $description = trim((string) ($_POST['description'] ?? ''));
    $price = filter_var($_POST['price'] ?? null, FILTER_VALIDATE_FLOAT);
    $promotionActive = filter_var($_POST['promotionActive'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $promotionPrice = ($_POST['promotionPrice'] ?? '') === ''
        ? null
        : filter_var($_POST['promotionPrice'], FILTER_VALIDATE_FLOAT);
    $promotionLabel = trim((string) ($_POST['promotionLabel'] ?? 'Oferta'));
    $isFeatured = filter_var($_POST['featured'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $sizes = apiReadSizes((string) ($_POST['sizes'] ?? '{}'));

    if ($name === '' || $brandName === '' || $reference === '' || strlen($name) > 180 || strlen($reference) > 100) {
        apiFail('Nombre, marca y referencia son obligatorios.');
    }
    if ($price === false || $price <= 0 || $price > 9999999999) {
        apiFail('Ingresa un precio original válido.');
    }
    if (
        $promotionActive
        && ($promotionPrice === false || $promotionPrice === null || $promotionPrice <= 0 || $promotionPrice >= $price)
    ) {
        apiFail('El precio de promoción debe ser mayor que cero y menor que el precio original.');
    }
    if (strlen($promotionLabel) > 40 || strlen($category) > 100) {
        apiFail('La etiqueta de promoción o categoría supera el largo permitido.');
    }

    $uploads = apiSaveUploads();
    $image = $uploads[0]['url'] ?? trim((string) ($_POST['image'] ?? ''));
    if ($image === '' && isset($_POST['existingImage'])) {
        $image = trim((string) $_POST['existingImage']);
    }
    if ($image === '') {
        apiDeleteUploadedImages(array_column($uploads, 'path'));
        apiFail('Selecciona al menos una imagen o proporciona una ruta.');
    }
    if (strlen($image) > 2048) {
        apiDeleteUploadedImages(array_column($uploads, 'path'));
        apiFail('La ruta de imagen es demasiado larga.');
    }

    $brandSlug = apiSlug($brandName);
    if ($brandSlug === '') {
        apiDeleteUploadedImages(array_column($uploads, 'path'));
        apiFail('La marca debe contener letras o números.');
    }

    try {
        $pdo->beginTransaction();
        $brandStatement = $pdo->prepare(
            'INSERT INTO marcas (nombre, identificador) VALUES (:nombre, :identificador)
             ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)'
        );
        $brandStatement->execute(['nombre' => $brandName, 'identificador' => $brandSlug]);
        $brandStatement = $pdo->prepare('SELECT id FROM marcas WHERE identificador = :identificador');
        $brandStatement->execute(['identificador' => $brandSlug]);
        $brandId = (int) $brandStatement->fetchColumn();

        $productStatement = $pdo->prepare(
            'INSERT INTO productos
                (marca_id, nombre_modelo, referencia, precio, precio_promocion,
                 promocion_activa, etiqueta_promocion, descripcion, categoria, destacado, imagen_principal)
             VALUES
                (:marca_id, :nombre, :referencia, :precio, :precio_promocion,
                 :promocion_activa, :etiqueta, :descripcion, :categoria, :destacado, :imagen)'
        );
        $productStatement->execute([
            'marca_id' => $brandId,
            'nombre' => $name,
            'referencia' => $reference,
            'precio' => $price,
            'precio_promocion' => $promotionActive ? $promotionPrice : null,
            'promocion_activa' => $promotionActive ? 1 : 0,
            'etiqueta' => $promotionActive ? ($promotionLabel ?: 'Oferta') : null,
            'descripcion' => $description,
            'categoria' => $category,
            'destacado' => $isFeatured ? 1 : 0,
            'imagen' => $image,
        ]);
        $productId = (int) $pdo->lastInsertId();

        apiPersistSizes($pdo, $productId, $sizes);
        apiPersistImages($pdo, $productId, $uploads, $image);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        apiDeleteUploadedImages(array_column($uploads, 'path'));
        throw $error;
    }

    apiRespond(['id' => $productId, 'mensaje' => 'Producto guardado.'], 201);
});
