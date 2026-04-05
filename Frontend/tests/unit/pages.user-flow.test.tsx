// @vitest-environment jsdom
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { productA, productB } from './fixtures/products'

const { useProductsMock, useCartMock } = vi.hoisted(() => ({
    useProductsMock: vi.fn(),
    useCartMock: vi.fn()
}))

vi.mock('@/lib/context/ProductsContext', () => ({
    useProducts: useProductsMock
}))

vi.mock('@/lib/context/CartContext', () => ({
    useCart: useCartMock
}))

vi.mock('@/components/ProductCard', () => ({
    default: ({ sku }: { sku: string }) => <div data-testid="product-card">{sku}</div>
}))

vi.mock('@/components/FilterModal', () => ({
    default: ({ open }: { open: boolean }) => (
        <div data-testid="filter-modal">{open ? 'open' : 'closed'}</div>
    )
}))

import CategoryClient from '@/app/category/[slug]/CategoryClient'
import ProductClient from '@/app/product/[sku]/ProductClient'
import ConfirmClient from '@/app/confirm/ConfirmClient'
import OrderHistoryPage from '@/app/orderHistory/page'
import ProfileClient from '@/app/profile/ProfileClient'
import RegisterPage from '@/app/register/page'

describe('category/product/profile/register/confirm/order pages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        ;(globalThis as {
            __setTestSearchParams__: (value: string | URLSearchParams) => void
        }).__setTestSearchParams__('')
        ;(globalThis as { __TEST_ROUTER__: { push: ReturnType<typeof vi.fn> } }).__TEST_ROUTER__.push.mockReset()
    })

    it('renders filtered category products and opens filter modal', async () => {
        useProductsMock.mockReturnValue({
            products: [
                {
                    ...productA,
                    name: 'Acer Nitro',
                    specs: { memory: ['16gb ram'] }
                },
                {
                    ...productB,
                    sku: 'SKU-3',
                    name: 'Camera Sony',
                    specs: { memory: ['8gb ram'] }
                }
            ],
            loading: false
        })
        ;(globalThis as {
            __setTestSearchParams__: (value: string | URLSearchParams) => void
        }).__setTestSearchParams__('memory=16gb')

        const { container } = render(<CategoryClient slug="notebook" />)

        expect(screen.getByTestId('product-card')).toHaveTextContent('SKU-1')
        expect(screen.queryByText('SKU-3')).not.toBeInTheDocument()
        expect(screen.getByTestId('filter-modal')).toHaveTextContent('closed')

        const filterButton = container.querySelector('button') as HTMLElement
        fireEvent.click(filterButton)

        expect(screen.getByTestId('filter-modal')).toHaveTextContent('open')
    })

    it('handles product page loading, missing and found states', async () => {
        useProductsMock.mockReturnValue({ products: [], loading: true })
        const { rerender } = render(<ProductClient sku="SKU-1" />)
        expect(screen.queryByText(productA.name)).not.toBeInTheDocument()

        useProductsMock.mockReturnValue({ products: [], loading: false })
        rerender(<ProductClient sku="SKU-1" />)
        expect(screen.queryByText(productA.name)).not.toBeInTheDocument()

        useProductsMock.mockReturnValue({ products: [productA], loading: false })
        rerender(<ProductClient sku="SKU-1" />)

        expect(screen.getByText(productA.name)).toBeInTheDocument()
        await waitFor(() => {
            expect(localStorage.getItem('viewed')).toContain('SKU-1')
        })
    })

    it('saves confirm order from query string and avoids duplicates', async () => {
        useCartMock.mockReturnValue({ cart: [], clear: vi.fn(), total: 0 })
        localStorage.setItem('cart', JSON.stringify([{ sku: 'SKU-1', quantity: 1, price: 10 }]))
        ;(globalThis as {
            __setTestSearchParams__: (value: string | URLSearchParams) => void
        }).__setTestSearchParams__('order=12345')

        const { rerender } = render(<ConfirmClient />)
        await waitFor(() => {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]')
            expect(orders).toHaveLength(1)
            expect(orders[0].id).toBe(12345)
        })

        rerender(<ConfirmClient />)
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        expect(orders).toHaveLength(1)
        expect(localStorage.getItem('cart')).toBeNull()
    })

    it('renders and filters order history with expandable rows', async () => {
        useProductsMock.mockReturnValue({ products: [productA], loading: false })
        localStorage.setItem(
            'orders',
            JSON.stringify([
                {
                    id: 1,
                    date: '01.01.2026',
                    status: 'completed',
                    finishedAt: '02.01.2026',
                    total: 199.99,
                    items: [{ sku: 'SKU-1', quantity: 1 }]
                }
            ])
        )

        render(<OrderHistoryPage />)

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'completed' }
        })
        fireEvent.click(screen.getByText('1'))

        expect(await screen.findByText(productA.name)).toBeInTheDocument()
    })

    it('redirects to register when profile user is missing', async () => {
        render(<ProfileClient />)

        await waitFor(() => {
            expect(
                (globalThis as { __TEST_ROUTER__: { push: ReturnType<typeof vi.fn> } })
                    .__TEST_ROUTER__.push
            ).toHaveBeenCalledWith('/register')
        })
    })

    it('loads profile data and deletes account', async () => {
        localStorage.setItem(
            'user',
            JSON.stringify({
                name: 'Ivan',
                surname: 'Ivanov',
                email: 'ivan@example.com',
                password: 'secret',
                phone: '+37112345678'
            })
        )

        render(<ProfileClient />)

        expect(await screen.findByText(/ivan@example.com/i)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Удалить аккаунт' }))

        expect(localStorage.getItem('user')).toBeNull()
        expect(
            (globalThis as { __TEST_ROUTER__: { push: ReturnType<typeof vi.fn> } }).__TEST_ROUTER__
                .push
        ).toHaveBeenCalledWith('/register')
    })

    it('validates register form and saves user on success', async () => {
        const { container } = render(<RegisterPage />)

        fireEvent.change(container.querySelector('input[name="email"]') as HTMLInputElement, {
            target: { value: 'ivan@example.com' }
        })
        fireEvent.change(
            container.querySelector('input[name="password"]') as HTMLInputElement,
            { target: { value: 'pass1' } }
        )
        fireEvent.change(container.querySelector('input[name="repeatPassword"]') as HTMLInputElement, {
            target: { value: 'pass2' }
        })
        fireEvent.click(screen.getByRole('button', { name: /Зарегистрироваться/ }))

        expect(screen.getByText(/Пароли/)).toBeInTheDocument()

        fireEvent.change(container.querySelector('input[name="email"]') as HTMLInputElement, {
            target: { value: 'ivan@example.com' }
        })
        fireEvent.change(container.querySelector('input[name="name"]') as HTMLInputElement, {
            target: { value: 'Ivan' }
        })
        fireEvent.change(container.querySelector('input[name="surname"]') as HTMLInputElement, {
            target: { value: 'Ivanov' }
        })
        fireEvent.change(container.querySelector('input[name="repeatPassword"]') as HTMLInputElement, {
            target: { value: 'pass1' }
        })
        fireEvent.click(screen.getByRole('button', { name: /Зарегистрироваться/ }))

        expect(localStorage.getItem('user')).toContain('ivan@example.com')
        expect(
            (globalThis as { __TEST_ROUTER__: { push: ReturnType<typeof vi.fn> } }).__TEST_ROUTER__
                .push
        ).toHaveBeenCalledWith('/profile')
    })
})
