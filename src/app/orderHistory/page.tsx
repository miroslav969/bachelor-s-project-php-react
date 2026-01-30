'use client'

import {Fragment, useEffect, useState} from 'react'
import { products } from '@/lib/products'
import Image from 'next/image'
import Link from 'next/link'

interface Order {
    id: number
    date: string
    status: string
    finishedAt: string
    total: number
    items: {
        sku: string
        quantity: number
    }[]
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [expanded, setExpanded] = useState<number | null>(null)
    const [filter, setFilter] = useState<'all' | 'completed'>('all')

    useEffect(() => {
        const stored = localStorage.getItem('orders')
        if (stored) {
            try {
                setOrders(JSON.parse(stored))
            } catch {
                setOrders([])
            }
        }
    }, [])

    const toggle = (id: number) => {
        setExpanded(prev => (prev === id ? null : id))
    }

    const getProduct = (sku: string) => products.find(p => p.sku === sku)

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === 'completed')

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 min-h-[100vh]">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">История покупок</h1>
                <Link href="/profile">
                    <button className="bg-yellow-400 cursor-pointer hover:bg-yellow-500 px-6 py-2 font-semibold rounded shadow">
                        Вернуться в профиль
                    </button>
                </Link>
            </div>

            <div className="mb-6">
                <label className="mr-4 font-medium">Фильтр:</label>
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value as 'all' | 'completed')}
                    className="border px-4 py-2 rounded"
                >
                    <option value="all">Все</option>
                    <option value="completed">Завершённые</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead>
                    <tr className="border-b border-gray-300">
                        <th className="py-3">Номер заказа</th>
                        <th className="py-3">Дата заказа</th>
                        <th className="py-3">Сумма</th>
                        <th className="py-3">Состояние</th>
                        <th className="py-3">Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrders.map(order => (
                        <Fragment key={order.id}>
                            <tr
                                className="cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                                onClick={() => toggle(order.id)}
                            >
                                <td className="py-4">{order.id}</td>
                                <td>{order.date}</td>
                                <td>{order.total.toFixed(2)} €</td>
                                <td>Заказ выполнен</td>
                                <td>Завершён {order.finishedAt}</td>
                            </tr>
                            {expanded === order.id && (
                                <tr className="bg-gray-50">
                                    <td colSpan={5} className="p-4">
                                        <h3 className="font-semibold mb-2">Товары</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {order.items.map((item, i) => {
                                                const product = getProduct(item.sku)
                                                if (!product) return null
                                                return (
                                                    <div key={i} className="flex items-center gap-4 p-2 border rounded">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            width={60}
                                                            height={60}
                                                            className="bg-gray-200 rounded"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-sm">{product.name}</p>
                                                            <p className="text-xs text-gray-500">{item.quantity} шт</p>
                                                            <p className="text-sm font-semibold">{(product.price * item.quantity).toFixed(2)} €</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}