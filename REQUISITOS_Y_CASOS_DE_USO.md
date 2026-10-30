# Requisitos y Casos de Uso — Antares Store JM

**Proyecto:** Antares Store JM  
**Tipo:** E-commerce / Catálogo interactivo 100% visual  
**Idioma:** Español  
**Fecha:** 2026-10-28  
**Estado:** Borrador inicial

---

## 1. Identidad del Proyecto

- **Nombre:** Antares Store JM
- **Propósito:** Venta de calzado premium streetwear e importado mediante catálogo visual con conversión directa por WhatsApp.
- **Enfoque:** 100% visual. El calzado es el protagonista absoluto (80% peso visual).
- **Idioma de interfaz, código y documentación:** Español.

---

## 2. Casos de Uso Funcionales

Cada caso de uso debe funcionar completamente al finalizar el proyecto. Cualquier enlace, botón o interacción debe llevar a su destino sin errores.

### UC-01: Navegación por el Header y Menú Animado
**Descripción:** El usuario navega por las secciones principales mediante el header con menú animado.
**Criterios de aceptación:**
- El header es fijo al scroll.
- El menú se abre y cierra con animación de deslizamiento.
- Los enlaces funcionan: Inicio, Catálogo, Marcas, Contacto, Iniciar sesión, Carrito.
- En móvil, el menú se despliega desde el lado derecho.
**Estado:** Pendiente

### UC-02: Hero Section Inmersivo
**Descripción:** El usuario ve la pantalla principal con el modelo insignia, tipografía audaz y CTA.
**Criterios de aceptación:**
- Ocupa todo el viewport (100vh).
- Imagen destacada del modelo insignia con rotación 360° eje X al interactuar.
- Tipografía grande y audaz.
- Botón CTA "Ver colección" y "Comprar ahora".
- Fondo oscuro de alto contraste.
**Estado:** Pendiente

### UC-03: Catálogo Visual (Bento Grid)
**Descripción:** El usuario explora los zapatos en tarjetas limpias con fotografías grandes.
**Criterios de aceptación:**
- Diseño tipo bento grid, sin tablas densas de texto.
- Cada tarjeta prioriza la fotografía del calzado en alta resolución.
- Información esencial visible: nombre del modelo, precio y píldoras de talla.
- Microinteracción hover: zoom sutil y elevación con sombra difuminada.
**Estado:** Pendiente

### UC-04: Filtros por Marca
**Descripción:** El usuario filtra el catálogo por marca específica.
**Criterios de aceptación:**
- Botones de filtro: Adidas, New Balance, Nike SB, On Running, Wider, Armani Exchange, Urban/Paris.
- Al seleccionar una marca, el catálogo se actualiza sin recargar la página.
- Si no hay resultados, se muestra un estado vacío diseñado (`empty state`).
**Estado:** Pendiente

### UC-05: Rotación 360° Eje X
**Descripción:** El calzado de cada marca rota 360 grados en el eje X para mostrar su diseño y profundidad.
**Criterios de aceptación:**
- Animación suave al hacer hover o al interactuar en móvil.
- Se muestra la silueta completa del zapato (puntera, suela, talón).
- Implementado con CSS 3D (`transform: rotateX`) y control por JavaScript.
**Estado:** Pendiente

### UC-06: Quick View Modal (Vista Rápida)
**Descripción:** Al hacer clic en un zapato se abre una vista inmersiva sin recargar la página.
**Criterios de aceptación:**
- Modal se abre al hacer clic en la tarjeta del producto.
- Galería de detalles: texturas, suela, puntera, talón.
- Zoom fluido en las imágenes.
- Cierre con tecla ESC o clic fuera del modal.
- No hay recarga de página.
**Estado:** Pendiente

### UC-07: Selección de Talla (Píldoras Interactivas)
**Descripción:** El usuario elige la talla disponible dentro del modal o tarjeta.
**Criterios de aceptación:**
- Tallas mostradas en formato de píldoras interactivas (botones redondeados).
- Solo se pueden seleccionar tallas con stock disponible.
- El precio se muestra junto con la talla seleccionada.
**Estado:** Pendiente

