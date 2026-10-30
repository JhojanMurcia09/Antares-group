/**
 * Lógica de la ficha de producto individual.
 */
document.addEventListener("DOMContentLoaded", async () => {
    const parametros = new URLSearchParams(window.location.search);
    const referenciaSolicitada = parametros.get("producto");
    let catalogo = [];
    try {
        catalogo = await window.ProductosApi.listar();
    } catch (error) {
        console.error("[Antares] No fue posible cargar el producto:", error);
        const estado = document.getElementById("producto-no-encontrado");
        estado.hidden = false;
        estado.textContent = `No se pudo conectar con el catálogo: ${error.message}`;
        document.getElementById("detalle-producto").hidden = true;
        return;
    }
    const producto = referenciaSolicitada
        ? catalogo.find(item => item.referencia.toLocaleLowerCase() === referenciaSolicitada.toLocaleLowerCase())
        : catalogo[0];

    const detalle = document.getElementById("detalle-producto");
    const estadoNoEncontrado = document.getElementById("producto-no-encontrado");
    if (!producto) {
        detalle.hidden = true;
        estadoNoEncontrado.hidden = false;
        document.title = "Producto no encontrado — Antares Store JM";
        return;
    }

    let tallaSeleccionada = null;
    const imagenPrincipal = document.getElementById("imagen-producto-destacado");
    const miniaturas = document.getElementById("miniaturas-producto");
    const selectorTallas = document.getElementById("tallas-producto");
    const entradaCantidad = document.getElementById("cantidad-producto");

    document.title = `${producto.nombreModelo} — Antares Store JM`;
    document.getElementById("marca-producto").textContent = obtenerNombreMarca(producto.marca);
    document.getElementById("etiqueta-marca-producto").textContent = obtenerNombreMarca(producto.marca);
    document.getElementById("nombre-producto").textContent = producto.nombreModelo;
    document.getElementById("referencia-producto").textContent = `Ref: ${producto.referencia}`;
    const precioProducto = document.getElementById("precio-producto");
    if (producto.promocionActiva) {
        const precioOriginal = document.createElement("del");
        precioOriginal.className = "precio-anterior";
        precioOriginal.textContent = formatearPrecio(producto.precio);
        const precioOferta = document.createElement("strong");
        precioOferta.textContent = formatearPrecio(producto.precioPromocion);
        const etiquetaOferta = document.createElement("span");
        etiquetaOferta.className = "badge-promocion";
        etiquetaOferta.textContent = producto.etiquetaPromocion;
        precioProducto.replaceChildren(precioOriginal, precioOferta, etiquetaOferta);
    } else {
        precioProducto.textContent = formatearPrecio(producto.precio);
    }
    document.getElementById("descripcion-producto").textContent = producto.descripcion;

    const imagenes = [...new Set([producto.imagenPrincipal, ...(producto.imagenesDetalle || [])])];
    imagenPrincipal.src = imagenes[0];
    imagenPrincipal.alt = producto.nombreModelo;
    imagenPrincipal.onerror = () => {
        imagenPrincipal.onerror = null;
        imagenPrincipal.src = "../assets/imagenes/placeholder.svg";
    };

    imagenes.forEach((src, indice) => {
        const miniatura = document.createElement("button");
        miniatura.type = "button";
        miniatura.className = `miniatura-producto ${indice === 0 ? "activa" : ""}`;
        miniatura.setAttribute("aria-label", `Ver imagen ${indice + 1} de ${producto.nombreModelo}`);

        const imagen = document.createElement("img");
        imagen.src = src;
        imagen.alt = `${producto.nombreModelo}, imagen ${indice + 1}`;
        imagen.loading = "lazy";
        imagen.onerror = () => {
            imagen.onerror = null;
            imagen.src = "../assets/imagenes/placeholder.svg";
        };
        miniatura.appendChild(imagen);
        miniatura.addEventListener("click", () => {
            imagenPrincipal.src = src;
            miniaturas.querySelectorAll(".miniatura-producto").forEach(elemento => elemento.classList.remove("activa"));
            miniatura.classList.add("activa");
        });
        miniaturas.appendChild(miniatura);
    });

    producto.tallasDisponibles.forEach(talla => {
        const botonTalla = document.createElement("button");
        botonTalla.type = "button";
        botonTalla.className = "pildora-talla";
        botonTalla.textContent = talla;
        botonTalla.setAttribute("aria-label", `Seleccionar talla ${talla}`);
        botonTalla.addEventListener("click", () => {
            tallaSeleccionada = talla;
            selectorTallas.querySelectorAll(".pildora-talla").forEach(boton => {
                boton.classList.remove("seleccionada");
                boton.setAttribute("aria-pressed", "false");
            });
            if (producto.tallasDisponibles.length === 0) {
                const sinStock = document.createElement("p");
                sinStock.className = "sin-stock";
                sinStock.textContent = "Sin tallas disponibles por el momento.";
                selectorTallas.appendChild(sinStock);
                document.getElementById("agregar-carrito-producto").disabled = true;
                document.getElementById("comprar-whatsapp-producto").disabled = true;
            }
            botonTalla.classList.add("seleccionada");
            botonTalla.setAttribute("aria-pressed", "true");
            document.getElementById("talla-elegida").textContent = `Talla ${talla}`;
        });
        selectorTallas.appendChild(botonTalla);
    });

    const limitarCantidad = () => {
        const cantidad = Number(entradaCantidad.value);
        entradaCantidad.value = String(Number.isInteger(cantidad) ? Math.min(99, Math.max(1, cantidad)) : 1);
    };

    document.getElementById("restar-cantidad").addEventListener("click", () => {
        entradaCantidad.value = String(Math.max(1, Number(entradaCantidad.value) - 1));
    });
    document.getElementById("sumar-cantidad").addEventListener("click", () => {
        entradaCantidad.value = String(Math.min(99, Number(entradaCantidad.value) + 1));
    });
    entradaCantidad.addEventListener("change", limitarCantidad);

    const validarSeleccion = () => {
        limitarCantidad();
        if (!tallaSeleccionada) {
            mostrarAdvertencia("Selecciona una talla", "Elige una de las tallas disponibles para continuar.");
            selectorTallas.querySelector(".pildora-talla")?.focus();
            return false;
        }
        return true;
    };

    document.getElementById("agregar-carrito-producto").addEventListener("click", () => {
        if (validarSeleccion()) {
            Carrito.agregarProducto(producto, tallaSeleccionada, Number(entradaCantidad.value));
        }
    });

    document.getElementById("comprar-whatsapp-producto").addEventListener("click", () => {
        if (validarSeleccion()) {
            enviarPorWhatsapp(producto, tallaSeleccionada, Number(entradaCantidad.value));
        }
    });

    if (window.lucide) window.lucide.createIcons();
});
