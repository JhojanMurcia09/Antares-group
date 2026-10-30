/**
 * Archivo: js/componentes/motion-animations.js
 * Descripción: Animaciones de Motion One para Antares Store JM.
 * Estrategia a prueba de fallos:
 *   1. El contenido NUNCA queda invisible: los elementos revelan con la
 *      clase CSS .visible (transición CSS nativa).
 *   2. Motion One (CDN) es solo una MEJORA visual opcional.
 *   3. Todas las llamadas a Motion están protegidas con guardas y try/catch.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

const MotionAnimations = (function() {

    let yaInicializado = false;

    // Elementos que empiezan ocultos en CSS (opacity: 0) y deben revelarse
    const SELECTORES_REVEAL = ".motion-entrada, .hero-contenido-motion, .hero-imagen-motion, .menu-item-motion, .tarjeta-motion, .reveal-scroll";

    /**
     * Indica si Motion One está disponible y expone su API correctamente.
     * @returns {boolean}
     */
    function tieneMotion() {
        return (
            typeof window.Motion !== "undefined" &&
            typeof window.Motion.animate === "function"
        );
    }

    /**
     * Revela un elemento agregando la clase CSS .visible (transición CSS).
     * @param {HTMLElement} elemento
     */
    function revelarElemento(elemento) {
        if (elemento && !elemento.classList.contains("visible")) {
            elemento.classList.add("visible");
        }
    }

    /**
     * Red de seguridad: revela todos los elementos con clase de reveal.
     */
    function revelarTodo() {
        document.querySelectorAll(SELECTORES_REVEAL).forEach(revelarElemento);
    }

    /**
     * Anima un elemento con Motion One. Si Motion no está disponible,
     * revela el elemento con CSS para que NUNCA quede invisible.
     * @param {HTMLElement} elemento - Elemento animado.
     * @param {object} keyframes - Fotogramas de la animación.
     * @param {object} opciones - Opciones (duración, retardo, easing).
     */
    function animar(elemento, keyframes, opciones) {
        if (!elemento) return;
        if (!tieneMotion()) {
            revelarElemento(elemento);
            return;
        }
        try {
            window.Motion.animate(elemento, keyframes, opciones);
        } catch (error) {
            console.warn("[MotionAnimations] La animación falló, revelando con CSS:", error);
            revelarElemento(elemento);
        }
    }

    /**
     * Anima el contenido del hero (título, subtítulo, CTA y modelo insignia).
     */
    function animarHero() {
        const contenido = document.querySelector(".hero-contenido-motion");
        const imagen = document.querySelector(".hero-imagen-motion");

        animar(contenido, {
            opacity: [0, 1],
            y: [40, 0]
        }, {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.2
        });

        animar(imagen, {
            opacity: [0, 1],
            scale: [0.9, 1],
            rotateX: [10, 0]
        }, {
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.5
        });
    }

    /**
     * Anima las tarjetas del catálogo con entrada escalonada.
     */
    function animarTarjetasCatalogo() {
        const tarjetas = document.querySelectorAll(".tarjeta-motion");
        tarjetas.forEach((tarjeta, index) => {
            animar(tarjeta, {
                opacity: [0, 1],
                scale: [0.92, 1]
            }, {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                delay: index * 0.06
            });
        });
    }

    /**
     * Anima los items del menú de navegación con entrada escalonada.
     */
    function animarMenu() {
        const items = document.querySelectorAll(".menu-item-motion");
        items.forEach((item, index) => {
            animar(item, {
                opacity: [0, 1],
                x: [-20, 0]
            }, {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                delay: index * 0.08
            });
        });
    }

    /**
     * Revela las secciones al hacer scroll (IntersectionObserver).
     * La clase .visible activa la transición CSS: siempre visible.
     */
    function animarSeccionesScroll() {
        const secciones = document.querySelectorAll(".reveal-scroll");

        if (!("IntersectionObserver" in window)) {
            revelarTodo();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revelarElemento(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        secciones.forEach((seccion) => observer.observe(seccion));
    }

    /**
     * Red de seguridad absoluta: después de 2,5 segundos, todo elemento
     * que esté dentro del viewport pero aún oculto se revela.
     * Garantiza que nunca exista una pantalla en negro.
     */
    function redDeSeguridad() {
        setTimeout(() => {
            document.querySelectorAll(SELECTORES_REVEAL).forEach((elemento) => {
                if (elemento.classList.contains("visible")) return;
                const rect = elemento.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    revelarElemento(elemento);
                }
            });
        }, 2500);
    }

    /**
     * Agrega la clase CSS que habilita la rotación 360° (eje X) del producto.
     * El evento de clic lo maneja catalogo.js (para no duplicar listeners).
     */
    function inicializarRotacion360() {
        document.querySelectorAll(".tarjeta-producto .imagen-producto").forEach((imagen) => {
            imagen.classList.add("rotacion-360");
        });
    }

    /**
     * Inicializa todas las animaciones de la página. Solo corre una vez.
     */
    function inicializar() {
        if (yaInicializado) return;
        yaInicializado = true;

        if (!tieneMotion()) {
            console.warn("[MotionAnimations] Motion One no cargó: se usan transiciones CSS. El contenido se muestra igual.");
        }

        animarHero();
        animarMenu();
        animarTarjetasCatalogo();
        animarSeccionesScroll();
        inicializarRotacion360();
        redDeSeguridad();

        console.log("[MotionAnimations] Animaciones de Motion inicializadas.");
    }

    /**
     * Anima un botón con efecto de pulsación al hacer clic (opcional).
     * @param {HTMLElement} boton - Elemento del botón.
     */
    function animarClicBoton(boton) {
        if (!boton || !tieneMotion()) return;
        try {
            window.Motion.animate(boton, {
                scale: [1, 0.95, 1]
            }, {
                duration: 0.2
            });
        } catch (error) { /* La pulsación es decorativa: falla en silencio. */ }
    }

    /**
     * Notificación con SweetAlert2 y estilos de Motion.
     * @param {string} tipo - Tipo: exito, error, advertencia, info.
     * @param {string} titulo - Título.
     * @param {string} texto - Cuerpo.
     */
    function notificar(tipo, titulo, texto) {
        const configuracion = {
            exito: {
                icon: "success",
                color: "#ffffff",
                background: "#10b981",
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            },
            error: {
                icon: "error",
                color: "#fafafa",
                background: "#171717",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#ef4444"
            },
            advertencia: {
                icon: "warning",
                color: "#fafafa",
                background: "#171717",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#f59e0b"
            },
            info: {
                icon: "info",
                color: "#ffffff",
                background: "#3b82f6",
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            }
        };

        const cfg = configuracion[tipo] || configuracion.info;

        if (typeof window.Swal === "undefined") {
            console.log("[Notificación]", tipo, titulo, texto);
            return;
        }

        window.Swal.fire({
            ...cfg,
            title: titulo,
            text: texto
        });
    }

    return {
        inicializar,
        revelarTodo,
        animarHero,
        animarTarjetasCatalogo,
        animarMenu,
        animarSeccionesScroll,
        inicializarRotacion360,
        animarClicBoton,
        notificar
    };
})();

if (typeof window !== "undefined") {
    window.MotionAnimations = MotionAnimations;
    window.notificarMotion = MotionAnimations.notificar;
}
