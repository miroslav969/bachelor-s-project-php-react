// @vitest-environment jsdom
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/category/[slug]/CategoryClient', () => ({
    default: ({ slug }: { slug: string }) => <div data-testid="category-client">{slug}</div>
}))

vi.mock('@/app/product/[sku]/ProductClient', () => ({
    default: ({ sku }: { sku: string }) => <div data-testid="product-client">{sku}</div>
}))

vi.mock('@/app/profile/ProfileClient', () => ({
    default: () => <div data-testid="profile-client">profile</div>
}))

vi.mock('@/app/confirm/ConfirmClient', () => ({
    default: () => <div data-testid="confirm-client">confirm</div>
}))

import CategoryPage from '@/app/category/[slug]/page'
import ProductPage from '@/app/product/[sku]/page'
import ProfilePage from '@/app/profile/page'
import ConfirmPage from '@/app/confirm/page'

describe('page wrappers', () => {
    it('passes slug to category client', async () => {
        const view = await CategoryPage({ params: { slug: 'audio' } })
        render(view)
        expect(screen.getByTestId('category-client')).toHaveTextContent('audio')
    })

    it('passes sku to product client', async () => {
        const view = await ProductPage({ params: { sku: 'SKU-1' } })
        render(view)
        expect(screen.getByTestId('product-client')).toHaveTextContent('SKU-1')
    })

    it('renders profile page client', () => {
        render(<ProfilePage />)
        expect(screen.getByTestId('profile-client')).toBeInTheDocument()
    })

    it('renders confirm client inside suspense boundary', () => {
        render(<ConfirmPage />)
        expect(screen.getByTestId('confirm-client')).toBeInTheDocument()
    })
})
