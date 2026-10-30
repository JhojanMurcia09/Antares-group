/**
 * Archivo: js/core/app.js
 * Descripción: Punto de entrada de la aplicación Antares Store JM (v2.3 multi-página).
 * Inicializa la vitrina 360° del hero, el catálogo (solo en su página), el menú
 * móvil, el header-burbuja al hacer scroll, la burbuja flotante de WhatsApp,
 * los botones demo y el manejo de errores de imagen.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[Antares] Iniciando aplicación v2.3.0 (multi-página)...");

    let catalogError = null;
    try {
        window.productosSemilla = await window.ProductosApi.listar();
    } catch (error) {
        catalogError = error;
        window.productosSemilla = [];
        console.error("[Antares] No fue posible sincronizar el catálogo:", error);
        const imagenVitrina = document.getElementById("imagen-vitrina");
        const nombreVitrina = document.getElementById("nombre-vitrina");
        const precioVitrina = document.getElementById("precio-vitrina");
        if (imagenVitrina) imagenVitrina.src = "../assets/imagenes/placeholder.svg";
        if (nombreVitrina) nombreVitrina.textContent = "Catálogo no disponible";
        if (precioVitrina) precioVitrina.textContent = "";
        const grid = document.getElementById("bento-grid-productos");
        if (grid) {
            grid.innerHTML = "";
        } else {
            const aviso = document.createElement("p");
            aviso.className = "estado-error-api";
            aviso.setAttribute("role", "alert");
            aviso.textContent = `No se pudo conectar con el inventario. ${error.message}`;
            document.querySelector(".hero-cinematico")?.prepend(aviso);
        }
    }

    // ===== 1. Inicializar animaciones (nunca deja contenido invisible) =====
    if (window.MotionAnimations) {
        window.MotionAnimations.inicializar();
    }

    // ===== 2. Vitrina del hero: zapatos que cambian y giran 360° (solo index) =====
    if (
        window.Vitrina &&
        window.productosSemilla &&
        window.productosSemilla.length > 0 &&
        document.getElementById("vitrina-360")
    ) {
        window.Vitrina.inicializar(window.productosSemilla);
    }

    // ===== 2b. Lanzamientos de la página principal =====
    const gridLanzamientos = document.getElementById("grid-lanzamientos");
    if (gridLanzamientos && window.productosSemilla) {
        const productosLanzamiento = window.productosSemilla
            .filter(producto => producto.destacado)
            .slice(0, 6);

        productosLanzamiento.forEach(producto => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-lanzamiento";

            const imagen = document.createElement("img");
            imagen.className = "tarjeta-lanzamiento-imagen";
            imagen.src = producto.imagenPrincipal;
            imagen.alt = producto.nombreModelo;
            imagen.loading = "lazy";
            imagen.onerror = () => {
                imagen.onerror = null;
                imagen.src = "../assets/imagenes/placeholder.svg";
            };

            const informacion = document.createElement("div");
            informacion.className = "tarjeta-lanzamiento-info";

            const marca = document.createElement("span");
            marca.className = "tarjeta-lanzamiento-marca";
            marca.textContent = window.obtenerNombreMarca(producto.marca);

            const nombre = document.createElement("h3");
            nombre.textContent = producto.nombreModelo;

            const precio = document.createElement("span");
            precio.className = "tarjeta-lanzamiento-precio";
            let promocion = null;
            if (producto.promocionActiva) {
                precio.innerHTML = `<del>${window.formatearPrecio(producto.precio)}</del> <strong>${window.formatearPrecio(producto.precioPromocion)}</strong>`;
                promocion = document.createElement("span");
                promocion.className = "badge-promocion";
                promocion.textContent = producto.etiquetaPromocion;
            } else {
                precio.textContent = window.formatearPrecio(producto.precio);
            }

            const selectorTalla = document.createElement("select");
            selectorTalla.setAttribute("aria-label", `Seleccionar talla para ${producto.nombreModelo}`);
            selectorTalla.innerHTML = producto.tallasDisponibles.length
                ? '<option value="">Elige tu talla</option>'
                : '<option value="">Agotado</option>';
            selectorTalla.disabled = producto.tallasDisponibles.length === 0;
            producto.tallasDisponibles.forEach(talla => {
                const opcion = document.createElement("option");
                opcion.value = talla;
                opcion.textContent = `Talla ${talla}`;
                selectorTalla.appendChild(opcion);
            });

            const acciones = document.createElement("div");
            acciones.className = "tarjeta-lanzamiento-acciones";

            const enlaceDetalle = document.createElement("a");
            enlaceDetalle.className = "accion-detalle";
            enlaceDetalle.href = `../html/producto.html?producto=${encodeURIComponent(producto.referencia)}`;
            enlaceDetalle.textContent = "Ver modelo";

            const botonAgregar = document.createElement("button");
            botonAgregar.className = "accion-agregar";
            botonAgregar.type = "button";
            botonAgregar.textContent = "Añadir al carrito";
            botonAgregar.disabled = producto.tallasDisponibles.length === 0;
            botonAgregar.addEventListener("click", () => {
                const talla = Number(selectorTalla.value);
                if (!talla) {
                    window.notificarMotion("advertencia", "Elige una talla", "Selecciona una talla disponible para continuar.");
                    selectorTalla.focus();
                    return;
                }
                Carrito.agregarProducto(producto, talla);
            });

            informacion.append(marca, nombre);
            if (promocion) informacion.appendChild(promocion);
            informacion.append(precio, selectorTalla);
            acciones.append(enlaceDetalle, botonAgregar);
            tarjeta.append(imagen, informacion, acciones);
            gridLanzamientos.appendChild(tarjeta);
        });
    }

    // ===== 3. Catálogo con datos semilla (solo en la página independiente del catálogo) =====
    if (
        window.productosSemilla &&
        window.Catalogo &&
        document.getElementById("bento-grid-productos")
    ) {
        window.Catalogo.inicializar(window.productosSemilla);
    }
    if (catalogError) {
        const estado = document.getElementById("estado-vacio");
        if (estado) {
            estado.style.display = "flex";
            estado.setAttribute("role", "alert");
            estado.textContent = `No se pudo conectar con el inventario. ${catalogError.message}`;
        }
    }

    // ===== 4. Menú hamburguesa (móvil) =====
    const botonHamburguesa = document.getElementById("boton-menu-hamburguesa");
    const menu = document.getElementById("menu-navegacion");

    if (botonHamburguesa && menu) {
        botonHamburguesa.addEventListener("click", () => {
            const estaAbierto = menu.classList.toggle("abierto");
            botonHamburguesa.classList.toggle("activo");

            botonHamburguesa.setAttribute(
                "aria-label",
                estaAbierto ? "Cerrar menú" : "Abrir menú"
            );

            // Animar las barras del menú hamburguesa
            const icono = botonHamburguesa.querySelector("[data-lucide]");
            if (icono) {
                icono.setAttribute("data-lucide", estaAbierto ? "x" : "menu");
                if (window.lucide) lucide.createIcons();
            }
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll(".enlace-menu").forEach((enlace) => {
            enlace.addEventListener("click", () => {
                menu.classList.remove("abierto");
                botonHamburguesa.classList.remove("activo");
                botonHamburguesa.setAttribute("aria-label", "Abrir menú");
            });
        });
    }

    // ===== 5. Header-burbuja: sigue la pantalla y se recoge al bajar =====
    const header = document.getElementById("header-principal");
    if (header) {
        let yaContraido = null;

        const actualizarHeader = () => {
            const contraido = window.scrollY > 60;
            if (contraido !== yaContraido) {
                yaContraido = contraido;
                header.classList.toggle("contraido", contraido);
            }
        };

        actualizarHeader();
        window.addEventListener("scroll", actualizarHeader, { passive: true });
    }

    // ===== 6. Tarjetas de marcas → página del catálogo con pre-filtro =====
    document.querySelectorAll(".tarjeta-marca").forEach((tarjeta) => {
        tarjeta.addEventListener("click", () => {
            const marca = tarjeta.dataset.marca || "todos";
            window.location.href =
                "../html/catalogo.html?marca=" + encodeURIComponent(marca);
        });
    });

    // ===== 7. Acciones de contacto por WhatsApp =====
    function abrirWhatsAppGeneral() {
        if (typeof window.enviarMensajeGeneralWhatsapp === "function") {
            window.enviarMensajeGeneralWhatsapp();
        } else if (typeof window.mostrarError === "function") {
            window.mostrarError("WhatsApp no disponible", "No se pudo cargar el servicio de WhatsApp. Recarga la página e inténtalo de nuevo.");
        }
    }

    const botonComprarHero = document.getElementById("boton-comprar-hero");
    if (botonComprarHero) {
        botonComprarHero.addEventListener("click", abrirWhatsAppGeneral);
    }

    const enlaceContactoWhatsapp = document.getElementById("enlace-contacto-whatsapp");
    if (enlaceContactoWhatsapp) {
        enlaceContactoWhatsapp.addEventListener("click", (evento) => {
            evento.preventDefault();
            abrirWhatsAppGeneral();
        });
    }

    // ===== 8. Burbuja flotante de WhatsApp (inf inferior derecha, sigue la pantalla) =====
    const burbujaWhatsapp = document.getElementById("burbuja-whatsapp");
    if (burbujaWhatsapp) {
        burbujaWhatsapp.addEventListener("click", () => {
            if (typeof window.enviarMensajeGeneralWhatsapp === "function") {
                window.enviarMensajeGeneralWhatsapp();
            } else if (typeof window.mostrarError === "function") {
                window.mostrarError("WhatsApp no disponible", "No se pudo cargar el servicio de WhatsApp. Recarga la página e inténtalo de nuevo.");
            }
        });
    }

    // ===== 9. Manejo de errores de imagen global (placeholder + anti-bucle) =====
    document.addEventListener("error", (evento) => {
        if (
            evento.target &&
            evento.target.tagName === "IMG" &&
            !evento.target.dataset.errorFallback
        ) {
            evento.target.dataset.errorFallback = "1";
            evento.target.src = "../assets/imagenes/placeholder.svg";
            evento.target.alt = "Imagen no disponible";
        }
    }, true);

    console.log("[Antares] Aplicación lista. Header-burbuja, vitrina y burbuja de WhatsApp activos.");
});
