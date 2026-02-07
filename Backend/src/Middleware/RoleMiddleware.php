<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

final class RoleMiddleware
{
    /** @param array<int, string> $allowedRoles */
    public function __construct(private array $allowedRoles) {}

    public function handle(Request $req, Response $res): void
    {
        $role = (string)($req->auth['role'] ?? '');
        if (!in_array($role, $this->allowedRoles, true)) {
            $res->error('Forbidden', 403);
            exit;
        }
    }
}
