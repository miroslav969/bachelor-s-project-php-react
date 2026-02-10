'use client'

import ProductSection from "@/components/ProductSection"
import { useEffect, useState } from "react"
import { useProducts } from "@/lib/context/ProductsContext"

export default function LastViewed() {
    const [recentProducts, setRecentProducts] = useState([])
    const { products } = useProducts()

    useEffect(() => {
        if (!products.length) return
        const viewed = JSON.parse(localStorage.getItem('viewed') || '[]')
        const recent = viewed.map((sku: string) => products.find(p => p.sku === sku)).filter(Boolean)
        setRecentProducts(recent)
    }, [products])

    return (
        <>
            {recentProducts.length > 0 && (
                <ProductSection title="Недавно просмотренные" products={recentProducts} limit={4} />
            )}
        </>
    )
}
