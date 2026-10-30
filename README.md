# Antares Store JM

Tienda de calzado premium streetwear e importado. Catálogo interactivo 100% visual con conversión directa por WhatsApp.

## Tecnologías utilizadas (todas gratuitas)

- **HTML5** semántico
- **CSS3** con variables/tokens, Flexbox, Grid y animaciones 3D
- **JavaScript ES6+** modular (sin dependencias de pago)
- **PHP 8.1+** con PDO para la API de inventario y sesiones administrativas
- **Motion One** (CDN) — Animaciones UI/UX Pro Max gratuitas
- **SweetAlert2** (CDN) — Notificaciones elegantes en lugar de alert()
- **Lucide Icons** (CDN) — Iconografía gratuita y moderna
- **Google Fonts** (Inter) — Tipografía gratuita
- **Base de datos:** MySQL/MariaDB (compatible con phpMyAdmin, `src/base-datos/esquema.sql`)

## Estructura del proyecto

```
Antares/
├── src/
│   ├── html/          # Páginas (index, producto, login, registro, carrito)
│   ├── css/           # Estilos (tokens, componentes, diseno, animaciones, paginas, motion)
│   ├── js/            # JavaScript (core, componentes, servicios, utilidades, base-datos)
│   │   ├── utilidades/      # formato.js, mensajes.js (SweetAlert)
│   │   ├── componentes/     # catalogo.js, carrito.js, rotacion360.js, motion-animations.js
│   │   ├── servicios/       # whatsapp.js
│   │   └── core/            # app.js
│   ├── assets/        # Imágenes, iconos, fuentes, videos (agregar imágenes reales aquí)
│   ├── base-datos/    # esquema.sql, migracion-inventario.sql, seed-productos.json
│   └── api/           # API PHP de productos, imágenes y sesión administrativa
├── config.example.php # Plantilla para la configuración privada config.local.php
├── docs/
├── pruebas/
├── REQUISITOS_Y_CASOS_DE_USO.md
└── README.md
```

## Idioma

Todo el proyecto está en español: interfaz, código, comentarios, IDs, clases, nombres de variables y base de datos.

## Cómo usar

1. Ejecuta el proyecto bajo Apache con PHP 8.1 o superior y la extensión PDO MySQL habilitada. Un servidor estático de Python no ejecuta la API.
2. En phpMyAdmin, importa `src/base-datos/esquema.sql` para una base nueva. Si ya tenías las tablas anteriores, selecciona `antares_store_db` e importa **una sola vez** `src/base-datos/migracion-inventario.sql`.
3. Copia `config.example.php` como `config.local.php` en la raíz del proyecto. Completa las credenciales de un usuario MySQL con permisos sobre `antares_store_db` y el usuario administrativo.
4. Genera el hash de la contraseña administrativa desde la terminal del servidor con PHP: `php -r "echo password_hash('TU_CLAVE_LARGA', PASSWORD_DEFAULT), PHP_EOL;"`. Pega el resultado en `admin.password_hash`; no guardes la contraseña en el frontend.
5. Configura PHP para aceptar varias imágenes (por ejemplo, `upload_max_filesize=6M`, `post_max_size=50M`, `max_file_uploads=8`) y permite que Apache/PHP escriba en `src/assets/uploads/`.
6. Abre `http://localhost/Antares/src/html/index.html` (ajusta `Antares` a la ruta de instalación). El primer acceso agrega a MySQL los modelos iniciales que falten, conservando los existentes. Las tallas iniciales se importan con stock `0`: el administrador registra las existencias antes de que se ofrezcan en la tienda.

La tienda y el panel consumen la misma API MySQL. Crear, editar, borrar, cambiar stock, registrar ventas, subir imágenes y activar promociones se refleja en el catálogo en cuanto se vuelve a consultar. Se aceptan hasta 8 imágenes JPG, PNG o WebP de máximo 5 MB cada una. Si un zapato tiene órdenes asociadas, la clave foránea evita borrarlo y el panel informa el motivo.

La sesión administrativa se valida en PHP y no depende de `localStorage`. Las cuentas de clientes siguen siendo una demostración local en el navegador. La contraseña administrativa que anteriormente estaba en un archivo JavaScript público ya no se usa; si la reutilizaste en algún otro sitio, cámbiala.

WhatsApp está configurado para Colombia con el número `+57 322 584 0218` en `src/js/servicios/whatsapp.js`.

## Imágenes

El proyecto incluye imágenes de muestra en `src/assets/imagenes/[marca]/`. El catálogo inicial está descrito en `src/base-datos/seed-productos.json`; la API migra los 28 modelos y sus imágenes locales cuando faltan en la base de datos.

## Agentes involucrados

- **Roky**: Revisor preventivo y gatekeeper (solo lectura).
- **Val**: Diseñador Experto UI/UX y arquitectura visual con Motion.
- **Jhon**: Visionario y estratega de futuro.

Todos operan sobre el Vault de Obsidian en `C:\Users\jhoja\OneDrive\Desktop\O\memory`.

## Costo

$0. Todas las librerías se cargan por CDN (Motion One, SweetAlert2, Lucide, Google Fonts). No se requiere npm ni cuentas de pago.
