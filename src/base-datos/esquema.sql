-- ============================================================================
-- Esquema MySQL para Antares Store JM.
-- Compatible con MySQL/MariaDB e importación desde phpMyAdmin.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS antares_store_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE antares_store_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre_completo VARCHAR(150) NOT NULL,
    correo_electronico VARCHAR(254) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_correo (correo_electronico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marcas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    identificador VARCHAR(80) NOT NULL,
    logo_url VARCHAR(2048) DEFAULT NULL,
    descripcion TEXT,
    PRIMARY KEY (id),
    UNIQUE KEY uq_marcas_identificador (identificador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    marca_id INT UNSIGNED NOT NULL,
    nombre_modelo VARCHAR(180) NOT NULL,
    referencia VARCHAR(100) NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    precio_promocion DECIMAL(12, 2) DEFAULT NULL,
    promocion_activa TINYINT(1) NOT NULL DEFAULT 0,
    etiqueta_promocion VARCHAR(40) DEFAULT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) DEFAULT NULL,
    destacado TINYINT(1) NOT NULL DEFAULT 0,
    imagen_principal VARCHAR(2048) DEFAULT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_productos_referencia (referencia),
    KEY idx_productos_marca (marca_id),
    KEY idx_productos_destacado (destacado),
    CONSTRAINT fk_productos_marca
        FOREIGN KEY (marca_id) REFERENCES marcas(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tallas_producto (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    producto_id INT UNSIGNED NOT NULL,
    talla SMALLINT UNSIGNED NOT NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tallas_producto (producto_id, talla),
    CONSTRAINT fk_tallas_producto_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imagenes_producto (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    producto_id INT UNSIGNED NOT NULL,
    url_imagen VARCHAR(2048) NOT NULL,
    tipo_imagen VARCHAR(40) NOT NULL DEFAULT 'detalle',
    orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_imagenes_producto_orden (producto_id, orden),
    CONSTRAINT fk_imagenes_producto_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ajustes_sistema (
    clave VARCHAR(80) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    PRIMARY KEY (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ordenes (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED DEFAULT NULL,
    producto_id INT UNSIGNED NOT NULL,
    talla SMALLINT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,
    fecha_orden TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    mensaje_whatsapp TEXT,
    PRIMARY KEY (id),
    KEY idx_ordenes_usuario (usuario_id),
    KEY idx_ordenes_producto (producto_id),
    KEY idx_ordenes_fecha (fecha_orden),
    CONSTRAINT fk_ordenes_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ordenes_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
