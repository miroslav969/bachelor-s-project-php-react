<?php
declare(strict_types=1);

use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Controllers\AuthController;
use App\Controllers\CategoryController;
use App\Controllers\ProductController;
use App\Controllers\CartController;
use App\Controllers\OrderController;

require __DIR__ . '/../vendor/autoload.php';

$dotenvPath = dirname(__DIR__);
if (file_exists($dotenvPath . '/.env')) {
    Dotenv\Dotenv::createImmutable($dotenvPath)->safeLoad();
}

$debug = (int)($_ENV['APP_DEBUG'] ?? '0') === 1;
if ($debug) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

// --- CORS ---
$allowedOrigins = array_filter(array_map('trim', explode(',', $_ENV['CORS_ALLOW_ORIGINS'] ?? '*')));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array('*', $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$request = Request::fromGlobals();
$response = new Response();

$router = new Router($request, $response);

// Controllers
$auth = new AuthController();
$categories = new CategoryController();
$products = new ProductController();
$cart = new CartController();
$orders = new OrderController();

$requireAuth = [new AuthMiddleware()];
$requireAdmin = [new AuthMiddleware(), new RoleMiddleware(['ADMIN'])];

// Health
$router->get('/api/health', fn() => $response->json(['ok' => true, 'ts' => date('c')]));

// Auth
$router->post('/api/auth/register', [$auth, 'register']);
$router->post('/api/auth/login', [$auth, 'login']);
$router->post('/api/auth/refresh', [$auth, 'refresh']);
$router->post('/api/auth/logout', [$auth, 'logout'], $requireAuth);
$router->get('/api/auth/me', [$auth, 'me'], $requireAuth);

// Categories
$router->get('/api/categories', [$categories, 'list']);
$router->get('/api/categories/{id}', [$categories, 'get']);
$router->post('/api/categories', [$categories, 'create'], $requireAdmin);
$router->put('/api/categories/{id}', [$categories, 'update'], $requireAdmin);
$router->delete('/api/categories/{id}', [$categories, 'delete'], $requireAdmin);

// Products
$router->get('/api/products', [$products, 'list']);
$router->get('/api/products/{id}', [$products, 'get']);
$router->post('/api/products', [$products, 'create'], $requireAdmin);
$router->put('/api/products/{id}', [$products, 'update'], $requireAdmin);
$router->delete('/api/products/{id}', [$products, 'delete'], $requireAdmin);

// Cart (auth)
$router->get('/api/cart', [$cart, 'getCart'], $requireAuth);
$router->post('/api/cart/items', [$cart, 'addItem'], $requireAuth);
$router->put('/api/cart/items/{productId}', [$cart, 'updateItem'], $requireAuth);
$router->delete('/api/cart/items/{productId}', [$cart, 'removeItem'], $requireAuth);
$router->post('/api/cart/clear', [$cart, 'clear'], $requireAuth);

// Orders
$router->post('/api/orders', [$orders, 'checkout'], $requireAuth);
$router->get('/api/orders', [$orders, 'listMine'], $requireAuth);
$router->get('/api/orders/{id}', [$orders, 'getMine'], $requireAuth);

// Admin orders
$router->get('/api/admin/orders', [$orders, 'adminList'], $requireAdmin);
$router->get('/api/admin/orders/{id}', [$orders, 'adminGet'], $requireAdmin);

$router->dispatch();
