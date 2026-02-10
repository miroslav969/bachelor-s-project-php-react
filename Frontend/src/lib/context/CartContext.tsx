'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
    sku: string
    quantity: number
    price: number
}

interface CartContextType {
    cart: CartItem[]
    add: (sku: string, price: number) => void
    remove: (sku: string) => void
    increase: (sku: string) => void
    decrease: (sku: string) => void
    clear: () => void
    totalCount: number
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([])

    useEffect(() => {
        const stored = localStorage.getItem('cart')
        if (stored) {
            try {
                setCart(JSON.parse(stored))
            } catch {
                setCart([])
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart))
    }, [cart])

    const add = (sku: string, price: number) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.sku === sku)
            if (existing) {
                return prev.map((item) =>
                    item.sku === sku ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { sku, quantity: 1, price }]
        })
    }

    const remove = (sku: string) => {
        setCart((prev) => prev.filter((item) => item.sku !== sku))
    }

    const increase = (sku: string) => {
        setCart((prev) =>
            prev.map((item) =>
                item.sku === sku ? { ...item, quantity: item.quantity + 1 } : item
            )
        )
    }

    const decrease = (sku: string) => {
        setCart((prev) =>
            prev.map((item) =>
                item.sku === sku && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        )
    }

    const clear = () => setCart([])

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <CartContext.Provider
            value={{ cart, add, remove, increase, decrease, clear, totalCount, total }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
