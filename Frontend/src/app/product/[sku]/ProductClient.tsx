'use client'
import { notFound } from 'next/navigation'
import {products} from "@/lib/products";
import {useEffect} from "react";

export default function ProductClient({ sku }: { sku: string }) {
    const product = products.find(p => p.sku === sku)
    if (!product) return notFound()

    useEffect(() => {
        if (typeof window === 'undefined') return

        const viewed = JSON.parse(localStorage.getItem('viewed') || '[]')
        const updated = [product.sku, ...viewed.filter((sku: string) => sku !== product.sku)].slice(0, 10)
        localStorage.setItem('viewed', JSON.stringify(updated))
    }, [product])

    return (
        <main className="p-8 max-w-7xl mx-auto min-h-[100vh]">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Изображение */}
                <div className="flex-shrink-0 bg-gray-100 rounded-xl w-[400px] h-[400px] flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="object-contain max-h-full" />
                </div>

                {/* Информация */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-green-600 font-medium mb-4">{product.available ? '● в наличии' : 'Нет в наличии'}</p>

                    {product.subtitle && <h2 className="font-bold text-lg mb-2">{product.subtitle}</h2>}

                    {product.advantages && (
                        <ul className="list-disc pl-5 text-sm text-gray-700 mb-4">
                            {product.advantages.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    )}

                    <div className="text-2xl font-bold mb-4">€ {product.price}</div>

                    <div className="flex gap-4">
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold">
                            В корзину
                        </button>
                        <button className="bg-black text-white w-10 h-10 rounded-lg font-bold text-xl flex items-center justify-center">
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            {/* Описание */}
            {product.description && (
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-2">Описание</h3>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
            )}

            {/* Спецификации */}
            {product.specs && (
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-6">Спецификация</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        {Object.entries(product.specs).map(([section, values]) => (
                            <div key={section}>
                                <h4 className="font-semibold mb-2">{section}</h4>
                                <ul className="space-y-1 text-gray-700">
                                    {values.map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}
