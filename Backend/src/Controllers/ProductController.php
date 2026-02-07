<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Uuid;

final class ProductController
{
    public function list(Request $req, Response $res): void
    {
        $pdo = Database::pdo();

        $q = trim((string)($req->query['q'] ?? ''));
        $categoryId = trim((string)($req->query['categoryId'] ?? ''));
        $limit = max(1, min(100, (int)($req->query['limit'] ?? 20)));
        $offset = max(0, (int)($req->query['offset'] ?? 0));

        $where = [];
        $params = [];

        if ($q !== '') {
            $where[] = '(p.name LIKE :q OR p.description LIKE :q)';
            $params['q'] = '%' . $q . '%';
        }
        if ($categoryId !== '') {
            $where[] = 'p.category_id = :cid';
            $params['cid'] = $categoryId;
        }

        $sql = 'SELECT p.id, p.category_id, c.name as category_name, p.name, p.description, p.price, p.images, p.created_at, p.updated_at
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset';

        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue(':' . $k, $v);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $items = $stmt->fetchAll();

        // total
        $countSql = 'SELECT COUNT(*) c FROM products p';
        if ($where) $countSql .= ' WHERE ' . implode(' AND ', $where);
        $cStmt = $pdo->prepare($countSql);
        foreach ($params as $k => $v) $cStmt->bindValue(':' . $k, $v);
        $cStmt->execute();
        $total = (int)($cStmt->fetch()['c'] ?? 0);

        $res->json(['items' => $items, 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
    }

    public function get(Request $req, Response $res): void
    {
        $id = (string)($req->params['id'] ?? '');
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('
            SELECT p.id, p.category_id, c.name as category_name, p.name, p.description, p.price, p.images, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.id = :id
            LIMIT 1
        ');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            $res->error('Product not found', 404);
            return;
        }
        $res->json(['item' => $row]);
    }

    public function create(Request $req, Response $res): void
    {
        $b = is_array($req->body) ? $req->body : [];
        $name = trim((string)($b['name'] ?? ''));
        $description = trim((string)($b['description'] ?? ''));
        $categoryId = trim((string)($b['categoryId'] ?? ''));
        $price = $b['price'] ?? null;
        $images = $b['images'] ?? [];

        if ($name === '' || $categoryId === '' || $price === null) {
            $res->error('name, categoryId, price are required', 422);
            return;
        }
        if (!is_numeric($price) || (float)$price < 0) {
            $res->error('Invalid price', 422);
            return;
        }
        if (!is_array($images)) $images = [];

        $pdo = Database::pdo();
        $id = Uuid::v4();

        $stmt = $pdo->prepare('
            INSERT INTO products (id, category_id, name, description, price, images, created_at, updated_at)
            VALUES (:id, :cid, :name, :descr, :price, :images, NOW(), NOW())
        ');
        $stmt->execute([
            'id' => $id,
            'cid' => $categoryId,
            'name' => $name,
            'descr' => $description,
            'price' => (float)$price,
            'images' => json_encode($images, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        ]);

        $res->json(['item' => ['id' => $id]], 201);
    }

    public function update(Request $req, Response $res): void
    {
        $id = (string)($req->params['id'] ?? '');
        $b = is_array($req->body) ? $req->body : [];

        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id FROM products WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        if (!$stmt->fetch()) {
            $res->error('Product not found', 404);
            return;
        }

        $fields = [];
        $params = ['id' => $id];

        if (array_key_exists('name', $b)) {
            $name = trim((string)$b['name']);
            if ($name === '') { $res->error('name cannot be empty', 422); return; }
            $fields[] = 'name = :name';
            $params['name'] = $name;
        }
        if (array_key_exists('description', $b)) {
            $fields[] = 'description = :descr';
            $params['descr'] = trim((string)$b['description']);
        }
        if (array_key_exists('categoryId', $b)) {
            $cid = trim((string)$b['categoryId']);
            if ($cid === '') { $res->error('categoryId cannot be empty', 422); return; }
            $fields[] = 'category_id = :cid';
            $params['cid'] = $cid;
        }
        if (array_key_exists('price', $b)) {
            $price = $b['price'];
            if (!is_numeric($price) || (float)$price < 0) { $res->error('Invalid price', 422); return; }
            $fields[] = 'price = :price';
            $params['price'] = (float)$price;
        }
        if (array_key_exists('images', $b)) {
            $images = $b['images'];
            if (!is_array($images)) { $res->error('images must be array', 422); return; }
            $fields[] = 'images = :images';
            $params['images'] = json_encode($images, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        if (!$fields) {
            $res->error('Nothing to update', 422);
            return;
        }

        $sql = 'UPDATE products SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = :id';
        $upd = $pdo->prepare($sql);
        $upd->execute($params);

        $res->json(['ok' => true]);
    }

    public function delete(Request $req, Response $res): void
    {
        $id = (string)($req->params['id'] ?? '');
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            $res->error('Product not found', 404);
            return;
        }

        $res->json(['ok' => true]);
    }
}
