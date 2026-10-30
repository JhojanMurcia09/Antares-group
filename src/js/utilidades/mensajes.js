/**
 * Archivo: js/utilidades/mensajes.js
 * Descripción: Funciones helper para SweetAlert2. Todos los mensajes del sistema
 * utilizan SweetAlert en lugar de alert() nativo. Idioma: español.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

/**
 * Muestra un mensaje de éxito.
 * @param {string} titulo - Título de la alerta.
 * @param {string} texto - Cuerpo del mensaje.
 * @param {number} [tiempo=3000] - Tiempo de auto-cierre en milisegundos.
 */
function mostrarExito(titulo, texto, tiempo = 3000) {
    Swal.fire({
        icon: 'success',
        title: titulo,
        text: texto,
        timer: tiempo,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#10b981',
        color: '#ffffff',
        customClass: {
            popup: 'swal-exito'
        }
    });
}

/**
 * Muestra un mensaje de error.
 * @param {string} titulo - Título de la alerta.
 * @param {string} texto - Cuerpo del mensaje.
 */
function mostrarError(titulo, texto) {
    Swal.fire({
        icon: 'error',
        title: titulo,
        text: texto,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ef4444',
        background: '#171717',
        color: '#fafafa'
    });
}

/**
 * Muestra un mensaje de advertencia.
 * @param {string} titulo - Título de la alerta.
 * @param {string} texto - Cuerpo del mensaje.
 */
function mostrarAdvertencia(titulo, texto) {
    Swal.fire({
        icon: 'warning',
        title: titulo,
        text: texto,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b',
        background: '#171717',
        color: '#fafafa'
    });
}

/**
 * Muestra un mensaje informativo.
 * @param {string} titulo - Título de la alerta.
 * @param {string} texto - Cuerpo del mensaje.
 * @param {number} [tiempo=3000] - Tiempo de auto-cierre.
 */
function mostrarInfo(titulo, texto, tiempo = 3000) {
    Swal.fire({
        icon: 'info',
        title: titulo,
        text: texto,
        timer: tiempo,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        background: '#3b82f6',
        color: '#ffffff',
        customClass: {
            popup: 'swal-info'
        }
    });
}

/**
 * Muestra una confirmación antes de una acción destructiva.
 * @param {string} titulo - Título de la alerta.
 * @param {string} texto - Cuerpo del mensaje.
 * @param {Function} callbackConfirmar - Función a ejecutar si el usuario confirma.
 * @param {Function} [callbackCancelar] - Función a ejecutar si cancela.
 */
function confirmarAccion(titulo, texto, callbackConfirmar, callbackCancelar) {
    Swal.fire({
        icon: 'question',
        title: titulo,
        text: texto,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        background: '#171717',
        color: '#fafafa',
        reverseButtons: true
    }).then((resultado) => {
        if (resultado.isConfirmed) {
            if (typeof callbackConfirmar === 'function') callbackConfirmar();
        } else {
            if (typeof callbackCancelar === 'function') callbackCancelar();
        }
    });
}

/**
 * Muestra una alerta de carga mientras se procesa una acción.
 * @param {string} texto - Mensaje de carga.
 * @returns {Object} Instancia de SweetAlert para cerrar con swal.close().
 */
function mostrarCarga(texto = 'Procesando...') {
    return Swal.fire({
        title: texto,
        text: 'Por favor, espera.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        },
        background: '#171717',
        color: '#fafafa'
    });
}

/**
 * Cierra cualquier alerta de SweetAlert activa.
 */
function cerrarMensajes() {
    Swal.close();
}

/**
 * Expone las funciones globalmente para uso en HTML y otros módulos.
 */
if (typeof window !== "undefined") {
    window.mostrarExito = mostrarExito;
    window.mostrarError = mostrarError;
    window.mostrarAdvertencia = mostrarAdvertencia;
    window.mostrarInfo = mostrarInfo;
    window.confirmarAccion = confirmarAccion;
    window.mostrarCarga = mostrarCarga;
    window.cerrarMensajes = cerrarMensajes;
}
