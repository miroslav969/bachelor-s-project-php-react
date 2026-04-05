// @vitest-environment jsdom
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { products } from './fixtures/products'

vi.mock('@/components/ProductCard', () => ({
    default: ({ sku }: { sku: string }) => <div data-testid="product-card">{sku}</div>
}))

import BlogSection from '@/components/BlogSection'
import Footer from '@/components/Footer'
import ProductSection from '@/components/ProductSection'
import FilterModal from '@/components/FilterModal'
import CategoryFilterModal from '@/components/CategoryFilterModal'
import CatalogModal from '@/components/CatalogModal'

describe('simple components', () => {
    it('renders blog section', () => {
        render(<BlogSection />)
        expect(screen.getByRole('heading')).toBeInTheDocument()
    })

    it('renders footer with navigation links', () => {
        render(<Footer />)
        expect(screen.getAllByRole('link')).toHaveLength(4)
    })

    it('renders product section and applies limit', () => {
        render(<ProductSection title="Featured" products={products} limit={1} />)
        expect(screen.getByText('Featured')).toBeInTheDocument()
        expect(screen.getAllByTestId('product-card')).toHaveLength(1)
    })

    it('shows and closes filter modal', () => {
        const setOpen = vi.fn()
        const { container } = render(<FilterModal open setOpen={setOpen} />)

        fireEvent.click(container.querySelector('.bg-black\\/50') as HTMLElement)
        expect(setOpen).toHaveBeenCalledWith(false)
    })

    it('shows and closes category filter modal', () => {
        const setOpen = vi.fn()
        render(<CategoryFilterModal open setOpen={setOpen} />)

        fireEvent.click(screen.getAllByRole('button')[0])
        expect(setOpen).toHaveBeenCalledWith(false)
    })

    it('renders catalog modal and switches category links', () => {
        const setOpen = vi.fn()
        render(
            <CatalogModal
                open
                setOpen={setOpen}
                categories={['tv-video', 'audio']}
                subcategories={[]}
            />
        )

        expect(screen.getByText('Каталог')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Аудио'))
        expect(screen.getByText('Наушники')).toBeInTheDocument()
    })
})
