<?php
declare(strict_types=1);

namespace App\Core;

final class Request
{
    public string $method;
    public string $path;
    public array $query;
    public array $headers;
    public mixed $body;
    public array $params = [];
    public array $auth = []; // set by middleware: ['userId'=>..., 'role'=>...]

    private function __construct() {}

    public static function fromGlobals(): self
    {
        $r = new self();
        $r->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $parts = parse_url($uri);
        $r->path = $parts['path'] ?? '/';

        parse_str($parts['query'] ?? '', $q);
        $r->query = $q;

        $r->headers = self::getAllHeadersNormalized();

        $raw = file_get_contents('php://input');
        $ct = $r->headers['content-type'] ?? '';
        if (is_string($raw) && $raw !== '' && str_contains($ct, 'application/json')) {
            $decoded = json_decode($raw, true);
            $r->body = is_array($decoded) ? $decoded : null;
        } else {
            $r->body = null;
        }

        return $r;
    }

    private static function getAllHeadersNormalized(): array
    {
        $headers = [];
        foreach ($_SERVER as $k => $v) {
            if (str_starts_with($k, 'HTTP_')) {
                $name = strtolower(str_replace('_', '-', substr($k, 5)));
                $headers[$name] = $v;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['content-type'] = $_SERVER['CONTENT_TYPE'];
        }
        if (isset($_SERVER['AUTHORIZATION'])) {
            $headers['authorization'] = $_SERVER['AUTHORIZATION'];
        }
        return $headers;
    }
}
