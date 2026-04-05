// @vitest-environment jsdom
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { useLangMock, useCartMock } = vi.hoisted(() => ({
    useLangMock: vi.fn(),
    useCartMock: vi.fn()
}))

vi.mock('next/client', () => ({
    router: {}
}))

vi.mock('@/lib/context/LangContext', () => ({
    useLang: useLangMock
}))

vi.mock('@/lib/context/CartContext', () => ({
    useCart: useCartMock
}))

vi.mock('@/components/LanguageSwitcher', () => ({
    default: () => <div data-testid="lang-switcher" />
}))

vi.mock('@/components/SearchBar', () => ({
    default: () => <div data-testid="search-bar" />
}))

vi.mock('@/components/CatalogModal', () => ({
    default: ({
        open,
        categories,
        subcategories
    }: {
        open: boolean
        categories: string[]
        subcategories: string[]
    }) => (
        <div data-testid="catalog-modal">
            {`${open}-${categories.length}-${subcategories.length}`}
        </div>
    )
}))

import Header from '@/components/Header'
import PromoSlider from '@/components/PromoSlider'

describe('Header and PromoSlider', () => {
    beforeEach(() => {
        useLangMock.mockReturnValue({ lang: 'en', setLang: vi.fn() })
        useCartMock.mockReturnValue({
            cart: [{ sku: 'SKU-1', quantity: 2, price: 99 }],
            total: 198
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    it('loads catalog data and opens catalog from header', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            json: async () => ({
                categories: ['tv-video', 'audio'],
                subcategories: ['televisions']
            })
        })
        vi.stubGlobal('fetch', fetchMock)

        const { container } = render(<Header />)

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('http://api:8080/catalog.php')
            expect(screen.getByTestId('catalog-modal')).toHaveTextContent('false-2-1')
        })

        const buttons = container.querySelectorAll('button')
        fireEvent.click(buttons[0])
        expect(screen.getByTestId('catalog-modal')).toHaveTextContent('true-2-1')
    })

    it('opens catalog modal from slider and keeps fetched categories', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            json: async () => ({
                categories: ['apple'],
                subcategories: ['iphone', 'ipad']
            })
        })
        vi.stubGlobal('fetch', fetchMock)

        const { container } = render(<PromoSlider />)

        await waitFor(() => {
            expect(screen.getByTestId('catalog-modal')).toHaveTextContent('false-1-2')
        })

        const clickableSlide = container.querySelector('.cursor-pointer') as HTMLElement
        fireEvent.click(clickableSlide)

        expect(screen.getByTestId('catalog-modal')).toHaveTextContent('true-1-2')
    })
})
