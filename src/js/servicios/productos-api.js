/**
 * Acceso al catálogo compartido servido por la API MySQL.
 */
const ProductosApi = (() => {
    async function solicitar(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            cache: "no-store",
            ...options
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(data?.error || `La API respondió con el estado ${response.status}.`);
        }
        return data;
    }

    async function listar() {
        const data = await solicitar("../api/productos.php");
        if (!Array.isArray(data.productos)) {
            throw new Error("La respuesta del catálogo no tiene un formato válido.");
        }

        return data.productos.map(producto => {
            const tallas = Object.entries(producto.tallas || {})
                .map(([talla, stock]) => [Number(talla), Number(stock)])
                .filter(([, stock]) => stock > 0);
            const precio = Number(producto.precio);
            const precioPromocion = producto.promocion_activa
                ? Number(producto.precio_promocion)
                : null;

            return {
                id: Number(producto.id),
                marca: producto.marca,
                nombreModelo: producto.nombre_modelo,
                referencia: producto.referencia,
                precio,
                precioPromocion,
                precioFinal: precioPromocion || precio,
                promocionActiva: Boolean(producto.promocion_activa && precioPromocion),
                etiquetaPromocion: producto.etiqueta_promocion || "Oferta",
                descripcion: producto.descripcion || "",
                categoria: producto.categoria || "",
                destacado: Boolean(producto.destacado),
                imagenPrincipal: producto.imagen_principal,
                imagenesDetalle: producto.imagenes || [producto.imagen_principal],
                tallasDisponibles: tallas.map(([talla]) => talla),
                stockPorTalla: Object.fromEntries(tallas)
            };
        });
    }

    return { listar };
})();

if (typeof window !== "undefined") {
    window.ProductosApi = ProductosApi;
}
