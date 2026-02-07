<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Auth;

final class AuthMiddleware
{
    public function handle(Request $req, Response $res): void
    {
        $hdr = $req->headers['authorization'] ?? '';
        if (!is_string($hdr) || !str_starts_with($hdr, 'Bearer ')) {
            $res->error('Unauthorized', 401);
            exit;
        }
        $jwt = trim(substr($hdr, 7));
        try {
            $claims = Auth::verifyAccessToken($jwt);
            $req->auth = [
                'userId' => (string)($claims['sub'] ?? ''),
                'role' => (string)($claims['role'] ?? 'USER'),
            ];
            if ($req->auth['userId'] === '') {
                $res->error('Unauthorized', 401);
                exit;
            }
        } catch (\Throwable $e) {
            $res->error('Unauthorized', 401);
            exit;
        }
    }
}
