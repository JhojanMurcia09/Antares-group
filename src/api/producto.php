<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';

apiRun(static function (): void {
    apiRequireSameOrigin();
    apiRequireAdmin();

    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if ($id === false || $id === null || $id < 1) {
        apiFail('Identificador de producto inválido.');
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if ($method === 'POST' && ($_POST['_method'] ?? '') === 'PUT') {
        $pdo = apiDb();
        $existingStatement = $pdo->prepare(
            'SELECT p.imagen_principal, i.url_imagen
             FROM productos p
             LEFT JOIN imagenes_producto i ON i.producto_id = p.id
             WHERE p.id = :id
             ORDER BY i.orden, i.id'
        );
        $existingStatement->execute(['id' => $id]);
        $existingRows = $existingStatement->fetchAll();
        if ($existingRows === []) {
            apiFail('No se encontró el producto.', 404);
        }

        $currentImage = (string) $existingRows[0]['imagen_principal'];
        $image = trim((string) ($_POST['image'] ?? $currentImage));
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
        if (strlen($promotionLabel) > 40 || strlen($category) > 100 || strlen($image) > 2048) {
            apiFail('La etiqueta, categoría o ruta de imagen supera el largo permitido.');
        }

        $brandSlug = apiSlug($brandName);
        if ($brandSlug === '' || $image === '') {
            apiFail('La marca y una imagen válida son obligatorias.');
        }

        $uploads = apiSaveUploads();
        $imageChanged = $image !== $currentImage;
        if ($uploads !== []) {
            $image = $uploads[0]['url'];
        }
        $pdo->beginTransaction();
        try {
            $brandStatement = $pdo->prepare(
                'INSERT INTO marcas (nombre, identificador) VALUES (:nombre, :identificador)
                 ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)'
            );
            $brandStatement->execute(['nombre' => $brandName, 'identificador' => $brandSlug]);
            $brandStatement = $pdo->prepare('SELECT id FROM marcas WHERE identificador = :identificador');
            $brandStatement->execute(['identificador' => $brandSlug]);
            $brandId = (int) $brandStatement->fetchColumn();

            $update = $pdo->prepare(
                'UPDATE productos SET marca_id = :marca_id, nombre_modelo = :nombre,
                    referencia = :referencia, precio = :precio, precio_promocion = :precio_promocion,
                    promocion_activa = :promocion_activa, etiqueta_promocion = :etiqueta,
                    descripcion = :descripcion, categoria = :categoria, destacado = :destacado,
                    imagen_principal = :imagen WHERE id = :id'
            );
            $update->execute([
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
                'id' => $id,
            ]);

            apiPersistSizes($pdo, $id, $sizes);
            if ($uploads !== [] || $imageChanged) {
                apiPersistImages($pdo, $id, $uploads, $image);
            }
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            apiDeleteUploadedImages(array_column($uploads, 'path'));
            throw $error;
        }

        if ($uploads !== [] || $imageChanged) {
            $oldUploads = [];
            foreach ($existingRows as $row) {
                $url = (string) ($row['url_imagen'] ?? '');
                if (str_starts_with($url, '../assets/uploads/')) {
                    $oldUploads[] = dirname(__DIR__) . '/assets/uploads/' . basename($url);
                }
            }
            apiDeleteUploadedImages($oldUploads);
        }
        apiRespond(['mensaje' => 'Producto actualizado.']);
    }

    if ($method === 'DELETE') {
        $pdo = apiDb();
        $imagesStatement = $pdo->prepare(
            'SELECT url_imagen FROM imagenes_producto WHERE producto_id = :id'
        );
        $imagesStatement->execute(['id' => $id]);
        $images = $imagesStatement->fetchAll();
        $delete = $pdo->prepare('DELETE FROM productos WHERE id = :id');
        try {
            $delete->execute(['id' => $id]);
        } catch (PDOException $error) {
            if ($error->getCode() === '23000') {
                apiFail('Este producto tiene órdenes asociadas y no se puede borrar.', 409);
            }
            throw $error;
        }
        if ($delete->rowCount() === 0) {
            apiFail('No se encontró el producto.', 404);
        }

        $paths = [];
        foreach ($images as $image) {
            $url = (string) $image['url_imagen'];
            if (str_starts_with($url, '../assets/uploads/')) {
                $paths[] = dirname(__DIR__) . '/assets/uploads/' . basename($url);
            }
        }
        apiDeleteUploadedImages($paths);
        apiRespond(['mensaje' => 'Producto eliminado.']);
    }

    apiFail('Método no permitido.', 405);
});
