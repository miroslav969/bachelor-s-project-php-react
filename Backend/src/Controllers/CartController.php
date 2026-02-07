<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Uuid;

final class CartController
{
    public function getCart(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $pdo = Database::pdo();

        $cartId = $this->ensureCart($userId, $pdo);

        $items = $this->getItems($cartId, $pdo);
        $totals = $this->calcTotals($items);

        $res->json([
            'cart' => ['id' => $cartId, 'user_id' => $userId],
            'items' => $items,
            'totals' => $totals
        ]);
    }

    public function addItem(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $b = is_array($req->body) ? $req->body : [];
        $productId = trim((string)($b['productId'] ?? ''));
        $qty = (int)($b['qty'] ?? 1);

        if ($productId === '' || $qty <= 0) {
            $res->error('productId and qty (>0) are required', 422);
            return;
        }

        $pdo = Database::pdo();
        $cartId = $this->ensureCart($userId, $pdo);

        // Ensure product exists
        $p = $pdo->prepare('SELECT id, price FROM products WHERE id = :id LIMIT 1');
        $p->execute(['id' => $productId]);
        $prod = $p->fetch();
        if (!$prod) {
            $res->error('Product not found', 404);
            return;
        }

        // Upsert item
        $stmt = $pdo->prepare('SELECT qty FROM cart_items WHERE cart_id = :cid AND product_id = :pid LIMIT 1');
        $stmt->execute(['cid' => $cartId, 'pid' => $productId]);
        $row = $stmt->fetch();

        if ($row) {
            $newQty = (int)$row['qty'] + $qty;
            $upd = $pdo->prepare('UPDATE cart_items SET qty = :q, updated_at = NOW() WHERE cart_id = :cid AND product_id = :pid');
            $upd->execute(['q' => $newQty, 'cid' => $cartId, 'pid' => $productId]);
        } else {
            $ins = $pdo->prepare('
                INSERT INTO cart_items (id, cart_id, product_id, qty, created_at, updated_at)
                VALUES (:id, :cid, :pid, :q, NOW(), NOW())
            ');
            $ins->execute(['id' => Uuid::v4(), 'cid' => $cartId, 'pid' => $productId, 'q' => $qty]);
        }

        $items = $this->getItems($cartId, $pdo);
        $res->json(['ok' => true, 'items' => $items, 'totals' => $this->calcTotals($items)]);
    }

    public function updateItem(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $productId = (string)($req->params['productId'] ?? '');
        $b = is_array($req->body) ? $req->body : [];
        $qty = (int)($b['qty'] ?? 0);

        if ($productId === '' || $qty <= 0) {
            $res->error('qty (>0) is required', 422);
            return;
        }

        $pdo = Database::pdo();
        $cartId = $this->ensureCart($userId, $pdo);

        $upd = $pdo->prepare('UPDATE cart_items SET qty = :q, updated_at = NOW() WHERE cart_id = :cid AND product_id = :pid');
        $upd->execute(['q' => $qty, 'cid' => $cartId, 'pid' => $productId]);

        if ($upd->rowCount() === 0) {
            $res->error('Item not found', 404);
            return;
        }

        $items = $this->getItems($cartId, $pdo);
        $res->json(['ok' => true, 'items' => $items, 'totals' => $this->calcTotals($items)]);
    }

    public function removeItem(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $productId = (string)($req->params['productId'] ?? '');

        if ($productId === '') {
            $res->error('productId is required', 422);
            return;
        }

        $pdo = Database::pdo();
        $cartId = $this->ensureCart($userId, $pdo);

        $del = $pdo->prepare('DELETE FROM cart_items WHERE cart_id = :cid AND product_id = :pid');
        $del->execute(['cid' => $cartId, 'pid' => $productId]);

        $items = $this->getItems($cartId, $pdo);
        $res->json(['ok' => true, 'items' => $items, 'totals' => $this->calcTotals($items)]);
    }

    public function clear(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $pdo = Database::pdo();
        $cartId = $this->ensureCart($userId, $pdo);

        $pdo->prepare('DELETE FROM cart_items WHERE cart_id = :cid')->execute(['cid' => $cartId]);
        $res->json(['ok' => true]);
    }

    private function ensureCart(string $userId, \PDO $pdo): string
    {
        $stmt = $pdo->prepare('SELECT id FROM carts WHERE user_id = :uid AND status = "ACTIVE" LIMIT 1');
        $stmt->execute(['uid' => $userId]);
        $row = $stmt->fetch();

        if ($row) return $row['id'];

        $id = Uuid::v4();
        $ins = $pdo->prepare('
            INSERT INTO carts (id, user_id, status, created_at, updated_at)
            VALUES (:id, :uid, "ACTIVE", NOW(), NOW())
        ');
        $ins->execute(['id' => $id, 'uid' => $userId]);
        return $id;
    }

    private function getItems(string $cartId, \PDO $pdo): array
    {
        $stmt = $pdo->prepare('
            SELECT ci.product_id, ci.qty, p.name, p.price
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = :cid
            ORDER BY p.name
        ');
        $stmt->execute(['cid' => $cartId]);
        $items = $stmt->fetchAll();

        foreach ($items as &$it) {
            $it['lineTotal'] = (float)$it['price'] * (int)$it['qty'];
        }
        return $items;
    }

    private function calcTotals(array $items): array
    {
        $sum = 0.0;
        $qty = 0;
        foreach ($items as $it) {
            $sum += (float)$it['lineTotal'];
            $qty += (int)$it['qty'];
        }
        return ['itemsCount' => $qty, 'sum' => $sum];
    }
}
