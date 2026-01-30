'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { products } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import { SlidersHorizontal } from 'lucide-react'
import FilterModal from '@/components/FilterModal'

export default function CategoryClient({ slug }: { slug: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({})
    const [filterOpen, setFilterOpen] = useState(false)

    useEffect(() => {
        const newFilters: { [key: string]: string[] } = {}
        for (const [key, value] of searchParams.entries()) {
            if (!newFilters[key]) newFilters[key] = []
            newFilters[key].push(value)
        }
        setSelectedFilters(newFilters)
    }, [searchParams])

    const handleFilterChange = (filter: string, value: string) => {
        const newFilters = { ...selectedFilters }
        if (!newFilters[filter]) newFilters[filter] = []
        if (newFilters[filter].includes(value)) {
            newFilters[filter] = newFilters[filter].filter(v => v !== value)
        } else {
            newFilters[filter].push(value)
        }
        setSelectedFilters(newFilters)

        const query = new URLSearchParams()
        Object.entries(newFilters).forEach(([key, values]) => {
            values.forEach(v => query.append(key, v))
        })
        router.push(`?${query.toString()}`)
    }

    const filteredProducts = products.filter(p => {
        if (
            slug === 'notebook' &&
            !['acer', 'asus', 'lenovo', 'macbook'].some(brand =>
                p.name.toLowerCase().includes(brand)
            )
        ) {
            return false
        }

        for (const [filter, values] of Object.entries(selectedFilters)) {
            const specValue = Object.values(p.specs ?? {}).flat().join(' ').toLowerCase()
            if (!values.some(v => specValue.includes(v.toLowerCase()))) return false
        }

        return true
    })

    return (
        <div className="gap-8 p-6 min-h-[100vh] relative container mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8 capitalize">{slug}</h1>

            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={() => setFilterOpen(true)}
                    className="w-12 h-12 rounded-md bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition"
                >
                    <SlidersHorizontal className="w-5 h-5 text-black" />
                </button>
            </div>

            <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                {filteredProducts.map(product => (
                    <ProductCard key={product.sku} {...product} />
                ))}
                {filteredProducts.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center">Товары не найдены</p>
                )}
            </main>

            <FilterModal open={filterOpen} setOpen={setFilterOpen} />
        </div>
    )
}
