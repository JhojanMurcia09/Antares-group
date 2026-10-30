<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';

apiRun(static function (): void {
    apiRequireSameOrigin();
    apiRequireAdmin();
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        apiFail('Método no permitido.', 405);
    }

    $input = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($input)) {
        apiFail('La solicitud de venta no tiene un formato válido.');
    }
    $items = $input['items'] ?? null;
    if (!is_array($items) || $items === [] || count($items) > 50) {
        apiFail('El ticket debe tener entre 1 y 50 productos.');
    }

    $validatedItems = [];
    foreach ($items as $item) {
        if (!is_array($item)) {
            apiFail('Un producto del ticket no tiene un formato válido.');
        }
        $productId = filter_var($item['productoId'] ?? null, FILTER_VALIDATE_INT);
        $size = filter_var($item['talla'] ?? null, FILTER_VALIDATE_INT);
        $quantity = filter_var($item['cantidad'] ?? null, FILTER_VALIDATE_INT);
        if (
            $productId === false || $productId === null || $productId < 1
            || $size === false || $size === null || $size < 15 || $size > 60
            || $quantity === false || $quantity === null || $quantity < 1 || $quantity > 9999
        ) {
            apiFail('Un producto, talla o cantidad del ticket no es válido.');
        }
        $validatedItems[] = [
            'productoId' => $productId,
            'talla' => $size,
            'cantidad' => $quantity,
        ];
    }

    $pdo = apiDb();
    $stockQuery = $pdo->prepare(
        'SELECT stock FROM tallas_producto
         WHERE producto_id = :producto_id AND talla = :talla FOR UPDATE'
    );
    $stockUpdate = $pdo->prepare(
        'UPDATE tallas_producto SET stock = stock - :cantidad_restar
         WHERE producto_id = :producto_id AND talla = :talla AND stock >= :cantidad_requerida'
    );
    $orderInsert = $pdo->prepare(
        "INSERT INTO ordenes (producto_id, talla, cantidad, estado)
         VALUES (:producto_id, :talla, :cantidad, 'vendida')"
    );

    $pdo->beginTransaction();
    try {
        foreach ($validatedItems as $item) {
            $productId = $item['productoId'];
            $size = $item['talla'];
            $quantity = $item['cantidad'];
            $stockQuery->execute(['producto_id' => $productId, 'talla' => $size]);
            $stock = $stockQuery->fetchColumn();
            if ($stock === false || (int) $stock < $quantity) {
                throw new DomainException("No hay stock suficiente para la talla {$size}. Actualiza el inventario y vuelve a intentar.");
            }

            $stockUpdate->execute([
                'cantidad_restar' => $quantity,
                'producto_id' => $productId,
                'talla' => $size,
                'cantidad_requerida' => $quantity,
            ]);
            if ($stockUpdate->rowCount() !== 1) {
                throw new DomainException("El stock de la talla {$size} cambió durante la venta. Actualiza el inventario.");
            }
            $orderInsert->execute([
                'producto_id' => $productId,
                'talla' => $size,
                'cantidad' => $quantity,
            ]);
        }

        $pdo->commit();
    } catch (DomainException $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        apiFail($error->getMessage(), 409);
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    apiRespond(['mensaje' => 'Venta registrada y stock actualizado.']);
});
