'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'

type ProductsContextValue = {
    products: Product[]
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined)

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/products')
            if (!response.ok) {
                throw new Error(`Request failed with ${response.status}`)
            }
            const data = (await response.json()) as Product[]
            setProducts(data)
        } catch (err) {
            setProducts([])
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const value = useMemo(
        () => ({ products, loading, error, refresh }),
        [products, loading, error, refresh]
    )

    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export const useProducts = () => {
    const context = useContext(ProductsContext)
    if (!context) {
        throw new Error('useProducts must be used within a ProductsProvider')
    }
    return context
}