### UC-07b: Flujo de Conversión por WhatsApp
**Descripción:** El usuario compra directamente enviando un mensaje pre-armado por WhatsApp.
**Criterios de aceptación:**
- Botón "Comprar por WhatsApp" visible en el modal de producto.
- El mensaje incluye: nombre exacto del modelo, referencia, talla seleccionada y precio.
- Al hacer clic se abre WhatsApp Web o la aplicación nativa.
- Funciona en móvil y escritorio.
**Estado:** Pendiente

### UC-08: Inicio de Sesión (Login)
**Descripción:** El usuario accede a su cuenta existente.
**Criterios de aceptación:**
- Formulario con correo electrónico y contraseña.
- Validación de credenciales contra la base de datos.
- Mensajes de error claros si las credenciales son incorrectas.
- Redirección al catálogo tras iniciar sesión exitosamente.
**Estado:** Pendiente

### UC-09: Registro de Usuario (Register)
**Descripción:** El usuario crea una cuenta nueva.
**Criterios de aceptación:**
- Formulario con nombre completo, correo electrónico y contraseña.
- Validación de correo único en la base de datos.
- Confirmación de registro exitosa.
- Redirección al login tras registrar.
**Estado:** Pendiente

### UC-10: Diseño Responsivo Mobile-First
**Descripción:** La página se ve y funciona correctamente en celulares, tablets y escritorio.
**Criterios de aceptación:**
- Breakpoints: móvil (<768px), tableta (768-1024px), escritorio (>1024px).
- Touch targets mínimos de 48×48 px en botones y píldoras de talla.
- Carruseles de fotos aptos para deslizar con el dedo.
- Navegación táctil ergonómica.
**Estado:** Pendiente

### UC-11: Optimización de Activos y Carga
**Descripción:** La página carga rápido y muestra esqueletos mientras se cargan imágenes.
**Criterios de aceptación:**
- Carga diferida (`lazy loading`) de imágenes de producto.
- Esqueletos de carga (`skeletons`) elegantes mientras cargan fotos.
- Formatos ligeros: SVG para iconos, WebP/JPEG optimizado para fotos.
- Estados vacíos diseñados cuando un filtro no arroja resultados.
**Estado:** Pendiente

### UC-12: Accesibilidad (WCAG Nivel AA)
**Descripción:** La página es usable por personas con diversas capacidades.
**Criterios de aceptación:**
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- No depender únicamente del color para indicar estados interactivos.
- Navegación por teclado funcional (Tab, Enter, ESC).
- Etiquetas `alt` descriptivas en todas las imágenes de producto.
**Estado:** Pendiente

---

## 3. Base de Datos — Modelos Iniciales

Los 28 modelos del catálogo actual se cargan desde `src/base-datos/seed-productos.json` si aún faltan en MySQL; las tallas se importan con stock inicial cero.

| Marca | Modelos de referencia |
|-------|----------------------|
| Adidas | Samba blanco/negro, Samba blanco/gris, Adizero negra, Adizero roja, Adidas dama Magma, Terrex negras cabras |
| New Balance | 9060, 530, 9060 gris, 9060 hombre, New Balance genérico |
| Nike SB | SB blanco cabras, SB gris blanco dama, SB negra gris negro, SB negra blanco, SB Luis Vuitton, SB blanco gris, SB gris chulo negro, SB blanco chulo negro, Skate dama, Nike blanco gris |
| On Running | OnCloud, OnCloud Dama |
| Wider | Línea Wider 55k, Línea Wider 70k |
| Armani Exchange | AX negra suela goma |
| Urban / Calzado Casual / Paris | Línea Paris, Cabras zo blancos, calzado urbano general |

---

## 4. Estándares de Código

- **Idioma:** Español en interfaz, código, comentarios y documentación.
- **Nomenclatura de IDs y clases:** Español (ej. `id="boton-comprar"`, `.tarjeta-producto`).
- **Nomenclatura de variables y funciones JavaScript:** Español (ej. `productosDisponibles`, `filtrarPorMarca()`).
- **Nomenclatura de base de datos:** Español (ej. `usuarios`, `productos`, `tallas_disponibles`).
- **Comentarios:** Todo el código comentado en español.

---

## 5. Flujo de Aprobación

Todo cambio pasa por:
1. **Val** diseña y audita UI/UX (10 pasos).
2. **Jhon** propone visión y mejoras.
3. **Roky** revisa como gatekeeper (solo lectura).
4. Si Roky aprueba, se entrega al usuario.
