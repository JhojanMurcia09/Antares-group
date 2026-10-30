/**
 * Archivo: js/utilidades/formato.js
 * Descripción: Utilidades de formateo para precios y textos en español.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

/**
 * Formatea un precio numérico a moneda colombiana (COP) en español.
 * @param {number} precio - Valor numérico del precio.
 * @returns {string} Precio formateado, ej. "$249.000"
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

/**
 * Formatea el nombre de una marca para mostrar en interfaz.
 * @param {string} marca - Identificador de la marca en inglés (ej. "adidas").
 * @returns {string} Nombre legible en español.
 */
function obtenerNombreMarca(marca) {
    const nombres = {
        "adidas": "Adidas",
        "new-balance": "New Balance",
        "nike-sb": "Nike SB",
        "on-running": "On Running",
        "wider": "Wider",
        "armani-exchange": "Armani Exchange",
        "urban-paris": "Urban / Paris",
        "todos": "Todas las marcas"
    };
    return nombres[marca] || marca;
}

/**
 * Genera el mensaje pre-armado para WhatsApp en español.
 * @param {object} producto - Objeto del producto seleccionado.
 * @param {number} talla - Talla seleccionada.
 * @returns {string} Texto del mensaje codificado para URL.
 */
function generarMensajeWhatsApp(producto, talla, cantidad = 1) {
    const precio = producto.precioFinal || producto.precio;
    const mensaje = `Hola, me interesa comprar las ${producto.nombreModelo}, ref: ${producto.referencia}, talla ${talla}, cantidad ${cantidad}. Precio unitario: ${formatearPrecio(precio)}.`;
    return encodeURIComponent(mensaje);
}

if (typeof window !== "undefined") {
    window.formatearPrecio = formatearPrecio;
    window.obtenerNombreMarca = obtenerNombreMarca;
    window.generarMensajeWhatsApp = generarMensajeWhatsApp;
}
