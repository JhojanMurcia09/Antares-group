/**
 * Archivo: js/componentes/vitrina.js
 * Descripción: Vitrina del hero: muestra los zapatos destacados girando en
 * 360° (eje X al hacer clic) y cambiando automáticamente (volteo con blur).
 * Los puntos permiten saltar a un modelo. Se pausa si la pestaña no está visible.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

const Vitrina = (function() {
    let destacados = [];
    let indiceActual = 0;
    let temporizador = null;
    let girandoAhora = false;

    const DURACION_CAMBIO_MS = 420;
    const INTERVALO_CAMBIO_MS = 4200;

    /**
     * Inicializa la vitrina con los productos destacados del catálogo.
     * @param {Array} datosProductos - Array productosSemilla.
     */
    function inicializar(datosProductos) {
        const contenedor = document.getElementById("vitrina-360");
        if (!contenedor || !Array.isArray(datosProductos)) return;

        destacados = datosProductos.filter(p => p.destacado).slice(0, 6);
        if (destacados.length === 0) {
            destacados = datosProductos.slice(0, 5);
        }

        const imagen = document.getElementById("imagen-vitrina");

        // Presentar el primer zapato sin animación
        indiceActual = 0;
        pintar(destacados[0], false);
        pintarPuntos();

        // Ciclo automático (pausado si la pestaña no está visible)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                detener();
            } else {
                iniciar();
            }
        });
        iniciar();

        // Giro manual completo 360° (eje X) al hacer clic en el zapato
        if (imagen) {
            imagen.addEventListener("click", () => {
                girarCompleto(imagen);
            });
        }

        console.log("[Vitrina] Inicializada con", destacados.length, "modelos destacados.");
    }

    /**
     * Inicia (o reinicia) el cambio automático de zapatos.
     */
    function iniciar() {
        detener();
        temporizador = setInterval(avanzar, INTERVALO_CAMBIO_MS);
    }

    /**
     * Detiene el cambio automático.
     */
    function detener() {
        if (temporizador) {
            clearInterval(temporizador);
            temporizador = null;
        }
    }

    /**
     * Avanza al siguiente zapato destacado con animación de volteo.
     */
    function avanzar() {
        if (girandoAhora || destacados.length === 0) return;
        girandoAhora = true;
        indiceActual = (indiceActual + 1) % destacados.length;
        pintar(destacados[indiceActual], true);
        pintarPuntos();
        setTimeout(() => {
            girandoAhora = false;
        }, DURACION_CAMBIO_MS);
    }

    /**
     * Muestra un producto en la vitrina (con o sin animación de volteo).
     * @param {object} producto - Producto destacado.
     * @param {boolean} conAnimacion
     */
    function pintar(producto, conAnimacion) {
        const imagen = document.getElementById("imagen-vitrina");
        const nombre = document.getElementById("nombre-vitrina");
        const precio = document.getElementById("precio-vitrina");
        const promocion = document.getElementById("badge-oferta-vitrina");
        if (!imagen || !producto) return;

        const aplicar = () => {
            imagen.src = producto.imagenPrincipal;
            imagen.alt = producto.nombreModelo;
            imagen.classList.remove("vitrina-girando");
            if (nombre) nombre.textContent = producto.nombreModelo;
            if (precio) {
                const precioBase = (typeof formatearPrecio === "function")
                    ? formatearPrecio(producto.precio)
                    : `$ ${producto.precio.toLocaleString("es-CO")}`;
                const precioOferta = (typeof formatearPrecio === "function")
                    ? formatearPrecio(producto.precioPromocion)
                    : `$ ${Number(producto.precioPromocion).toLocaleString("es-CO")}`;
                precio.innerHTML = producto.promocionActiva
                    ? `<del>${precioBase}</del> <strong>${precioOferta}</strong>`
                    : precioBase;
            }
            if (promocion) {
                promocion.hidden = !producto.promocionActiva;
                promocion.textContent = producto.promocionActiva ? producto.etiquetaPromocion : "";
            }

            // El chip "Ver detalle" lleva al Quick View exacto de ese modelo
            const enlaceDetalle = document.querySelector("#chip-precio-vitrina .enlace-vitrina");
            if (enlaceDetalle) {
                enlaceDetalle.href =
                    "../html/catalogo.html?producto=" + encodeURIComponent(producto.referencia);
            }
        };

        if (conAnimacion) {
            imagen.classList.add("vitrina-girando");
            setTimeout(aplicar, DURACION_CAMBIO_MS);
        } else {
            aplicar();
        }
    }

    /**
     * Renderiza los puntos de navegación según los modelos destacados.
     */
    function pintarPuntos() {
        const contenedor = document.getElementById("puntos-vitrina");
        if (!contenedor) return;

        contenedor.innerHTML = "";
        destacados.forEach((producto, i) => {
            const punto = document.createElement("button");
            punto.type = "button";
            punto.className = `punto-vitrina ${i === indiceActual ? "activo" : ""}`;
            punto.setAttribute("aria-label", `Ver ${producto.nombreModelo}`);
            punto.addEventListener("click", () => {
                detener();
                girandoAhora = false;
                indiceActual = i;
                pintar(producto, true);
                pintarPuntos();
                iniciar();
            });
            contenedor.appendChild(punto);
        });
    }

    /**
     * Giro completo manual de 360° en eje X al hacer clic.
     * @param {HTMLElement} imagen
     */
    function girarCompleto(imagen) {
        imagen.classList.remove("vitrina-girando");
        imagen.classList.add("girando-360");
        setTimeout(() => {
            imagen.classList.remove("girando-360");
        }, 1000);
    }

    return {
        inicializar
    };
})();

if (typeof window !== "undefined") {
    window.Vitrina = Vitrina;
}
