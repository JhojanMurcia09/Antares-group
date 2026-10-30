/**
 * Registro e inicio de sesión locales para la demostración del storefront.
 * La autenticación real debe implementarse en un servidor antes de publicar.
 */
const AutenticacionLocal = (() => {
    const CLAVE_CUENTAS = "antares_cuentas_demo";
    const ITERACIONES = 120000;

    function obtenerCuentas() {
        const guardadas = localStorage.getItem(CLAVE_CUENTAS);
        if (!guardadas) return [];

        const cuentas = JSON.parse(guardadas);
        if (!Array.isArray(cuentas)) {
            throw new Error("No se pudieron leer las cuentas locales. Borra los datos del sitio e inténtalo de nuevo.");
        }
        return cuentas;
    }

    function asegurarWebCrypto() {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error("El navegador no ofrece almacenamiento seguro. Abre la tienda desde localhost o HTTPS.");
        }
    }

    function codificarBase64(bytes) {
        return btoa(String.fromCharCode(...new Uint8Array(bytes)));
    }

    async function derivarClave(contrasena, salt) {
        const clave = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(contrasena),
            "PBKDF2",
            false,
            ["deriveBits"]
        );
        const resultado = await crypto.subtle.deriveBits(
            { name: "PBKDF2", salt, iterations: ITERACIONES, hash: "SHA-256" },
            clave,
            256
        );
        return codificarBase64(resultado);
    }

    async function registrar(nombre, correo, contrasena) {
        if (sessionStorage.getItem("antares_admin_auth") !== "true") {
            throw new Error("Solo el administrador puede crear cuentas de clientes.");
        }
        asegurarWebCrypto();
        const cuentas = obtenerCuentas();
        const correoNormalizado = correo.trim().toLocaleLowerCase("es");
        if (cuentas.some(cuenta => cuenta.correo === correoNormalizado)) {
            return false;
        }

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const hash = await derivarClave(contrasena, salt);
        cuentas.push({
            nombre: nombre.trim(),
            correo: correoNormalizado,
            salt: codificarBase64(salt),
            hash
        });
        localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
        return true;
    }

    async function autenticar(correo, contrasena) {
        asegurarWebCrypto();
        const correoNormalizado = correo.trim().toLocaleLowerCase("es");
        const cuenta = obtenerCuentas().find(usuario => usuario.correo === correoNormalizado);
        if (!cuenta) return null;

        const salt = Uint8Array.from(atob(cuenta.salt), caracter => caracter.charCodeAt(0));
        const hash = await derivarClave(contrasena, salt);
        return hash === cuenta.hash ? cuenta : null;
    }

    function guardarSesion(cuenta, recordar) {
        localStorage.removeItem("antares_usuario_demo");
        localStorage.removeItem("antares_nombre_demo");
        sessionStorage.removeItem("antares_usuario_demo");
        sessionStorage.removeItem("antares_nombre_demo");

        const almacenamiento = recordar ? localStorage : sessionStorage;
        almacenamiento.setItem("antares_usuario_demo", cuenta.correo);
        almacenamiento.setItem("antares_nombre_demo", cuenta.nombre);
    }

    return { registrar, autenticar, guardarSesion };
})();

if (typeof window !== "undefined") {
    window.AutenticacionLocal = AutenticacionLocal;
}
