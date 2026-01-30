'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface WishlistContextType {
    wishlist: string[]
    toggle: (sku: string) => void
    isInWishlist: (sku: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<string[]>([])

    useEffect(() => {
        const stored = localStorage.getItem('wishlist')
        if (stored) setWishlist(JSON.parse(stored))
    }, [])

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }, [wishlist])

    const toggle = (sku: string) => {
        setWishlist(prev =>
            prev.includes(sku) ? prev.filter(i => i !== sku) : [...prev, sku]
        )
    }

    const isInWishlist = (sku: string) => wishlist.includes(sku)

    return (
        <WishlistContext.Provider value={{ wishlist, toggle, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    )
}

export const useWishlist = () => {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
