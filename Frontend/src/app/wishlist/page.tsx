'use client'

import ProductCard from '@/components/ProductCard'
import {useWishlist} from "@/lib/context/WishlistContext";
import { useProducts } from '@/lib/context/ProductsContext'

export default function WishlistPage() {
    const { wishlist } = useWishlist()
    const { products, loading } = useProducts()
    const items = products.filter(p => wishlist.includes(p.sku))

    return (
        <div className="max-w-6xl mx-auto px-4 min-h-[100vh] py-10">
            <h1 className="text-2xl font-bold mb-6">Список желаемого</h1>

            {loading ? (
                <p className="text-gray-600">Загрузка товаров...</p>
            ) : items.length === 0 ? (
                <p className="text-gray-600">Список пуст</p>
            ) : (
                <div className="grid 2xl:grid-cols-3 xl:grid-cols-2 md:grid-cols-1 gap-4">
                    {items.map((p) => (
                        <ProductCard key={p.sku} {...p} />
                    ))}
                </div>
            )}
        </div>
    )
}
