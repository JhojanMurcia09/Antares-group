<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';

apiRun(static function (): void {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        apiRespond([
            'autenticado' => ($_SESSION['antares_admin'] ?? false) === true,
            'nombre' => $_SESSION['antares_admin_nombre'] ?? '',
        ]);
    }

    apiRequireSameOrigin();
    if ($method === 'POST') {
        $input = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($input)) {
            apiFail('Solicitud de inicio de sesión inválida.');
        }

        $admin = apiConfig()['admin'];
        $username = trim((string) ($input['usuario'] ?? ''));
        $password = (string) ($input['contrasena'] ?? '');
        if (
            !hash_equals((string) $admin['username'], $username)
            || !password_verify($password, (string) $admin['password_hash'])
        ) {
            apiFail('Credenciales incorrectas.', 401);
        }

        session_regenerate_id(true);
        $_SESSION['antares_admin'] = true;
        $_SESSION['antares_admin_nombre'] = (string) ($admin['name'] ?? 'Administrador');
        apiRespond(['autenticado' => true, 'nombre' => $_SESSION['antares_admin_nombre']]);
    }

    if ($method === 'DELETE') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => 'Strict',
            ]);
        }
        session_destroy();
        apiRespond(['autenticado' => false]);
    }

    apiFail('Método no permitido.', 405);
});
