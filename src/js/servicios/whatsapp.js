/**
 * Archivo: js/servicios/whatsapp.js
 * Descripción: Integración con WhatsApp para el flujo de compra directa.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

/**
 * Número de WhatsApp de la tienda Antares Store JM.
 * Código de país y número, sin signo '+' ni espacios.
 */
const NUMERO_WHATSAPP = "573225840218";

/**
 * Valida que el número de WhatsApp esté configurado correctamente.
 * @returns {boolean}
 */
function numeroWhatsAppValido() {
    return /^\d{10,15}$/.test(NUMERO_WHATSAPP);
}

/**
 * Mensaje de modo demostración (número pendiente de configurar).
 */
function alertarWhatsAppDemostracion() {
    if (typeof window.notificarMotion === "function") {
        window.notificarMotion("info", "Modo demostración",
            "El número de WhatsApp de la tienda aún no está configurado. Muy pronto podrás comprar directamente por WhatsApp.");
        return;
    }
    if (typeof mostrarAdvertencia === "function") {
        mostrarAdvertencia("Modo demostración",
            "El número de WhatsApp de la tienda aún no está configurado. Muy pronto podrás comprar directamente por WhatsApp.");
    }
}

/**
 * Abre WhatsApp con el mensaje pre-armado del producto y talla seleccionada.
 * @param {object} producto - Objeto producto.
 * @param {number} talla - Talla seleccionada por el cliente.
 */
function enviarPorWhatsapp(producto, talla, cantidad = 1) {
    if (!numeroWhatsAppValido()) {
        alertarWhatsAppDemostracion();
        return;
    }

    const mensaje = generarMensajeWhatsApp(producto, talla, cantidad);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;

    mostrarCarga("Abriendo WhatsApp...");
    setTimeout(() => {
        cerrarMensajes();
        window.open(url, "_blank");
    }, 800);
}

/**
 * Abre WhatsApp con un mensaje general de bienvenida (burbuja flotante).
 */
function enviarMensajeGeneralWhatsapp() {
    if (!numeroWhatsAppValido()) {
        alertarWhatsAppDemostracion();
        return;
    }

    const mensaje = encodeURIComponent(
        "Hola, quiero información sobre los zapatos de Antares Store JM."
    );
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;

    mostrarCarga("Abriendo WhatsApp...");
    setTimeout(() => {
        cerrarMensajes();
        window.open(url, "_blank");
    }, 800);
}

/**
 * Expone las funciones globalmente para uso en botones HTML.
 */
if (typeof window !== "undefined") {
    window.enviarPorWhatsapp = enviarPorWhatsapp;
    window.enviarMensajeGeneralWhatsapp = enviarMensajeGeneralWhatsapp;
    window.numeroWhatsAppValido = numeroWhatsAppValido;
}
