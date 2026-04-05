// @vitest-environment jsdom
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/app/globals.css', () => ({}))
vi.mock('/src/app/globals.css', () => ({}))
vi.mock('@/app/globals.css', () => ({}))

vi.mock('@/components/Header', () => ({
    default: () => <div data-testid="header">header</div>
}))

vi.mock('@/components/Footer', () => ({
    default: () => <div data-testid="footer">footer</div>
}))

vi.mock('@/lib/context/LangContext', () => ({
    LangProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="lang-provider">{children}</div>
    ),
    useLang: vi.fn(() => ({ lang: 'ru', setLang: vi.fn() }))
}))

vi.mock('@/lib/context/ProductsContext', () => ({
    ProductsProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="products-provider">{children}</div>
    ),
    useProducts: vi.fn()
}))

vi.mock('@/lib/context/CartContext', () => ({
    CartProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="cart-provider">{children}</div>
    ),
    useCart: vi.fn(() => ({ cart: [], total: 0 }))
}))

vi.mock('@/lib/context/WishlistContext', () => ({
    WishlistProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="wishlist-provider">{children}</div>
    ),
    useWishlist: vi.fn(() => ({ wishlist: [] }))
}))

vi.mock('@/components/PromoSlider', () => ({
    default: () => <div data-testid="promo-slider">promo</div>
}))

vi.mock('@/components/ProductSection', () => ({
    default: ({ title }: { title: string }) => <div data-testid="product-section">{title}</div>
}))

vi.mock('@/components/LastViewed', () => ({
    default: () => <div data-testid="last-viewed">last</div>
}))

import RootLayout from '@/app/layout'
import HomePage from '@/app/page'
import { useProducts } from '@/lib/context/ProductsContext'

const useProductsMock = vi.mocked(useProducts)

describe('layout and home page', () => {
    it('creates root layout tree with metadata and children', () => {
        const tree = RootLayout({
            children: <div data-testid="child">child</div>
        })

        expect(tree.type).toBe('html')
        expect(tree.props.lang).toBe('en')
        expect(tree.props.children.type).toBe('body')
    })

    it('shows loading state on home page', () => {
        useProductsMock.mockReturnValue({
            products: [],
            loading: true,
            error: null,
            refresh: vi.fn()
        })

        render(<HomePage />)
        expect(screen.getByTestId('promo-slider')).toBeInTheDocument()
        expect(screen.getByText(/Р—Р°РіСЂСѓР·РєР°/)).toBeInTheDocument()
    })

    it('shows products section when loading is finished', () => {
        useProductsMock.mockReturnValue({
            products: [{ sku: 'SKU-1' }],
            loading: false,
            error: null,
            refresh: vi.fn()
        } as any)

        render(<HomePage />)
        expect(screen.getByTestId('product-section')).toBeInTheDocument()
        expect(screen.getByTestId('last-viewed')).toBeInTheDocument()
    })
})
