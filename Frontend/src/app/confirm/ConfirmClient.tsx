'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useCart } from '@/lib/context/CartContext'

export default function ConfirmClient() {
    const searchParams = useSearchParams()
    const order = searchParams.get('order')
    const router = useRouter()
    const { cart, clear, total } = useCart()

    useEffect(() => {
        if (!order) return;

        const existing = localStorage.getItem('orders')
        const parsed = existing ? JSON.parse(existing) : []

        // Проверка на дубликат по ID
        if (!parsed.some((o: any) => o.id === Number(order))) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]')

            const newOrder = {
                id: Number(order),
                date: new Date().toLocaleDateString(),
                finishedAt: new Date().toLocaleDateString(),
                status: "completed",
                total: cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
                items: cart.map((item: any) => ({ sku: item.sku, quantity: item.quantity }))
            }

            const updated = [newOrder, ...parsed]
            localStorage.setItem('orders', JSON.stringify(updated))
            localStorage.removeItem('cart')
        }
    }, [order])


    return (
        <div className="p-6 text-center min-h-[100vh]">
            <h1 className="text-2xl font-bold mb-4">Спасибо за заказ!</h1>
            {order && <p className="text-lg">Номер заказа: <strong>{order}</strong></p>}
        </div>
    )
}
