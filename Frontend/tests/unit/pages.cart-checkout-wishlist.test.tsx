// @vitest-environment jsdom
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { productA, productB } from './fixtures/products'

const { useCartMock, useProductsMock, useWishlistMock } = vi.hoisted(() => ({
    useCartMock: vi.fn(),
    useProductsMock: vi.fn(),
    useWishlistMock: vi.fn()
}))

vi.mock('@/lib/context/CartContext', () => ({
    useCart: useCartMock
}))

vi.mock('@/lib/context/ProductsContext', () => ({
    useProducts: useProductsMock
}))

vi.mock('@/lib/context/WishlistContext', () => ({
    useWishlist: useWishlistMock
}))

vi.mock('@/components/ProductCard', () => ({
    default: ({ sku }: { sku: string }) => <div data-testid="product-card">{sku}</div>
}))

import CartPage from '@/app/cart/page'
import CheckoutPage from '@/app/checkout/page'
import WishlistPage from '@/app/wishlist/page'

describe('cart, checkout and wishlist pages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        const router = (globalThis as { __TEST_ROUTER__: { push: ReturnType<typeof vi.fn> } })
            .__TEST_ROUTER__
        router.push.mockReset()
    })

    it('renders cart items and handles cart actions', () => {
        const increase = vi.fn()
        const decrease = vi.fn()
        const remove = vi.fn()
        useCartMock.mockReturnValue({
            cart: [{ sku: 'SKU-1', quantity: 2, price: 199.99 }],
            increase,
            decrease,
            remove,
            totalCount: 2,
            total: 399.98
        })
        useProductsMock.mockReturnValue({
            products: [productA],
            loading: false
        })

        render(<CartPage />)

        expect(screen.getByText(productA.name)).toBeInTheDocument()
        const buttons = screen.getAllByRole('button')
        fireEvent.click(buttons[0])
        fireEvent.click(buttons[1])
        fireEvent.click(buttons[2])
        fireEvent.click(buttons[3])

        expect(decrease).toHaveBeenCalledWith('SKU-1')
        expect(increase).toHaveBeenCalledWith('SKU-1')
        expect(remove).toHaveBeenCalledWith('SKU-1')
        expect(
            (globalThis as { __TEST_ROUTER__: { push: ReturnType<typeof vi.fn> } }).__TEST_ROUTER__
                .push
        ).toHaveBeenCalledWith('/checkout')
    })

    it('submits checkout and navigates to confirm page', () => {
        useCartMock.mockReturnValue({ total: 100 })
        vi.spyOn(Math, 'random').mockReturnValue(0)
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

        render(<CheckoutPage />)

        fireEvent.click(screen.getByRole('button', { name: 'Заказать' }))
        expect(alertSpy).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('checkbox'))
        fireEvent.click(screen.getByRole('button', { name: 'Заказать' }))

        expect(
            (globalThis as { __TEST_ROUTER__: { push: ReturnType<typeof vi.fn> } }).__TEST_ROUTER__
                .push
        ).toHaveBeenCalledWith('/confirm?order=10000')
    })

    it('renders wishlist states based on loading and items', () => {
        useWishlistMock.mockReturnValue({ wishlist: ['SKU-2'] })
        useProductsMock.mockReturnValue({ products: [productA, productB], loading: true })

        const { rerender } = render(<WishlistPage />)
        expect(screen.getByText(/Загрузка товаров/)).toBeInTheDocument()

        useProductsMock.mockReturnValue({ products: [productA], loading: false })
        rerender(<WishlistPage />)
        expect(screen.getByText(/Список пуст/)).toBeInTheDocument()

        useProductsMock.mockReturnValue({ products: [productA, productB], loading: false })
        rerender(<WishlistPage />)
        expect(screen.getByTestId('product-card')).toHaveTextContent('SKU-2')
    })
})
