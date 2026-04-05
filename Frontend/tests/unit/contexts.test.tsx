// @vitest-environment jsdom
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider, useCart } from '@/lib/context/CartContext'
import { LangProvider, useLang } from '@/lib/context/LangContext'
import { ProductsProvider, useProducts } from '@/lib/context/ProductsContext'
import { WishlistProvider, useWishlist } from '@/lib/context/WishlistContext'

function CartProbe() {
    const { cart, add, increase, decrease, remove, clear, totalCount, total } = useCart()
    return (
        <div>
            <button onClick={() => add('SKU-1', 10)}>add</button>
            <button onClick={() => increase('SKU-1')}>increase</button>
            <button onClick={() => decrease('SKU-1')}>decrease</button>
            <button onClick={() => remove('SKU-1')}>remove</button>
            <button onClick={() => clear()}>clear</button>
            <div data-testid="cart">{JSON.stringify(cart)}</div>
            <div data-testid="count">{String(totalCount)}</div>
            <div data-testid="total">{String(total)}</div>
        </div>
    )
}

function LangProbe() {
    const { lang, setLang } = useLang()
    return (
        <div>
            <button onClick={() => setLang('en')}>to-en</button>
            <div data-testid="lang">{lang}</div>
        </div>
    )
}

function ProductsProbe() {
    const { products, loading, error, refresh } = useProducts()
    return (
        <div>
            <button onClick={() => refresh()}>refresh</button>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="error">{error ?? ''}</div>
            <div data-testid="products">{products.length}</div>
        </div>
    )
}

function WishlistProbe() {
    const { wishlist, toggle, isInWishlist } = useWishlist()
    return (
        <div>
            <button onClick={() => toggle('SKU-1')}>toggle</button>
            <div data-testid="items">{wishlist.join(',')}</div>
            <div data-testid="contains">{String(isInWishlist('SKU-1'))}</div>
        </div>
    )
}

describe('contexts', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('throws when useCart is used outside provider', () => {
        expect(() => render(<CartProbe />)).toThrow('useCart must be used within a CartProvider')
    })

    it('supports cart actions and totals', async () => {
        localStorage.setItem('cart', JSON.stringify([{ sku: 'SKU-1', quantity: 2, price: 10 }]))
        render(
            <CartProvider>
                <CartProbe />
            </CartProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('count')).toHaveTextContent('2')
            expect(screen.getByTestId('total')).toHaveTextContent('20')
        })

        fireEvent.click(screen.getByText('increase'))
        expect(screen.getByTestId('count')).toHaveTextContent('3')
        expect(screen.getByTestId('total')).toHaveTextContent('30')

        fireEvent.click(screen.getByText('decrease'))
        expect(screen.getByTestId('count')).toHaveTextContent('2')

        fireEvent.click(screen.getByText('remove'))
        expect(screen.getByTestId('count')).toHaveTextContent('0')
        expect(screen.getByTestId('total')).toHaveTextContent('0')

        fireEvent.click(screen.getByText('add'))
        expect(screen.getByTestId('count')).toHaveTextContent('1')
        expect(screen.getByTestId('total')).toHaveTextContent('10')

        fireEvent.click(screen.getByText('clear'))
        expect(screen.getByTestId('count')).toHaveTextContent('0')
        expect(localStorage.getItem('cart')).toBe('[]')
    })

    it('loads and changes language', async () => {
        localStorage.setItem('lang', 'lv')
        render(
            <LangProvider>
                <LangProbe />
            </LangProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('lang')).toHaveTextContent('lv')
        })

        fireEvent.click(screen.getByText('to-en'))
        expect(screen.getByTestId('lang')).toHaveTextContent('en')
        expect(localStorage.getItem('lang')).toBe('en')
    })

    it('loads products successfully and handles refresh failure', async () => {
        const fetchMock = vi.fn()
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ sku: 'SKU-1', name: 'Keyboard' }]
        })
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 500
        })
        vi.stubGlobal('fetch', fetchMock)

        render(
            <ProductsProvider>
                <ProductsProbe />
            </ProductsProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false')
        })
        expect(screen.getByTestId('products')).toHaveTextContent('1')
        expect(screen.getByTestId('error')).toHaveTextContent('')

        await act(async () => {
            fireEvent.click(screen.getByText('refresh'))
        })

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false')
            expect(screen.getByTestId('products')).toHaveTextContent('0')
            expect(screen.getByTestId('error').textContent).toContain('Request failed with 500')
        })
    })

    it('toggles wishlist and checks inclusion', async () => {
        localStorage.setItem('wishlist', JSON.stringify(['SKU-2']))
        render(
            <WishlistProvider>
                <WishlistProbe />
            </WishlistProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('items')).toHaveTextContent('SKU-2')
        })
        expect(screen.getByTestId('contains')).toHaveTextContent('false')

        fireEvent.click(screen.getByText('toggle'))
        expect(screen.getByTestId('items').textContent).toContain('SKU-1')
        expect(screen.getByTestId('contains')).toHaveTextContent('true')

        fireEvent.click(screen.getByText('toggle'))
        expect(screen.getByTestId('contains')).toHaveTextContent('false')
    })
})
