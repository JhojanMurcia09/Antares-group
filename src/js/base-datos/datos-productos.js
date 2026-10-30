/**
 * Archivo: js/base-datos/datos-productos.js
 * Descripción: Datos iniciales (seed) del catálogo de calzado Antares Store JM.
 * Cada producto tiene una imagen ÚNICA de la carpeta de imágenes del usuario.
 * No se repiten imágenes entre productos.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

const productosSemilla = [
    // ===================== ADIDAS (6 productos, imágenes 1-6) =====================
    {
        id: 1,
        marca: "adidas",
        nombreModelo: "Adidas Samba Blanco Negro",
        referencia: "AD-SAM-BN",
        precio: 249000,
        descripcion: "Clásico de Adidas con puntera en gamuza y suela de goma. Color blanco con detalles negros.",
        categoria: "clasico",
        destacado: true,
        imagenPrincipal: "../assets/imagenes/adidas/adidas-1.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/adidas/adidas-1.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42, 43, 44]
    },
    {
        id: 2,
        marca: "adidas",
        nombreModelo: "Adidas Samba Blanco Gris",
        referencia: "AD-SAM-BG",
        precio: 249000,
        descripcion: "Samba en blanco con detalles en gris. Estilo vintage para uso diario.",
        categoria: "clasico",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/adidas/adidas-2.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/adidas/adidas-2.jpeg"
        ],
        tallasDisponibles: [37, 38, 39, 40, 41, 42]
    },
    {
        id: 3,
        marca: "adidas",
        nombreModelo: "Adizero Negra",
        referencia: "AD-ADZ-NEG",
        precio: 279000,
        descripcion: "Zapatilla de entrenamiento ligera y transpirable en color negro.",
        categoria: "entrenamiento",
        destacado: true,
        imagenPrincipal: "../assets/imagenes/adidas/adidas-3.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/adidas/adidas-3.jpeg"
        ],
        tallasDisponibles: [39, 40, 41, 42, 43, 44]
    },
    {
        id: 4,
        marca: "adidas",
        nombreModelo: "Adizero Roja",
        referencia: "AD-ADZ-ROJ",
        precio: 279000,
        descripcion: "Adizero en color rojo vibrante. Diseño aerodinámico para corredores.",
        categoria: "entrenamiento",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/adidas/adidas-4.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/adidas/adidas-4.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42]
    },
    {
        id: 5,
        marca: "adidas",
        nombreModelo: "Adidas Dama Magma",
        referencia: "AD-DAM-MAG",
        precio: 269000,
        descripcion: "Modelo para dama con tonos magma y detalles modernos. Comodidad y estilo.",
        categoria: "dama",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/adidas/adidas-5.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/adidas/adidas-5.jpeg"
        ],
        tallasDisponibles: [36, 37, 38, 39, 40]
    },
    {
        id: 6,
        marca: "adidas",
        nombreModelo: "Terrex Negras Cabras",
        referencia: "AD-TER-NEG",
        precio: 289000,
        descripcion: "Zapatilla de trail con suela agresiva para terreno irregular. Color negro con detalles cabras.",
        categoria: "trail",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/adidas/adidas-6.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/adidas/adidas-6.jpeg"
        ],
        tallasDisponibles: [39, 40, 41, 42, 43, 44, 45]
    },

    // ===================== NEW BALANCE (5 productos, imágenes 1-5) =====================
    {
        id: 7,
        marca: "new-balance",
        nombreModelo: "New Balance 9060",
        referencia: "NB-9060",
        precio: 389000,
        descripcion: "Modelo premium con amortiguación avanzada y diseño retro-futurista.",
        categoria: "lifestyle",
        destacado: true,
        imagenPrincipal: "../assets/imagenes/new-balance/new-balance-1.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/new-balance/new-balance-1.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42, 43, 44]
    },
    {
        id: 8,
        marca: "new-balance",
        nombreModelo: "New Balance 530",
        referencia: "NB-530",
        precio: 349000,
        descripcion: "Clásica de running con upper de malla y detalle N en costados.",
        categoria: "clasico",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/new-balance/new-balance-2.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/new-balance/new-balance-2.jpeg"
        ],
        tallasDisponibles: [37, 38, 39, 40, 41, 42]
    },
    {
        id: 9,
        marca: "new-balance",
        nombreModelo: "New Balance 9060 Gris",
        referencia: "NB-9060-GRIS",
        precio: 389000,
        descripcion: "Versión gris de la 9060, estilo neutro y versátil.",
        categoria: "lifestyle",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/new-balance/new-balance-3.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/new-balance/new-balance-3.jpeg"
        ],
        tallasDisponibles: [39, 40, 41, 42, 43]
    },
    {
        id: 10,
        marca: "new-balance",
        nombreModelo: "New Balance 9060 Hombre",
        referencia: "NB-9060-HOM",
        precio: 389000,
        descripcion: "Talla y ajuste específico para hombre en la línea 9060.",
        categoria: "lifestyle",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/new-balance/new-balance-4.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/new-balance/new-balance-4.jpeg"
        ],
        tallasDisponibles: [40, 41, 42, 43, 44, 45]
    },
    {
        id: 11,
        marca: "new-balance",
        nombreModelo: "New Balance Genérico",
        referencia: "NB-GEN",
        precio: 299000,
        descripcion: "Modelo de entrada de New Balance con estilo clásico y comodidad.",
        categoria: "clasico",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/new-balance/new-balance-5.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/new-balance/new-balance-5.jpeg"
        ],
        tallasDisponibles: [36, 37, 38, 39, 40, 41, 42]
    },

    // ===================== NIKE SB (6 productos, imágenes 1-6) =====================
    {
        id: 12,
        marca: "nike-sb",
        nombreModelo: "Nike SB Blanco Cabras",
        referencia: "NK-SB-BW-CAB",
        precio: 299000,
        descripcion: "Zapatilla de skate con upper resistente y detalles en blanco y cabras.",
        categoria: "skate",
        destacado: true,
        imagenPrincipal: "../assets/imagenes/nike-sb/nike-sb-1.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/nike-sb/nike-sb-1.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42, 43]
    },
    {
        id: 13,
        marca: "nike-sb",
        nombreModelo: "Nike SB Gris Blanco Dama",
        referencia: "NK-SB-GW-DAM",
        precio: 299000,
        descripcion: "Modelo para dama en gris y blanco. Ajuste femenino y estilo skate.",
        categoria: "skate",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/nike-sb/nike-sb-2.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/nike-sb/nike-sb-2.jpeg"
        ],
        tallasDisponibles: [36, 37, 38, 39, 40]
    },
    {
        id: 14,
        marca: "nike-sb",
        nombreModelo: "Nike SB Negra Gris Negro",
        referencia: "NK-SB-NGN",
        precio: 299000,
        descripcion: "Todo negro con detalles gris. Diseño discreto para skate diario.",
        categoria: "skate",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/nike-sb/nike-sb-3.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/nike-sb/nike-sb-3.jpeg"
        ],
        tallasDisponibles: [39, 40, 41, 42, 43, 44]
    },
    {
        id: 15,
        marca: "nike-sb",
        nombreModelo: "Nike SB Negra Blanco",
        referencia: "NK-SB-NB",
        precio: 299000,
        descripcion: "Contraste negro y blanco clásico en la línea SB.",
        categoria: "skate",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/nike-sb/nike-sb-4.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/nike-sb/nike-sb-4.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42, 43]
    },
    {
        id: 16,
        marca: "nike-sb",
        nombreModelo: "Nike SB Luis Vuitton",
        referencia: "NK-SB-LV",
        precio: 459000,
        descripcion: "Edición especial inspirada en Luis Vuitton. Diseño exclusivo y premium.",
        categoria: "especial",
        destacado: true,
        imagenPrincipal: "../assets/imagenes/nike-sb/nike-sb-5.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/nike-sb/nike-sb-5.jpeg"
        ],
        tallasDisponibles: [40, 41, 42, 43, 44]
    },
    {
        id: 17,
        marca: "nike-sb",
        nombreModelo: "Nike SB Blanco Gris",
        referencia: "NK-SB-BG",
        precio: 299000,
        descripcion: "Blanco con detalles gris. Limpio y fácil de combinar.",
        categoria: "skate",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/nike-sb/nike-sb-6.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/nike-sb/nike-sb-6.jpeg"
        ],
        tallasDisponibles: [37, 38, 39, 40, 41, 42]
    },

    // ===================== ON RUNNING (3 productos, imágenes 1-3) =====================
    {
        id: 18,
        marca: "on-running",
        nombreModelo: "OnCloud",
        referencia: "ON-CLOUD",
        precio: 429000,
        descripcion: "Zapatilla running con tecnología CloudTec para amortiguación suave.",
        categoria: "running",
        destacado: true,
        imagenPrincipal: "../assets/imagenes/on-running/on-running-1.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/on-running/on-running-1.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42, 43, 44]
    },
    {
        id: 19,
        marca: "on-running",
        nombreModelo: "OnCloud Dama",
        referencia: "ON-CLOUD-DAM",
        precio: 429000,
        descripcion: "Versión OnCloud con ajuste específico para dama.",
        categoria: "running",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/on-running/on-running-2.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/on-running/on-running-2.jpeg"
        ],
        tallasDisponibles: [36, 37, 38, 39, 40]
    },
    {
        id: 20,
        marca: "on-running",
        nombreModelo: "OnCloud Extra",
        referencia: "ON-CLOUD-EXT",
        precio: 449000,
        descripcion: "Versión con amortiguación extra para largas distancias.",
        categoria: "running",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/on-running/on-running-3.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/on-running/on-running-3.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42]
    },

    // ===================== WIDER (3 productos, imágenes 1-3) =====================
    {
        id: 21,
        marca: "wider",
        nombreModelo: "Wider 55k",
        referencia: "WD-55K",
        precio: 189000,
        descripcion: "Línea accesible Wider 55k con estilo urbano y comodidad diaria.",
        categoria: "urbano",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/wider/wider-1.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/wider/wider-1.jpeg"
        ],
        tallasDisponibles: [37, 38, 39, 40, 41, 42]
    },
    {
        id: 22,
        marca: "wider",
        nombreModelo: "Wider 70k",
        referencia: "WD-70K",
        precio: 219000,
        descripcion: "Línea premium Wider 70k con materiales mejorados y diseño actual.",
        categoria: "urbano",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/wider/wider-2.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/wider/wider-2.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42, 43]
    },
    {
        id: 23,
        marca: "wider",
        nombreModelo: "Wider Pro",
        referencia: "WD-PRO",
        precio: 249000,
        descripcion: "Modelo profesional de Wider para uso diario intensivo.",
        categoria: "urbano",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/wider/wider-3.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/wider/wider-3.jpeg"
        ],
        tallasDisponibles: [39, 40, 41, 42, 43, 44]
    },

    // ===================== ARMANI EXCHANGE (2 productos, imágenes 1-2) =====================
    {
        id: 24,
        marca: "armani-exchange",
        nombreModelo: "AX Negra Suela Goma",
        referencia: "AX-NEG-GOM",
        precio: 529000,
        descripcion: "Modelo Armani Exchange negro con suela de goma. Elegancia urbana.",
        categoria: "premium",
        destacado: true,
        imagenPrincipal: "../assets/imagenes/armani-exchange/armani-exchange-1.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/armani-exchange/armani-exchange-1.jpeg"
        ],
        tallasDisponibles: [39, 40, 41, 42, 43]
    },
    {
        id: 25,
        marca: "armani-exchange",
        nombreModelo: "AX Blanca Suela Goma",
        referencia: "AX-BLANCA-GOM",
        precio: 529000,
        descripcion: "Modelo Armani Exchange blanco con suela de goma. Estilo minimalista.",
        categoria: "premium",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/armani-exchange/armani-exchange-2.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/armani-exchange/armani-exchange-2.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42]
    },

    // ===================== URBAN / PARIS (3 productos, imágenes 1-3) =====================
    {
        id: 26,
        marca: "urban-paris",
        nombreModelo: "Paris Cabras Zo Blancos",
        referencia: "UP-PAR-CZ-BW",
        precio: 169000,
        descripcion: "Calzado urbano estilo París en blanco con detalles cabras. Casual y versátil.",
        categoria: "casual",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/urban-paris/urban-paris-1.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/urban-paris/urban-paris-1.jpeg"
        ],
        tallasDisponibles: [37, 38, 39, 40, 41, 42]
    },
    {
        id: 27,
        marca: "urban-paris",
        nombreModelo: "Calzado Urbano General",
        referencia: "UP-URB-GEN",
        precio: 149000,
        descripcion: "Zapato urbano general para uso diario. Diseño sencillo y resistente.",
        categoria: "casual",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/urban-paris/urban-paris-2.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/urban-paris/urban-paris-2.jpeg"
        ],
        tallasDisponibles: [36, 37, 38, 39, 40, 41, 42, 43, 44]
    },
    {
        id: 28,
        marca: "urban-paris",
        nombreModelo: "Urban Casual Negro",
        referencia: "UP-URB-NEG",
        precio: 159000,
        descripcion: "Calzado urbano negro para ocasiones casuales y formales.",
        categoria: "casual",
        destacado: false,
        imagenPrincipal: "../assets/imagenes/urban-paris/urban-paris-3.jpeg",
        imagenesDetalle: [
            "../assets/imagenes/urban-paris/urban-paris-3.jpeg"
        ],
        tallasDisponibles: [38, 39, 40, 41, 42, 43]
    }
];

/**
 * Exporta los datos para uso en otros módulos.
 */
if (typeof window !== "undefined") {
    window.productosSemilla = productosSemilla;
}
