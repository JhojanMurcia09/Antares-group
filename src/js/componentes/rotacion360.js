/**
 * Archivo: js/componentes/rotacion360.js
 * Descripción: Controla la rotación 360° en eje X de los modelos de calzado.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

const Rotacion360 = (function() {
    /**
     * Inicializa la rotación automática del modelo insignia en el hero.
     */
    function inicializarModeloInsignia() {
        const caja = document.getElementById("caja-rotacion-insignia");
        if (!caja) return;

        // La rotación continua se maneja por CSS (@keyframes rotar-eje-x).
        // Aquí podemos agregar controles manuales si se requieren en el futuro.
        console.log("[Rotacion360] Modelo insignia inicializado con rotación eje X.");
    }

    /**
     * Activa rotación manual al hacer clic en una tarjeta de producto.
     * @param {HTMLElement} tarjeta - Elemento DOM de la tarjeta.
     */
    function activarRotacionTarjeta(tarjeta) {
        const imagen = tarjeta.querySelector(".imagen-producto");
        if (!imagen) return;

        imagen.classList.toggle("rotacion-producto");
    }

    return {
        inicializarModeloInsignia,
        activarRotacionTarjeta
    };
})();

if (typeof window !== "undefined") {
    window.Rotacion360 = Rotacion360;
}
