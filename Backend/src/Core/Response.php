<?php
declare(strict_types=1);

namespace App\Core;

final class Response
{
    public function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public function error(string $message, int $status = 400, array $extra = []): void
    {
        $payload = array_merge(['error' => $message], $extra);
        $this->json($payload, $status);
    }
}
