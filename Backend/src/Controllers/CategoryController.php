<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Uuid;

final class CategoryController
{
    public function list(Request $req, Response $res): void
    {
        $pdo = Database::pdo();
        $rows = $pdo->query('SELECT id, name, parent_id, created_at, updated_at FROM categories ORDER BY name')->fetchAll();
        $res->json(['items' => $rows]);
    }

    public function get(Request $req, Response $res): void
    {
        $id = (string)($req->params['id'] ?? '');
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id, name, parent_id, created_at, updated_at FROM categories WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            $res->error('Category not found', 404);
            return;
        }
        $res->json(['item' => $row]);
    }

    public function create(Request $req, Response $res): void
    {
        $b = is_array($req->body) ? $req->body : [];
        $name = trim((string)($b['name'] ?? ''));
        $parentId = isset($b['parentId']) ? trim((string)$b['parentId']) : null;

        if ($name === '') {
            $res->error('name is required', 422);
            return;
        }

        $pdo = Database::pdo();
        $id = Uuid::v4();

        if ($parentId === '') $parentId = null;

        $stmt = $pdo->prepare('
            INSERT INTO categories (id, name, parent_id, created_at, updated_at)
            VALUES (:id, :name, :pid, NOW(), NOW())
        ');
        $stmt->execute(['id' => $id, 'name' => $name, 'pid' => $parentId]);

        $res->json(['item' => ['id' => $id, 'name' => $name, 'parent_id' => $parentId]], 201);
    }

    public function update(Request $req, Response $res): void
    {
        $id = (string)($req->params['id'] ?? '');
        $b = is_array($req->body) ? $req->body : [];

        $name = array_key_exists('name', $b) ? trim((string)$b['name']) : null;
        $parentId = array_key_exists('parentId', $b) ? trim((string)$b['parentId']) : null;

        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id FROM categories WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        if (!$stmt->fetch()) {
            $res->error('Category not found', 404);
            return;
        }

        $fields = [];
        $params = ['id' => $id];

        if ($name !== null) {
            if ($name === '') { $res->error('name cannot be empty', 422); return; }
            $fields[] = 'name = :name';
            $params['name'] = $name;
        }
        if ($parentId !== null) {
            if ($parentId === '') $parentId = null;
            if ($parentId === $id) { $res->error('parentId cannot equal id', 422); return; }
            $fields[] = 'parent_id = :pid';
            $params['pid'] = $parentId;
        }
        if (!$fields) {
            $res->error('Nothing to update', 422);
            return;
        }

        $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = :id';
        $upd = $pdo->prepare($sql);
        $upd->execute($params);

        $res->json(['ok' => true]);
    }

    public function delete(Request $req, Response $res): void
    {
        $id = (string)($req->params['id'] ?? '');
        $pdo = Database::pdo();

        // If products exist in category, forbid deletion (simpler rule for diploma).
        $chk = $pdo->prepare('SELECT COUNT(*) c FROM products WHERE category_id = :id');
        $chk->execute(['id' => $id]);
        $c = (int)($chk->fetch()['c'] ?? 0);
        if ($c > 0) {
            $res->error('Category has products; cannot delete', 409);
            return;
        }

        $stmt = $pdo->prepare('DELETE FROM categories WHERE id = :id');
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            $res->error('Category not found', 404);
            return;
        }

        $res->json(['ok' => true]);
    }
}
