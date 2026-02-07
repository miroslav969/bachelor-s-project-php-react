<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Uuid;

final class OrderController
{
    public function checkout(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $pdo = Database::pdo();

        // Find active cart
        $cStmt = $pdo->prepare('SELECT id FROM carts WHERE user_id = :uid AND status = "ACTIVE" LIMIT 1');
        $cStmt->execute(['uid' => $userId]);
        $cart = $cStmt->fetch();
        if (!$cart) {
            $res->error('Cart is empty', 409);
            return;
        }
        $cartId = $cart['id'];

        $iStmt = $pdo->prepare('
            SELECT ci.product_id, ci.qty, p.price
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = :cid
        ');
        $iStmt->execute(['cid' => $cartId]);
        $items = $iStmt->fetchAll();

        if (!$items) {
            $res->error('Cart is empty', 409);
            return;
        }

        $total = 0.0;
        foreach ($items as $it) {
            $total += (float)$it['price'] * (int)$it['qty'];
        }

        $pdo->beginTransaction();
        try {
            $orderId = Uuid::v4();

            $oStmt = $pdo->prepare('
                INSERT INTO orders (id, user_id, status, total, created_at, updated_at)
                VALUES (:id, :uid, "NEW", :total, NOW(), NOW())
            ');
            $oStmt->execute(['id' => $orderId, 'uid' => $userId, 'total' => $total]);

            $oiStmt = $pdo->prepare('
                INSERT INTO order_items (id, order_id, product_id, qty, price, created_at)
                VALUES (:id, :oid, :pid, :qty, :price, NOW())
            ');
            foreach ($items as $it) {
                $oiStmt->execute([
                    'id' => Uuid::v4(),
                    'oid' => $orderId,
                    'pid' => $it['product_id'],
                    'qty' => (int)$it['qty'],
                    'price' => (float)$it['price'],
                ]);
            }

            // close cart
            $pdo->prepare('UPDATE carts SET status = "CLOSED", updated_at = NOW() WHERE id = :id')
                ->execute(['id' => $cartId]);
            $pdo->prepare('DELETE FROM cart_items WHERE cart_id = :cid')->execute(['cid' => $cartId]);

            $pdo->commit();

            $res->json(['ok' => true, 'orderId' => $orderId, 'total' => $total], 201);
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public function listMine(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $pdo = Database::pdo();

        $stmt = $pdo->prepare('
            SELECT id, status, total, created_at, updated_at
            FROM orders
            WHERE user_id = :uid
            ORDER BY created_at DESC
        ');
        $stmt->execute(['uid' => $userId]);
        $res->json(['items' => $stmt->fetchAll()]);
    }

    public function getMine(Request $req, Response $res): void
    {
        $userId = (string)$req->auth['userId'];
        $orderId = (string)($req->params['id'] ?? '');
        $pdo = Database::pdo();

        $o = $pdo->prepare('SELECT id, user_id, status, total, created_at, updated_at FROM orders WHERE id = :id LIMIT 1');
        $o->execute(['id' => $orderId]);
        $order = $o->fetch();
        if (!$order) { $res->error('Order not found', 404); return; }
        if ($order['user_id'] !== $userId && (string)$req->auth['role'] !== 'ADMIN') {
            $res->error('Forbidden', 403);
            return;
        }

        $it = $pdo->prepare('
            SELECT oi.product_id, p.name, oi.qty, oi.price, (oi.qty * oi.price) AS lineTotal
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = :oid
            ORDER BY p.name
        ');
        $it->execute(['oid' => $orderId]);

        $res->json(['order' => $order, 'items' => $it->fetchAll()]);
    }

    public function adminList(Request $req, Response $res): void
    {
        $pdo = Database::pdo();
        $stmt = $pdo->query('
            SELECT o.id, o.user_id, u.email, o.status, o.total, o.created_at
            FROM orders o
            JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
        ');
        $res->json(['items' => $stmt->fetchAll()]);
    }

    public function adminGet(Request $req, Response $res): void
    {
        $orderId = (string)($req->params['id'] ?? '');
        $pdo = Database::pdo();

        $o = $pdo->prepare('
            SELECT o.id, o.user_id, u.email, o.status, o.total, o.created_at, o.updated_at
            FROM orders o
            JOIN users u ON u.id = o.user_id
            WHERE o.id = :id
            LIMIT 1
        ');
        $o->execute(['id' => $orderId]);
        $order = $o->fetch();
        if (!$order) { $res->error('Order not found', 404); return; }

        $it = $pdo->prepare('
            SELECT oi.product_id, p.name, oi.qty, oi.price, (oi.qty * oi.price) AS lineTotal
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = :oid
            ORDER BY p.name
        ');
        $it->execute(['oid' => $orderId]);

        $res->json(['order' => $order, 'items' => $it->fetchAll()]);
    }
}
