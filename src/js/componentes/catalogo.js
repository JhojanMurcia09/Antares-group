/**
 * Archivo: js/componentes/catalogo.js
 * Descripción: Renderiza el catálogo de productos, filtra por marca y gestiona el modal Quick View.
 * Integra animaciones de Motion One para tarjetas y rotación 360°.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

const Catalogo = (function() {
    let productos = [];
    let productoSeleccionado = null;
    let tallaSeleccionada = null;
    let marcaActiva = "todos";
    let textoBusqueda = "";
    let ordenSeleccionado = "destacados";

    const contenedorGrid = document.getElementById("bento-grid-productos");
    const estadoVacio = document.getElementById("estado-vacio");
    const botonesFiltro = document.querySelectorAll(".boton-filtro");
    const campoBusqueda = document.getElementById("busqueda-catalogo");
    const selectorOrden = document.getElementById("ordenar-productos");

    // Elementos del modal
    const modal = document.getElementById("modal-vista-rapida");
    const overlay = document.getElementById("overlay-modal");
    const botonCerrar = document.getElementById("boton-cerrar-modal");
    const imagenPrincipalModal = document.getElementById("imagen-principal-modal");
    const contenedorMiniaturas = document.getElementById("miniaturas-modal");
    const nombreModal = document.getElementById("nombre-producto-modal");
    const referenciaModal = document.getElementById("referencia-producto-modal");
    const precioModal = document.getElementById("precio-producto-modal");
    const contenedorTallas = document.getElementById("seleccion-talla-modal");
    const descripcionModal = document.getElementById("descripcion-modal");
    const botonWhatsappModal = document.getElementById("boton-whatsapp-modal");
    const botonAgregarCarrito = document.getElementById("boton-agregar-carrito-modal");

    /**
     * Inicializa el catálogo con los datos semilla.
     * También agrega la cantidad de modelos a cada botón de filtro.
     */
    function inicializar(datosProductos) {
        productos = datosProductos || [];
        agregarConteosFiltros();
        configurarFiltros();
        configurarModal();
        configurarBusquedaYOrden();

        // Pre-filtro desde la URL (?marca=adidas) al llegar desde las tarjetas de marcas
        let filtroInicial = "todos";
        const parametrosUrl = new URLSearchParams(window.location.search);
        const marcaUrl = parametrosUrl.get("marca");
        if (marcaUrl && (marcaUrl === "todos" || productos.some(p => p.marca === marcaUrl))) {
            filtroInicial = marcaUrl;
            botonesFiltro.forEach(boton => {
                boton.classList.toggle("activo", boton.dataset.marca === filtroInicial);
            });
        }

        filtrarPorMarca(filtroInicial);

        // Producto directo desde la URL (?producto=REF) → abre la vista rápida
        const referenciaUrl = parametrosUrl.get("producto");
        if (referenciaUrl) {
            const productoUrl = productos.find(
                p => p.referencia.toLowerCase() === referenciaUrl.toLowerCase()
            );
            if (productoUrl) {
                setTimeout(() => abrirModal(productoUrl), 600);
            }
        }

        // Rotación del modelo insignia (solo si la página tiene la caja 360°)
        if (typeof Rotacion360 !== "undefined" && Rotacion360.inicializarModeloInsignia) {
            Rotacion360.inicializarModeloInsignia();
        }

        console.log("[Catalogo] Catálogo inicializado con", productos.length, "productos. Filtro inicial:", filtroInicial);
    }

    /**
     * Agrega el número de modelos disponibles a cada botón de filtro.
     */
    function agregarConteosFiltros() {
        botonesFiltro.forEach(boton => {
            const marca = boton.dataset.marca;
            const cantidad = marca === "todos"
                ? productos.length
                : productos.filter(p => p.marca === marca).length;
            const nombre = (typeof obtenerNombreMarca === "function")
                ? obtenerNombreMarca(marca)
                : marca;
            boton.textContent = `${nombre} (${cantidad})`;
        });
    }

    /**
     * Renderiza las tarjetas de producto en el bento grid con animaciones Motion.
     * @param {Array} lista - Array de productos a mostrar.
     */
    function renderizarProductos(lista) {
        if (!contenedorGrid) return;

        contenedorGrid.innerHTML = "";

        if (lista.length === 0) {
            if (estadoVacio) estadoVacio.style.display = "flex";
            return;
        }
        if (estadoVacio) estadoVacio.style.display = "none";

        lista.forEach((producto, index) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-producto tarjeta-motion entrada-suave";
            tarjeta.style.animationDelay = `${index * 0.1}s`;
            tarjeta.dataset.id = producto.id;
            tarjeta.dataset.marca = producto.marca;

            const tallasHTML = producto.tallasDisponibles
                .map(t => `<button class="pildora-talla" type="button" data-talla="${t}" aria-label="Seleccionar talla ${t}">${t}</button>`)
                .join("");

            const nombreMarca = (typeof obtenerNombreMarca === "function")
                ? obtenerNombreMarca(producto.marca)
                : producto.marca;

            const precioHTML = producto.promocionActiva
                ? `<span class="precio-anterior">${formatearPrecio(producto.precio)}</span><strong>${formatearPrecio(producto.precioPromocion)}</strong>`
                : formatearPrecio(producto.precio);
            tarjeta.innerHTML = `
                <div class="contenedor-imagen-producto rotacion-producto">
                    <div class="sombra-elevacion"></div>
                    ${producto.destacado ? '<span class="badge-destacado"><i data-lucide="sparkles"></i>Destacado</span>' : ""}
                    ${producto.promocionActiva ? `<span class="badge-promocion">${escaparHTML(producto.etiquetaPromocion || "Oferta")}</span>` : ""}
                    <img src="${escaparHTML(producto.imagenPrincipal)}" alt="${escaparHTML(producto.nombreModelo)}" class="imagen-producto rotacion-360" loading="lazy" onerror="this.onerror=null;this.src='../assets/imagenes/placeholder.svg'">
                    <button class="boton-vista-rapida" type="button" title="Vista rápida">
                        <i data-lucide="eye"></i>
                        Vista rápida
                    </button>
                </div>
                <div class="informacion-producto">
                    <div class="marca-producto">${escaparHTML(nombreMarca)}</div>
                    <h3 class="nombre-modelo">${escaparHTML(producto.nombreModelo)}</h3>
                    <p class="precio-producto ${producto.promocionActiva ? "precio-en-oferta" : ""}">${precioHTML}</p>
                    <div class="contenedor-pildoras-talla">
                        ${tallasHTML || '<span class="sin-stock">Sin tallas disponibles</span>'}
                    </div>
                </div>
                <div class="acciones-tarjeta-producto">
                    <a href="producto.html?producto=${encodeURIComponent(producto.referencia)}" class="enlace-ficha-tarjeta">
                        Ver ficha
                    </a>
                    <button class="boton-agregar-tarjeta" type="button" disabled>
                        Añadir
                    </button>
                </div>
            `;

            // Rotación 360° eje X al hacer clic en la tarjeta
            tarjeta.addEventListener("click", (e) => {
                if (e.target.closest(".pildora-talla") || e.target.closest(".boton-vista-rapida")) return;
                if (e.target.closest(".acciones-tarjeta-producto")) return;
                const imagen = tarjeta.querySelector(".imagen-producto");
                if (!imagen) return;
                imagen.classList.toggle("activa");
                setTimeout(() => imagen.classList.remove("activa"), 800);
            });

            // Eventos de píldoras de talla en la tarjeta
            const pildoras = tarjeta.querySelectorAll(".pildora-talla");
            let tallaTarjeta = null;
            pildoras.forEach(pildora => {
                pildora.addEventListener("click", (e) => {
                    e.stopPropagation();
                    pildoras.forEach(p => p.classList.remove("seleccionada"));
                    pildora.classList.add("seleccionada");
                    tallaTarjeta = Number(pildora.dataset.talla);
                    botonAgregarTarjeta.disabled = false;
                });
            });

            // Botón "Vista rápida": abre el modal con UN solo clic
            const botonVistaRapida = tarjeta.querySelector(".boton-vista-rapida");
            if (botonVistaRapida) {
                botonVistaRapida.addEventListener("click", (e) => {
                    e.stopPropagation();
                    abrirModal(producto);
                });
            }

            const botonAgregarTarjeta = tarjeta.querySelector(".boton-agregar-tarjeta");
            botonAgregarTarjeta.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!tallaTarjeta) {
                    window.notificarMotion("advertencia", "Elige una talla", "Selecciona la talla disponible antes de agregar el modelo.");
                    return;
                }
                Carrito.agregarProducto(producto, tallaTarjeta);
            });

            // Doble clic también abre el modal ( gesto rápido)
            tarjeta.addEventListener("dblclick", () => abrirModal(producto));
            contenedorGrid.appendChild(tarjeta);
        });

        // Activar animaciones de Motion para las tarjetas recién creadas
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }

        if (window.MotionAnimations) {
            window.MotionAnimations.animarTarjetasCatalogo();
        }
    }

    /**
     * Filtra productos por marca.
     * @param {string} marca - Identificador de la marca o "todos".
     */
    function filtrarPorMarca(marca) {
        marcaActiva = marca;
        const termino = textoBusqueda.trim().toLocaleLowerCase("es");
        const filtrados = productos.filter(producto => {
            const coincideMarca = marcaActiva === "todos" || producto.marca === marcaActiva;
            const textoProducto = `${producto.nombreModelo} ${producto.referencia} ${obtenerNombreMarca(producto.marca)}`.toLocaleLowerCase("es");
            return coincideMarca && (!termino || textoProducto.includes(termino));
        });

        const ordenadores = {
            destacados: (a, b) => Number(b.destacado) - Number(a.destacado),
            "precio-asc": (a, b) => (a.precioFinal || a.precio) - (b.precioFinal || b.precio),
            "precio-desc": (a, b) => (b.precioFinal || b.precio) - (a.precioFinal || a.precio),
            nombre: (a, b) => a.nombreModelo.localeCompare(b.nombreModelo, "es")
        };
        filtrados.sort(ordenadores[ordenSeleccionado] || ordenadores.destacados);
        renderizarProductos(filtrados);
    }

    /**
     * Configura los botones de filtro con animación.
     */
    function configurarFiltros() {
        botonesFiltro.forEach(boton => {
            boton.addEventListener("click", () => {
                // Animación de clic en botón de filtro
                if (window.MotionAnimations) {
                    window.MotionAnimations.animarClicBoton(boton);
                }

                botonesFiltro.forEach(b => b.classList.remove("activo"));
                boton.classList.add("activo");
                filtrarPorMarca(boton.dataset.marca);
            });
        });
    }

    function configurarBusquedaYOrden() {
        if (campoBusqueda) {
            campoBusqueda.addEventListener("input", () => {
                textoBusqueda = campoBusqueda.value;
                filtrarPorMarca(marcaActiva);
            });
        }

        if (selectorOrden) {
            selectorOrden.addEventListener("change", () => {
                ordenSeleccionado = selectorOrden.value;
                filtrarPorMarca(marcaActiva);
            });
        }
    }

    /**
     * Abre el modal Quick View con los datos del producto.
     * @param {object} producto - Objeto producto.
     */
    function abrirModal(producto) {
        productoSeleccionado = producto;
        tallaSeleccionada = producto.tallasDisponibles[0] || null;

        nombreModal.textContent = producto.nombreModelo;
        const marcaModal = document.getElementById("marca-producto-modal");
        if (marcaModal) {
            marcaModal.textContent = (typeof obtenerNombreMarca === "function")
                ? obtenerNombreMarca(producto.marca)
                : producto.marca;
        }
        referenciaModal.textContent = `Referencia: ${producto.referencia}`;
        precioModal.innerHTML = producto.promocionActiva
            ? `<del class="precio-anterior">${formatearPrecio(producto.precio)}</del><strong>${formatearPrecio(producto.precioPromocion)}</strong><span class="badge-promocion">${escaparHTML(producto.etiquetaPromocion || "Oferta")}</span>`
            : formatearPrecio(producto.precio);
        descripcionModal.textContent = producto.descripcion;
        imagenPrincipalModal.src = producto.imagenPrincipal;
        imagenPrincipalModal.alt = producto.nombreModelo;

        // Renderizar miniaturas
        contenedorMiniaturas.innerHTML = "";
        producto.imagenesDetalle.forEach((img, idx) => {
            const miniatura = document.createElement("img");
            miniatura.src = img;
            miniatura.alt = `Miniatura ${idx + 1}`;
            miniatura.className = `miniatura-modal ${idx === 0 ? "activa" : ""}`;
            miniatura.addEventListener("click", () => {
                imagenPrincipalModal.src = img;
                document.querySelectorAll(".miniatura-modal").forEach(m => m.classList.remove("activa"));
                miniatura.classList.add("activa");
            });
            contenedorMiniaturas.appendChild(miniatura);
        });

        // Renderizar píldoras de talla
        renderizarPildorasTalla();

        // Configurar botón WhatsApp del modal
        botonWhatsappModal.onclick = () => {
            if (tallaSeleccionada) {
                if (window.MotionAnimations) {
                    window.MotionAnimations.animarClicBoton(botonWhatsappModal);
                }
                enviarPorWhatsapp(producto, tallaSeleccionada);
            } else {
                window.notificarMotion("advertencia", "Talla requerida", "Por favor selecciona una talla antes de comprar.");
            }
        };

        // Configurar botón agregar al carrito del modal
        if (botonAgregarCarrito) {
            botonAgregarCarrito.onclick = () => {
                if (tallaSeleccionada) {
                    if (window.MotionAnimations) {
                        window.MotionAnimations.animarClicBoton(botonAgregarCarrito);
                    }
                    Carrito.agregarProducto(producto, tallaSeleccionada);
                    cerrarModal();
                } else {
                    window.notificarMotion("advertencia", "Talla requerida", "Por favor selecciona una talla antes de agregar al carrito.");
                }
            };
        }

        // Mostrar modal y overlay
        modal.classList.add("activo");
        overlay.classList.add("activo");
        document.body.style.overflow = "hidden";
    }

    /**
     * Renderiza las píldoras de talla dentro del modal.
     */
    function renderizarPildorasTalla() {
        if (!contenedorTallas || !productoSeleccionado) return;

        contenedorTallas.innerHTML = `
            <p class="etiqueta-tallas">Talla disponible</p>
            <div class="contenedor-pildoras-talla" id="pildoras-talla-modal"></div>
        `;

        const contenedorPildoras = document.getElementById("pildoras-talla-modal");

        if (productoSeleccionado.tallasDisponibles.length === 0) {
            const sinStock = document.createElement("p");
            sinStock.className = "sin-stock";
            sinStock.textContent = "Producto agotado. Consulta por disponibilidad.";
            contenedorPildoras.appendChild(sinStock);
        }

        productoSeleccionado.tallasDisponibles.forEach(talla => {
            const pildora = document.createElement("button");
            pildora.className = `pildora-talla ${talla === tallaSeleccionada ? "seleccionada" : ""}`;
            pildora.textContent = talla;
            pildora.dataset.talla = talla;
            pildora.addEventListener("click", () => {
                tallaSeleccionada = talla;
                document.querySelectorAll("#pildoras-talla-modal .pildora-talla").forEach(p => {
                    p.classList.remove("seleccionada");
                });
                pildora.classList.add("seleccionada");
            });
            contenedorPildoras.appendChild(pildora);
        });
    }

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>'"]/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[caracter]));
    }

    /**
     * Configura eventos de cierre del modal.
     */
    function configurarModal() {
        if (!modal || !overlay) return;

        if (botonCerrar) {
            botonCerrar.addEventListener("click", cerrarModal);
        }
        overlay.addEventListener("click", cerrarModal);
        // Cerrar con tecla ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("activo")) {
                cerrarModal();
            }
        });
    }

    function cerrarModal() {
        if (!modal || !overlay) return;
        modal.classList.remove("activo");
        overlay.classList.remove("activo");
        document.body.style.overflow = "";
    }

    return {
        inicializar,
        agregarProducto: (producto, talla) => Carrito.agregarProducto(producto, talla)
    };
})();

if (typeof window !== "undefined") {
    window.Catalogo = Catalogo;
}
