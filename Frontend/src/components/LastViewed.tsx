'use client'

import ProductSection from "@/components/ProductSection"
import { products } from "@/lib/products"
import { useEffect, useState } from "react"

export default function LastViewed() {
    const [recentProducts, setRecentProducts] = useState([])

    useEffect(() => {
        const viewed = JSON.parse(localStorage.getItem('viewed') || '[]')
        const recent = viewed.map((sku: string) => products.find(p => p.sku === sku)).filter(Boolean)
        setRecentProducts(recent)
    }, [])

    return (
        <>
            {recentProducts.length > 0 && (
                <ProductSection title="Недавно просмотренные" products={recentProducts} limit={4} />
            )}
        </>
    )
}
