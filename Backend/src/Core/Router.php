<?php
declare(strict_types=1);

namespace App\Core;

final class Router
{
    /** @var array<int, array{method:string, pattern:string, regex:string, keys:array<int,string>, handler:callable, middleware:array<int,object>}> */
    private array $routes = [];

    public function __construct(private Request $req, private Response $res) {}

    public function get(string $pattern, callable $handler, array $middleware = []): void { $this->add('GET', $pattern, $handler, $middleware); }
    public function post(string $pattern, callable $handler, array $middleware = []): void { $this->add('POST', $pattern, $handler, $middleware); }
    public function put(string $pattern, callable $handler, array $middleware = []): void { $this->add('PUT', $pattern, $handler, $middleware); }
    public function delete(string $pattern, callable $handler, array $middleware = []): void { $this->add('DELETE', $pattern, $handler, $middleware); }

    private function add(string $method, string $pattern, callable $handler, array $middleware): void
    {
        $keys = [];
        $regex = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', function ($m) use (&$keys) {
            $keys[] = $m[1];
            return '([^/]+)';
        }, $pattern);
        $regex = '#^' . $regex . '$#';

        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'regex' => $regex,
            'keys' => $keys,
            'handler' => $handler,
            'middleware' => $middleware,
        ];
    }

    public function dispatch(): void
    {
        $method = $this->req->method;
        $path = $this->req->path;

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            if (preg_match($route['regex'], $path, $m)) {
                array_shift($m);
                $params = [];
                foreach ($route['keys'] as $i => $k) {
                    $params[$k] = $m[$i] ?? null;
                }
                $this->req->params = $params;

                try {
                    foreach ($route['middleware'] as $mw) {
                        if (method_exists($mw, 'handle')) {
                            $mw->handle($this->req, $this->res);
                        }
                    }
                    ($route['handler'])($this->req, $this->res);
                } catch (\Throwable $e) {
                    $debug = (int)($_ENV['APP_DEBUG'] ?? '0') === 1;
                    $payload = ['error' => 'Internal Server Error'];
                    if ($debug) {
                        $payload['details'] = $e->getMessage();
                        $payload['trace'] = array_slice(explode("\n", $e->getTraceAsString()), 0, 10);
                    }
                    $this->res->json($payload, 500);
                }
                return;
            }
        }

        $this->res->error('Not Found', 404);
    }
}
