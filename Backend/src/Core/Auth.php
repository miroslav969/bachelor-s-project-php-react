<?php
declare(strict_types=1);

namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class Auth
{
    public static function createAccessToken(string $userId, string $role): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? 'change_me';
        $issuer = $_ENV['JWT_ISSUER'] ?? 'diploma-api';
        $ttl = (int)($_ENV['JWT_ACCESS_TTL'] ?? '900');

        $now = time();
        $payload = [
            'iss' => $issuer,
            'iat' => $now,
            'exp' => $now + $ttl,
            'sub' => $userId,
            'role' => $role,
            'typ' => 'access'
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }

    public static function verifyAccessToken(string $jwt): array
    {
        $secret = $_ENV['JWT_SECRET'] ?? 'change_me';
        $decoded = JWT::decode($jwt, new Key($secret, 'HS256'));
        $arr = (array)$decoded;

        if (($arr['typ'] ?? '') !== 'access') {
            throw new \RuntimeException('Invalid token type');
        }
        return $arr;
    }

    public static function generateRefreshToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(64)), '+/', '-_'), '=');
    }

    public static function hashRefreshToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
