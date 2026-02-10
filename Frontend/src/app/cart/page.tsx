'use client'

import Image from 'next/image'
import {useCart} from "@/lib/context/CartContext";
import { useRouter } from "next/navigation"
import { useProducts } from "@/lib/context/ProductsContext";

interface CartItem {
    sku: string
    quantity: number
}

export default function Page() {
    const { cart, increase, decrease, remove, totalCount, total } = useCart();
    const router = useRouter()
    const { products, loading } = useProducts()

    const getProduct = (sku: string) => products.find((p) => p.sku === sku)

    return (
        <div className="max-w-4xl h-max mx-auto p-6 min-h-[100vh]">
            <h1 className="text-2xl font-bold mb-6">Корзина</h1>

            {loading && cart.length > 0 && (
                <p className="text-gray-500">Загрузка товаров...</p>
            )}
            {!loading && cart.map((item) => {
                const product = getProduct(item.sku)
                if (!product) return null

                return (
                    <div key={item.sku} className="flex flex-col sm:flex-row gap-6 mb-8">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={180}
                            height={180}
                            className="bg-gray-200 object-contain rounded"
                        />

                        <div className="flex-1">
                            <p className="font-semibold">{product.name}</p>
                            <p className="mt-1 text-sm text-gray-600">
                                Общая стоимость : € {(product.price * item.quantity).toFixed(2)}
                            </p>

                            <div className="flex items-center mt-4 gap-4">
                                <button
                                    onClick={() => decrease(item.sku)}
                                    className="bg-black text-white w-8 h-8 rounded"
                                >
                                    –
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => increase(item.sku)}
                                    className="bg-black text-white w-8 h-8 rounded"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => remove(item.sku)}
                                className="mt-2 text-sm text-red-500 hover:underline"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                )
            })}

            {cart.length > 0 ? (
                <button onClick={() => router.push("/checkout")} className="bg-yellow-400
                hover:bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold mt-6 cursor-pointer">
                    Оформить заказ
                </button>
            ) : (
                <p className="text-gray-500">Корзина пуста</p>
            )}
        </div>
    )
}
