<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Uuid;
use App\Core\Auth;

final class AuthController
{
    public function register(Request $req, Response $res): void
    {
        $b = is_array($req->body) ? $req->body : [];
        $name = trim((string)($b['name'] ?? ''));
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $password = (string)($b['password'] ?? '');

        if ($name === '' || $email === '' || $password === '') {
            $res->error('name, email, password are required', 422);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $res->error('Invalid email', 422);
            return;
        }
        if (mb_strlen($password) < 6) {
            $res->error('Password too short (min 6)', 422);
            return;
        }

        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) {
            $res->error('Email already exists', 409);
            return;
        }

        $id = Uuid::v4();
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $role = 'USER';

        $stmt = $pdo->prepare('
            INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
            VALUES (:id, :name, :email, :ph, :role, NOW(), NOW())
        ');
        $stmt->execute([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'ph' => $hash,
            'role' => $role
        ]);

        $res->json([
            'user' => ['id' => $id, 'name' => $name, 'email' => $email, 'role' => $role],
        ], 201);
    }

    public function login(Request $req, Response $res): void
    {
        $b = is_array($req->body) ? $req->body : [];
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $password = (string)($b['password'] ?? '');

        if ($email === '' || $password === '') {
            $res->error('email and password are required', 422);
            return;
        }

        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $u = $stmt->fetch();

        if (!$u || !password_verify($password, $u['password_hash'])) {
            $res->error('Invalid credentials', 401);
            return;
        }

        $access = Auth::createAccessToken($u['id'], $u['role']);
        $refresh = Auth::generateRefreshToken();

        $this->storeRefreshToken($u['id'], $refresh);

        $res->json([
            'accessToken' => $access,
            'refreshToken' => $refresh,
            'user' => [
                'id' => $u['id'],
                'name' => $u['name'],
                'email' => $u['email'],
                'role' => $u['role'],
            ]
        ]);
    }

    public function refresh(Request $req, Response $res): void
    {
        $b = is_array($req->body) ? $req->body : [];
        $token = trim((string)($b['refreshToken'] ?? ''));

        if ($token === '') {
            $res->error('refreshToken is required', 422);
            return;
        }

        $pdo = Database::pdo();
        $hash = Auth::hashRefreshToken($token);

        $stmt = $pdo->prepare('
            SELECT id, user_id, expires_at, revoked_at
            FROM refresh_tokens
            WHERE token_hash = :h
            LIMIT 1
        ');
        $stmt->execute(['h' => $hash]);
        $row = $stmt->fetch();

        if (!$row) {
            $res->error('Invalid refresh token', 401);
            return;
        }
        if ($row['revoked_at'] !== null) {
            $res->error('Refresh token revoked', 401);
            return;
        }
        if (strtotime($row['expires_at']) < time()) {
            $res->error('Refresh token expired', 401);
            return;
        }

        // Rotation: revoke old and issue new
        $pdo->beginTransaction();
        try {
            $upd = $pdo->prepare('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = :id');
            $upd->execute(['id' => $row['id']]);

            // Load user
            $uStmt = $pdo->prepare('SELECT id, role FROM users WHERE id = :id LIMIT 1');
            $uStmt->execute(['id' => $row['user_id']]);
            $u = $uStmt->fetch();
            if (!$u) {
                $pdo->rollBack();
                $res->error('User not found', 404);
                return;
            }

            $newRefresh = Auth::generateRefreshToken();
            $this->storeRefreshToken($u['id'], $newRefresh, $pdo);

            $pdo->commit();

            $newAccess = Auth::createAccessToken($u['id'], $u['role']);
            $res->json([
                'accessToken' => $newAccess,
                'refreshToken' => $newRefresh,
            ]);
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public function logout(Request $req, Response $res): void
    {
        $b = is_array($req->body) ? $req->body : [];
        $token = trim((string)($b['refreshToken'] ?? ''));

        if ($token === '') {
            $res->error('refreshToken is required', 422);
            return;
        }
        $pdo = Database::pdo();
        $hash = Auth::hashRefreshToken($token);

        $stmt = $pdo->prepare('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = :h AND revoked_at IS NULL');
        $stmt->execute(['h' => $hash]);

        $res->json(['ok' => true]);
    }

    public function me(Request $req, Response $res): void
    {
        $userId = (string)($req->auth['userId'] ?? '');
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $userId]);
        $u = $stmt->fetch();
        if (!$u) {
            $res->error('User not found', 404);
            return;
        }
        $res->json(['user' => $u]);
    }

    private function storeRefreshToken(string $userId, string $refreshToken, ?\PDO $pdo = null): void
    {
        $pdo = $pdo ?? Database::pdo();

        $ttlDays = (int)($_ENV['REFRESH_TTL_DAYS'] ?? '30');
        $hash = Auth::hashRefreshToken($refreshToken);

        $stmt = $pdo->prepare('
            INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
            VALUES (:id, :uid, :h, DATE_ADD(NOW(), INTERVAL :days DAY), NOW())
        ');
        $stmt->execute([
            'id' => \App\Core\Uuid::v4(),
            'uid' => $userId,
            'h' => $hash,
            'days' => $ttlDays
        ]);
    }
}
