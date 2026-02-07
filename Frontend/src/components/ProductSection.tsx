'use client'
import ProductCard from './ProductCard';
import React from "react";
import {Product} from "@/lib/products";

interface ProductSectionProps {
    title: string
    products: Product[]
    limit?: number
}

export default function ProductSection({ title, products, limit }: ProductSectionProps) {
    const displayedProducts = limit ? products.slice(0, limit) : products

    return (
        <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedProducts.map(product => (
                    <ProductCard key={product.sku} {...product} />
                ))}
            </div>
        </section>
    )
}
