/**
 * Sincroniza el inventario administrativo con la API MySQL.
 */
(() => {
    const apiUrl = "../api";

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

    function adaptarProducto(producto) {
        return {
            id: String(producto.id),
            name: producto.nombre_modelo,
            brand: producto.marca_nombre,
            brandSlug: producto.marca,
            sku: producto.referencia,
            salePrice: Number(producto.precio),
            promotionPrice: producto.precio_promocion === null ? "" : Number(producto.precio_promocion),
            promotionActive: Boolean(producto.promocion_activa),
            promotionLabel: producto.etiqueta_promocion || "Oferta",
            description: producto.descripcion || "",
            category: producto.categoria || "",
            featured: Boolean(producto.destacado),
            image: producto.imagen_principal,
            images: producto.imagenes || [producto.imagen_principal],
            sizes: producto.tallas || {}
        };
    }

    async function cargarInventario() {
        const data = await solicitar(`${apiUrl}/productos.php`);
        if (!Array.isArray(data.productos)) {
            throw new Error("La respuesta de inventario no tiene un formato válido.");
        }
        shoes = data.productos.map(adaptarProducto);
        const brandFilter = document.getElementById("invSupplierFilter");
        const selectedBrand = brandFilter.value;
        const brands = [...new Map(shoes.map(shoe => [shoe.brandSlug, shoe.brand])).entries()]
            .sort((a, b) => a[1].localeCompare(b[1], "es"));
        brandFilter.innerHTML = '<option value="">Todas las marcas</option>';
        brands.forEach(([slug, name]) => {
            const option = document.createElement("option");
            option.value = slug;
            option.textContent = name;
            brandFilter.appendChild(option);
        });
        if (brands.some(([slug]) => slug === selectedBrand)) brandFilter.value = selectedBrand;
        renderInventoryTable();
        updateGlobalStats();
        if (typeof renderCatalog === "function") renderCatalog();
    }

    function mensajeError(error) {
        console.error("[Antares] Error de inventario:", error);
        const emptyState = document.getElementById("invEmptyState");
        if (emptyState) {
            emptyState.classList.remove("hidden");
            emptyState.querySelector("p").textContent = "No fue posible consultar el inventario";
            emptyState.querySelectorAll("p")[1].textContent = error.message;
        }
        if (typeof showToast === "function") showToast(error.message, "error");
    }

    window.handleAdminLogin = async function (event) {
        event.preventDefault();
        const usuario = document.getElementById("adminUser").value.trim();
        const contrasena = document.getElementById("adminPass").value;
        try {
            const data = await solicitar(`${apiUrl}/sesion.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, contrasena })
            });
            document.getElementById("adminLoginOverlay").classList.add("hidden");
            document.querySelector(".admin-layout").style.display = "flex";
            document.querySelector(".user-details .name").textContent = data.nombre || "Administrador";
            await window.initAdmin();
            showToast("Sesión iniciada correctamente.", "success");
        } catch (error) {
            console.error("[Antares] Error al iniciar sesión:", error);
            showToast(error.message, "error");
        }
    };

    window.initAdmin = async function () {
        try {
            renderSizesGridInputs();
            renderColumnHeaders();
            await cargarInventario();
            switchTab("inventory");
            if (window.lucide) lucide.createIcons();
        } catch (error) {
            mensajeError(error);
        }
    };

    window.handleLogout = async function () {
        try {
            await solicitar(`${apiUrl}/sesion.php`, { method: "DELETE" });
        } catch (error) {
            console.error("[Antares] Error al cerrar sesión:", error);
        } finally {
            sessionStorage.removeItem("antares_admin_auth");
            window.location.href = "admin.html";
        }
    };

    window.saveState = function () {
        localStorage.setItem("antares_suppliers", JSON.stringify(suppliers));
        localStorage.setItem("antares_sales", JSON.stringify(salesHistory));
        localStorage.setItem("antares_columns", JSON.stringify(columnConfig));
        updateGlobalStats();
    };

    window.renderInventoryTable = function () {
        const tbody = document.getElementById("inventoryTableBody");
        const emptyState = document.getElementById("invEmptyState");
        if (!tbody || !emptyState) return;

        const search = document.getElementById("invSearchInput").value.trim().toLocaleLowerCase("es");
        const brandFilter = document.getElementById("invSupplierFilter").value;
        const sizeFilter = document.getElementById("invSizeFilter").value;
        const filtered = shoes.filter(shoe => {
            const matchesSearch = `${shoe.name} ${shoe.sku} ${shoe.brand}`.toLocaleLowerCase("es").includes(search);
            const matchesBrand = !brandFilter || shoe.brandSlug === brandFilter;
            const matchesSize = !sizeFilter || Number(shoe.sizes[sizeFilter] || 0) > 0;
            return matchesSearch && matchesBrand && matchesSize;
        });

        tbody.replaceChildren();
        if (filtered.length === 0) {
            emptyState.classList.remove("hidden");
            return;
        }
        emptyState.classList.add("hidden");

        filtered.forEach(shoe => {
            const totalStock = Object.values(shoe.sizes).reduce((sum, stock) => sum + Number(stock), 0);
            const sizeLabels = Object.entries(shoe.sizes)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([size, stock]) => `<span class="size-chip">T${escapeHTML(size)}:<strong>${Number(stock)}</strong></span>`)
                .join("");
            const priceMarkup = shoe.promotionActive
                ? `<span class="precio-original">${formatearPrecio(shoe.salePrice)}</span><span class="precio-promocional">${formatearPrecio(shoe.promotionPrice)}</span><span class="promo-badge">${escapeHTML(shoe.promotionLabel)}</span>`
                : `<span class="precio-promocional">${formatearPrecio(shoe.salePrice)}</span>`;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><div class="imagen-preview" style="width:76px;height:76px;"><img src="${escapeAttr(shoe.image)}" alt="${escapeHTML(shoe.name)}" onerror="this.src='../assets/imagenes/placeholder.svg'"><span>${escapeHTML(shoe.name)}</span></div></td>
                <td><strong>${escapeHTML(shoe.name)}</strong><small style="display:block;color:#94a3b8;">Ref: ${escapeHTML(shoe.sku)}</small></td>
                <td>${escapeHTML(shoe.brand)}</td>
                <td>${sizeLabels || '<span class="badge badge-neutral">Sin tallas registradas</span>'}</td>
                <td>${priceMarkup}</td>
                <td style="text-align:center;">${totalStock > 0 ? `<span class="badge badge-neutral">${totalStock} pares</span>` : '<span class="badge badge-danger">Agotado</span>'}</td>
                <td style="text-align:right;white-space:nowrap;">
                    <button class="btn btn-ghost btn-sm" type="button" data-edit-id="${escapeAttr(shoe.id)}" aria-label="Editar ${escapeAttr(shoe.name)}"><i data-lucide="edit"></i> Editar</button>
                    <button class="btn btn-danger btn-sm" type="button" data-delete-id="${escapeAttr(shoe.id)}" aria-label="Borrar ${escapeAttr(shoe.name)}"><i data-lucide="trash-2"></i> Borrar</button>
                </td>`;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll("[data-edit-id]").forEach(button => {
            button.addEventListener("click", () => window.editShoe(button.dataset.editId));
        });
        tbody.querySelectorAll("[data-delete-id]").forEach(button => {
            button.addEventListener("click", () => window.deleteShoe(button.dataset.deleteId));
        });
        if (window.lucide) lucide.createIcons();
    };

    window.renderColumnHeaders = function () {
        const header = document.getElementById("invTableHead");
        if (!header) return;
        header.innerHTML = "<th>Foto</th><th>Modelo / referencia</th><th>Marca</th><th>Tallas y stock</th><th>Precio / promoción</th><th style='text-align:center'>Stock total</th><th style='text-align:right'>Acciones</th>";
    };

    window.renderCatalog = function () {
        const grid = document.getElementById("catalogGrid");
        if (!grid) return;
        grid.replaceChildren();
        shoes.forEach(shoe => {
            const total = Object.values(shoe.sizes).reduce((sum, stock) => sum + Number(stock), 0);
            if (total < 1) return;
            const card = document.createElement("article");
            card.className = "catalog-card";
            const originalPrice = shoe.promotionActive
                ? `<del class="precio-original">${formatearPrecio(shoe.salePrice)}</del> `
                : "";
            card.innerHTML = `
                <div class="catalog-card-img">
                    <img src="${escapeAttr(shoe.image)}" alt="${escapeHTML(shoe.name)}" onerror="this.src='../assets/imagenes/placeholder.svg'">
                    ${shoe.promotionActive ? `<span class="promo-badge">${escapeHTML(shoe.promotionLabel)}</span>` : ""}
                    <span class="inventario-foto-titulo">${escapeHTML(shoe.name)}</span>
                </div>
                <div class="catalog-card-body">
                    <h3 class="catalog-card-title">${escapeHTML(shoe.name)}</h3>
                    <p class="catalog-card-sub">${escapeHTML(shoe.brand)} • ${escapeHTML(shoe.category)}</p>
                    <span class="catalog-card-price">${originalPrice}${formatearPrecio(shoe.promotionActive ? shoe.promotionPrice : shoe.salePrice)}</span>
                    <div class="catalog-card-sizes">${Object.entries(shoe.sizes).filter(([, stock]) => Number(stock) > 0).map(([size]) => `<span class="catalog-size">T${escapeHTML(size)}</span>`).join("")}</div>
                </div>`;
            grid.appendChild(card);
        });
        if (grid.children.length === 0) {
            grid.textContent = "No hay zapatos con stock disponible para mostrar en el catálogo.";
        }
    };

    window.handleSaleShoeChange = function () {
        const shoe = shoes.find(item => item.id === document.getElementById("saleShoeSelect").value);
        const detail = document.getElementById("saleShoeDetail");
        if (!shoe) {
            detail.classList.add("hidden");
            selectedSaleShoeId = null;
            selectedSaleSize = null;
            return;
        }

        selectedSaleShoeId = shoe.id;
        selectedSaleSize = null;
        document.getElementById("saleDetailName").textContent = shoe.name;
        document.getElementById("saleDetailSub").textContent = `${shoe.brand} | ${shoe.sku}`;
        document.getElementById("saleDetailPrice").textContent = formatearPrecio(
            shoe.promotionActive ? shoe.promotionPrice : shoe.salePrice
        );
        document.getElementById("saleQtyInput").value = "1";
        const sizesContainer = document.getElementById("saleSizesContainer");
        sizesContainer.replaceChildren();
        Object.entries(shoe.sizes).sort(([a], [b]) => Number(a) - Number(b)).forEach(([size, stock]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-secondary btn-sm";
            button.disabled = Number(stock) < 1;
            button.innerHTML = Number(stock) > 0
                ? `<span>Talla ${escapeHTML(size)}</span><span style="font-size:9px;color:#22c55e;">${Number(stock)} disp.</span>`
                : `<span>Talla ${escapeHTML(size)}</span><span style="font-size:9px;color:#ef4444;">Agotada</span>`;
            if (Number(stock) > 0) button.addEventListener("click", () => selectSaleSize(Number(size), button));
            sizesContainer.appendChild(button);
        });
        detail.classList.remove("hidden");
    };

    window.addCurrentItemToCart = function () {
        if (!selectedSaleShoeId || !selectedSaleSize) {
            showToast("Debes seleccionar una talla.", "error");
            return;
        }
        const shoe = shoes.find(item => item.id === selectedSaleShoeId);
        const quantity = Number(document.getElementById("saleQtyInput").value) || 1;
        const idx = currentCart.findIndex(item => item.shoeId === shoe.id && item.size === selectedSaleSize);
        const unitPrice = shoe.promotionActive ? shoe.promotionPrice : shoe.salePrice;
        if (idx !== -1) currentCart[idx].qty += quantity;
        else currentCart.push({
            shoeId: shoe.id,
            name: shoe.name,
            brand: shoe.brand,
            size: selectedSaleSize,
            price: unitPrice,
            qty: quantity,
            agent: document.getElementById("saleAgentSelect").value
        });
        showToast(`Agregado: talla ${selectedSaleSize}`, "success");
        renderCart();
    };

    window.processSaleTransaction = async function () {
        if (currentCart.length === 0) return;
        const saleItems = [...currentCart];
        const saleEntry = {
            id: `sale-${Date.now()}`,
            date: new Date().toISOString(),
            items: saleItems,
            total: saleItems.reduce((sum, item) => sum + item.price * item.qty, 0),
            paymentMethod: document.getElementById("paymentMethodSelect").value,
            agent: saleItems[0].agent
        };
        try {
            await solicitar(`${apiUrl}/venta.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: saleItems.map(item => ({
                        productoId: Number(item.shoeId),
                        talla: Number(item.size),
                        cantidad: Number(item.qty)
                    }))
                })
            });
        } catch (error) {
            console.error("[Antares] No se pudo registrar la venta:", error);
            showToast(error.message, "error");
            return;
        }

        currentCart = [];
        salesHistory.push(saleEntry);
        renderCart();
        try {
            saveState();
        } catch (error) {
            console.error("[Antares] Venta registrada, pero no se pudo guardar el historial local:", error);
            showToast("La venta se guardó en MySQL; no se pudo actualizar el historial local.", "error");
        }
        try {
            await cargarInventario();
            setupSalesModule();
        } catch (error) {
            mensajeError(error);
            showToast("La venta quedó registrada, pero no se pudo actualizar la vista del inventario.", "error");
        }
        showToast("Venta registrada y stock actualizado en MySQL.", "success");
    };

    window.renderSizesGridInputs = function (sizes = {}) {
        const container = document.getElementById("sizesGridContainer");
        if (!container) return;
        container.replaceChildren();
        const allSizes = [...new Set([...DEFAULT_SIZES, ...Object.keys(sizes).map(Number)])]
            .sort((a, b) => a - b);
        allSizes.forEach(size => agregarControlTalla(container, size, sizes[size] ?? 0));
    };

    function agregarControlTalla(container, size, quantity = 0) {
        const item = document.createElement("div");
        item.className = "size-input-group";
        item.dataset.size = String(size);
        item.innerHTML = `
            <label for="sizeInput_${size}">Talla ${size}</label>
            <input type="number" id="sizeInput_${size}" min="0" max="9999" value="${Number(quantity)}" class="size-input" data-size="${size}" aria-label="Stock talla ${size}">
            <button type="button" class="size-remove" aria-label="Quitar talla ${size}" title="Quitar talla">×</button>`;
        item.querySelector(".size-remove").addEventListener("click", () => item.remove());
        container.appendChild(item);
    }

    window.agregarTallaPersonalizada = function () {
        const talla = Number(window.prompt("Escribe la talla numérica (15 a 60):"));
        if (!Number.isInteger(talla) || talla < 15 || talla > 60) {
            if (talla !== 0) showToast("La talla debe ser un número entero entre 15 y 60.", "error");
            return;
        }
        const container = document.getElementById("sizesGridContainer");
        if (container.querySelector(`[data-size="${talla}"]`)) {
            showToast("Esa talla ya está en la lista.", "info");
            return;
        }
        agregarControlTalla(container, talla);
    };

    window.editShoe = function (id) {
        const shoe = shoes.find(item => item.id === String(id));
        if (!shoe) {
            showToast("No se encontró el producto en el inventario.", "error");
            return;
        }
        switchTab("addShoe");
        document.getElementById("formShoeTitle").textContent = "Modificar Zapato";
        document.getElementById("shoeSubmitBtnText").textContent = "Actualizar Cambios";
        document.getElementById("shoeEditId").value = shoe.id;
        document.getElementById("shoeName").value = shoe.name;
        document.getElementById("shoeBrand").value = shoe.brand;
        document.getElementById("shoeSKU").value = shoe.sku;
        document.getElementById("shoeSalePrice").value = shoe.salePrice;
        document.getElementById("shoePromotionPrice").value = shoe.promotionPrice;
        document.getElementById("shoePromotionLabel").value = shoe.promotionLabel;
        document.getElementById("shoePromotionActive").checked = shoe.promotionActive;
        document.getElementById("shoeDescription").value = shoe.description;
        document.getElementById("shoeCategory").value = shoe.category;
        document.getElementById("shoeFeatured").checked = shoe.featured;
        document.getElementById("shoeImage").value = shoe.image;
        document.getElementById("shoeImages").value = "";
        document.getElementById("shoeImageHelp").textContent = "La galería actual se conservará si no seleccionas imágenes nuevas.";
        window.renderSizesGridInputs(shoe.sizes);
        mostrarPrevisualizaciones(shoe.images, shoe.name);
    };

    function mostrarPrevisualizaciones(images, title) {
        const preview = document.getElementById("shoeImagePreview");
        preview.replaceChildren();
        images.forEach(source => {
            const figure = document.createElement("div");
            figure.className = "imagen-preview";
            const image = document.createElement("img");
            image.src = source;
            image.alt = title;
            const caption = document.createElement("span");
            caption.textContent = title;
            figure.append(image, caption);
            preview.appendChild(figure);
        });
    }

    window.handleSaveShoe = async function (event) {
        event.preventDefault();
        const formData = new FormData();
        const editId = document.getElementById("shoeEditId").value;
        const shoe = shoes.find(item => item.id === editId);
        const sizes = {};
        document.querySelectorAll("#sizesGridContainer .size-input").forEach(input => {
            sizes[input.dataset.size] = Number(input.value);
        });
        const fields = {
            name: document.getElementById("shoeName").value.trim(),
            brand: document.getElementById("shoeBrand").value.trim(),
            reference: document.getElementById("shoeSKU").value.trim(),
            price: document.getElementById("shoeSalePrice").value,
            promotionPrice: document.getElementById("shoePromotionPrice").value,
            promotionActive: document.getElementById("shoePromotionActive").checked ? "true" : "false",
            promotionLabel: document.getElementById("shoePromotionLabel").value.trim() || "Oferta",
            description: document.getElementById("shoeDescription").value.trim(),
            category: document.getElementById("shoeCategory").value.trim(),
            featured: document.getElementById("shoeFeatured").checked ? "true" : "false",
            image: document.getElementById("shoeImage").value.trim(),
            sizes: JSON.stringify(sizes)
        };
        Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
        if (editId) formData.append("_method", "PUT");
        else if (shoe) formData.append("existingImage", shoe.image);
        Array.from(document.getElementById("shoeImages").files || [])
            .forEach(file => formData.append("images[]", file));

        try {
            await solicitar(
                editId ? `${apiUrl}/producto.php?id=${encodeURIComponent(editId)}` : `${apiUrl}/productos.php`,
                { method: "POST", body: formData }
            );
            await cargarInventario();
            resetShoeForm();
            switchTab("inventory");
            showToast(editId ? "Producto actualizado en la base de datos." : "Producto creado en la base de datos.", "success");
        } catch (error) {
            console.error("[Antares] No se pudo guardar el producto:", error);
            showToast(error.message, "error");
        }
    };

    window.deleteShoe = async function (id) {
        const confirmation = await Swal.fire({
            title: "¿Borrar zapato?",
            text: "Se eliminará del catálogo y del inventario. Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar"
        });
        if (!confirmation.isConfirmed) return;

        try {
            await solicitar(`${apiUrl}/producto.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
            await cargarInventario();
            showToast("Producto eliminado de la base de datos.", "success");
        } catch (error) {
            console.error("[Antares] No se pudo borrar el producto:", error);
            showToast(error.message, "error");
        }
    };

    window.resetShoeForm = function () {
        document.getElementById("shoeForm").reset();
        document.getElementById("shoeEditId").value = "";
        document.getElementById("formShoeTitle").textContent = "Registrar Nuevo Zapato";
        document.getElementById("shoeSubmitBtnText").textContent = "Guardar Zapato";
        document.getElementById("shoeImageHelp").textContent = "Al seleccionar imágenes nuevas, se reemplazará la galería actual. El título del modelo se muestra abajo a la izquierda.";
        document.getElementById("shoeImagePreview").replaceChildren();
        window.renderSizesGridInputs();
    };

    document.addEventListener("DOMContentLoaded", async () => {
        const loginOverlay = document.getElementById("adminLoginOverlay");
        const layout = document.querySelector(".admin-layout");
        try {
            const session = await solicitar(`${apiUrl}/sesion.php`);
            if (session.autenticado) {
                loginOverlay.classList.add("hidden");
                layout.style.display = "flex";
                document.querySelector(".user-details .name").textContent = session.nombre || "Administrador";
                await window.initAdmin();
            } else {
                loginOverlay.classList.remove("hidden");
                layout.style.display = "none";
            }
        } catch (error) {
            layout.style.display = "none";
            loginOverlay.classList.remove("hidden");
            mensajeError(error);
        }

        document.getElementById("shoeImages").addEventListener("change", event => {
            const title = document.getElementById("shoeName").value.trim() || "Nuevo modelo";
            const files = Array.from(event.target.files || []);
            if (files.length > 8) {
                event.target.value = "";
                showToast("Puedes seleccionar hasta 8 imágenes.", "error");
                return;
            }
            mostrarPrevisualizaciones(files.map(file => URL.createObjectURL(file)), title);
        });
    });
})();
