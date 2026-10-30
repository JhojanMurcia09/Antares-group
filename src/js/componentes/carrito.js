/**
 * Archivo: js/componentes/carrito.js
 * Descripción: Lógica del carrito de compras de Antares Store JM.
 * Usa localStorage para persistencia local y SweetAlert2 para mensajes.
 * Autor: Equipo de desarrollo Antares
 * Fecha: 2026-10-28
 */

const Carrito = (function() {
    const CLAVE_STORAGE = 'antares_carrito';
    const contadorCarrito = document.getElementById('contador-carrito');

    /**
     * Normaliza rutas antiguas (../../assets/) para compatibilidad con carritos guardados antes de la corrección.
     * @param {string} src - Ruta de la imagen.
     * @returns {string}
     */
    function normalizarImagen(src) {
        return typeof src === "string"
            ? src.replace(/^\.\.\/\.\.\/assets\//, "../assets/")
            : src;
    }

    /**
     * Obtiene el carrito desde localStorage.
     * @returns {Array} Array de items { id, nombre, referencia, precio, talla, cantidad, imagen }
     */
    function obtenerCarrito() {
        const datos = localStorage.getItem(CLAVE_STORAGE);
        if (!datos) return [];
        try {
            return JSON.parse(datos).map(item => ({
                ...item,
                imagen: normalizarImagen(item.imagen)
            }));
        } catch (error) {
            console.warn("[Carrito] Datos corruptos en localStorage, se reinicia.", error);
            return [];
        }
    }

    /**
     * Guarda el carrito en localStorage y actualiza el contador.
     * @param {Array} carrito
     */
    function guardarCarrito(carrito) {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito));
        actualizarContador(carrito);
    }

    /**
     * Actualiza el contador visual del carrito en el header.
     * @param {Array} carrito
     */
    function actualizarContador(carrito) {
        if (!contadorCarrito) return;
        const totalItems = carrito.reduce((suma, item) => suma + (item.cantidad || 1), 0);
        contadorCarrito.textContent = totalItems;
        if (totalItems > 0) {
            contadorCarrito.classList.add('con-items');
        } else {
            contadorCarrito.classList.remove('con-items');
        }
    }

    /**
     * Agrega un producto al carrito.
     * @param {object} producto - Objeto producto.
     * @param {number} talla - Talla seleccionada.
     */
    function agregarProducto(producto, talla, cantidad = 1) {
        const cantidadSolicitada = Number(cantidad);
        if (!talla) {
            mostrarAdvertencia('Talla requerida', 'Por favor selecciona una talla antes de agregar al carrito.');
            return;
        }
        if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada < 1 || cantidadSolicitada > 99) {
            mostrarAdvertencia('Cantidad no válida', 'Selecciona una cantidad entre 1 y 99 unidades.');
            return;
        }

        const carrito = obtenerCarrito();
        const existente = carrito.find(
            item => item.id === producto.id && item.talla === talla
        );
        const stockPorTalla = producto.stockPorTalla;
        if (stockPorTalla) {
            const disponible = Number(stockPorTalla[talla] || 0);
            const cantidadActual = existente ? Number(existente.cantidad || 0) : 0;
            if (cantidadActual + cantidadSolicitada > disponible) {
                mostrarAdvertencia("Stock insuficiente", `Solo hay ${disponible} unidades disponibles en la talla ${talla}.`);
                return;
            }
        }

        if (existente) {
            existente.cantidad = Math.min(99, (existente.cantidad || 1) + cantidadSolicitada);
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombreModelo,
                referencia: producto.referencia,
                precio: producto.precioFinal || producto.precio,
                talla: talla,
                cantidad: cantidadSolicitada,
                imagen: producto.imagenPrincipal
            });
        }

        guardarCarrito(carrito);
        mostrarExito('Agregado al carrito', `${producto.nombreModelo} — talla ${talla}`);
    }

    /**
     * Elimina un producto del carrito por índice, con confirmación.
     * @param {number} indice
     */
    function eliminarProducto(indice) {
        confirmarAccion(
            'Eliminar producto',
            '¿Estás seguro de que quieres eliminar este producto del carrito?',
            () => {
                const carrito = obtenerCarrito();
                carrito.splice(indice, 1);
                guardarCarrito(carrito);
                renderizarCarrito();
                mostrarExito('Eliminado', 'Producto eliminado del carrito.');
            }
        );
    }

    /**
     * Cambia la cantidad de un item (+1 / -1) con límites 1..99.
     * @param {number} indice
     * @param {number} delta
     */
    function cambiarCantidad(indice, delta) {
        const carrito = obtenerCarrito();
        const item = carrito[indice];
        if (!item) return;

        const nuevaCantidad = Math.max(1, Math.min(99, (item.cantidad || 1) + delta));
        item.cantidad = nuevaCantidad;
        guardarCarrito(carrito);
        renderizarCarrito();
    }

    /**
     * Calcula el total del carrito.
     * @returns {number}
     */
    function calcularTotal() {
        const carrito = obtenerCarrito();
        return carrito.reduce((suma, item) => suma + (item.precio * (item.cantidad || 1)), 0);
    }

    /**
     * Renderiza el carrito en la página carrito.html con estado vacío incluido.
     */
    function renderizarCarrito() {
        const contenedor = document.getElementById('items-carrito');
        const totalElement = document.getElementById('valor-total');
        if (!contenedor) return;

        const carrito = obtenerCarrito();
        contenedor.innerHTML = '';

        if (carrito.length === 0) {
            contenedor.innerHTML = `
                <div class="carrito-vacio">
                    <i data-lucide="shopping-basket" class="icono-carrito-vacio"></i>
                    <p><strong class="titulo-vacio">Tu carrito está vacío</strong></p>
                    <p class="texto-vacio">Explora la colección y agrega tus modelos favoritos.</p>
                    <a href="../html/index.html" class="boton-primario">
                        <i data-lucide="shopping-bag" style="width: 20px; height: 20px;"></i>
                        Ver catálogo
                    </a>
                </div>
            `;
            if (totalElement) totalElement.textContent = formatearPrecio(0);
            if (window.lucide && typeof window.lucide.createIcons === "function") {
                window.lucide.createIcons();
            }
            return;
        }

        carrito.forEach((item, indice) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-carrito';
            itemElement.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" class="imagen-item-carrito" loading="lazy"
                     onerror="this.onerror=null;this.src='../assets/imagenes/placeholder.svg'">
                <div class="detalle-item-carrito">
                    <div class="nombre-item-carrito">${item.nombre}</div>
                    <div class="detalle-meta-item">Ref: ${item.referencia} · Talla: ${item.talla}</div>
                    <div class="precio-item-carrito">${formatearPrecio(item.precio)}</div>
                    <div class="cantidad-item-carrito">
                        <button class="boton-cantidad" type="button" title="Quitar uno"
                                onclick="Carrito.cambiarCantidad(${indice}, -1)">−</button>
                        <input type="number" min="1" max="99" value="${item.cantidad}" aria-label="Cantidad"
                               onchange="Carrito.actualizarCantidad(${indice}, this.value)">
                        <button class="boton-cantidad" type="button" title="Agregar uno"
                                onclick="Carrito.cambiarCantidad(${indice}, 1)">+</button>
                        <span class="subtotal-item-carrito">Subtotal: ${formatearPrecio(item.precio * (item.cantidad || 1))}</span>
                    </div>
                </div>
                <button class="boton-eliminar-item" onclick="Carrito.eliminarProducto(${indice})" title="Eliminar" aria-label="Eliminar producto">
                    &times;
                </button>
            `;
            contenedor.appendChild(itemElement);
        });

        if (totalElement) {
            totalElement.textContent = formatearPrecio(calcularTotal());
        }

        // Renderizar los iconos Lucide insertados
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    /**
     * Actualiza la cantidad de un item desde el input numérico.
     * @param {number} indice
     * @param {number} nuevaCantidad
     */
    function actualizarCantidad(indice, nuevaCantidad) {
        const cantidad = parseInt(nuevaCantidad, 10);
        if (isNaN(cantidad) || cantidad < 1) return;

        const carrito = obtenerCarrito();
        if (carrito[indice]) {
            carrito[indice].cantidad = Math.min(99, cantidad);
            guardarCarrito(carrito);
            renderizarCarrito();
        }
    }

    /**
     * Vacía el carrito completo, con confirmación.
     */
    function vaciarCarrito() {
        confirmarAccion(
            'Vaciar carrito',
            '¿Estás seguro de que quieres eliminar todos los productos del carrito?',
            () => {
                localStorage.removeItem(CLAVE_STORAGE);
                actualizarContador([]);
                renderizarCarrito();
                mostrarExito('Carrito vacío', 'Se eliminaron todos los productos.');
            }
        );
    }

    return {
        obtenerCarrito,
        guardarCarrito,
        agregarProducto,
        eliminarProducto,
        cambiarCantidad,
        calcularTotal,
        renderizarCarrito,
        actualizarCantidad,
        actualizarContador,
        vaciarCarrito
    };
})();

if (typeof window !== "undefined") {
    window.Carrito = Carrito;
    window.formatearPrecio = window.formatearPrecio || function(p) {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(p);
    };
}

// Al cargar cualquier página con contador de carrito, actualiza con lo guardado
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("contador-carrito")) {
            Carrito.actualizarContador(Carrito.obtenerCarrito());
        }
    });
}
