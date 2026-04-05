// @vitest-environment jsdom
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { productA, productB } from './fixtures/products'

const {
    useLangMock,
    useCartMock,
    useWishlistMock,
    useProductsMock,
    toastSuccessMock
} = vi.hoisted(() => ({
    useLangMock: vi.fn(),
    useCartMock: vi.fn(),
    useWishlistMock: vi.fn(),
    useProductsMock: vi.fn(),
    toastSuccessMock: vi.fn()
}))

vi.mock('@/lib/context/LangContext', () => ({
    useLang: useLangMock
}))

vi.mock('@/lib/context/CartContext', () => ({
    useCart: useCartMock
}))

vi.mock('@/lib/context/WishlistContext', () => ({
    useWishlist: useWishlistMock
}))

vi.mock('@/lib/context/ProductsContext', () => ({
    useProducts: useProductsMock
}))

vi.mock('sonner', () => ({
    toast: {
        success: toastSuccessMock
    }
}))

vi.mock('@/components/ProductSection', () => ({
    default: ({
        title,
        products,
        limit
    }: {
        title: string
        products: Array<{ sku: string }>
        limit?: number
    }) => (
        <div data-testid="product-section">
            {title}:{products.map((p) => p.sku).join(',')}:{String(limit)}
        </div>
    )
}))

import LanguageSwitcher from '@/components/LanguageSwitcher'
import ProductCard from '@/components/ProductCard'
import LastViewed from '@/components/LastViewed'

describe('context-aware components', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    it('changes language from switcher dropdown', () => {
        const setLang = vi.fn()
        useLangMock.mockReturnValue({ lang: 'ru', setLang })

        render(<LanguageSwitcher />)

        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByText(/EN/i))

        expect(setLang).toHaveBeenCalledWith('en')
    })

    it('handles add-to-cart and wishlist toggle in product card', () => {
        const add = vi.fn()
        const toggle = vi.fn()
        useCartMock.mockReturnValue({ add })
        useWishlistMock.mockReturnValue({
            toggle,
            isInWishlist: () => false
        })

        render(<ProductCard {...productA} />)

        const buttons = screen.getAllByRole('button')
        fireEvent.click(buttons[0])
        fireEvent.click(buttons[1])

        expect(toggle).toHaveBeenCalledWith('SKU-1')
        expect(add).toHaveBeenCalledWith('SKU-1', 199.99)
        expect(toastSuccessMock).toHaveBeenCalled()
    })

    it('renders recently viewed section based on localStorage', () => {
        localStorage.setItem('viewed', JSON.stringify(['SKU-2', 'SKU-1']))
        useProductsMock.mockReturnValue({ products: [productA, productB] })

        render(<LastViewed />)

        expect(screen.getByTestId('product-section')).toHaveTextContent('SKU-2,SKU-1')
        expect(screen.getByTestId('product-section')).toHaveTextContent(':4')
    })
})
