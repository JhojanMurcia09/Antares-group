-- Ejecutar una sola vez sobre una instalación existente.
-- Para una instalación nueva, importar esquema.sql en lugar de esta migración.
ALTER TABLE productos
    ADD COLUMN precio_promocion DECIMAL(12, 2) DEFAULT NULL AFTER precio,
    ADD COLUMN promocion_activa TINYINT(1) NOT NULL DEFAULT 0 AFTER precio_promocion,
    ADD COLUMN etiqueta_promocion VARCHAR(40) DEFAULT NULL AFTER promocion_activa;

CREATE TABLE IF NOT EXISTS ajustes_sistema (
    clave VARCHAR(80) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
