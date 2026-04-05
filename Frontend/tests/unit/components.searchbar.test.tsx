// @vitest-environment jsdom
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchBar from '@/components/SearchBar'

describe('SearchBar', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    it('does not request api for query shorter than 2 chars', async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        render(<SearchBar />)
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } })

        await act(async () => {
            vi.advanceTimersByTime(300)
        })

        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('shows search results and closes on outside click', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [
                {
                    sku: 'SKU-1',
                    name: 'Gaming Keyboard',
                    image: '/images/keyboard.png',
                    price: 199.99,
                    available: true
                }
            ]
        })
        vi.stubGlobal('fetch', fetchMock)

        render(<SearchBar />)
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'keyboard' } })

        await act(async () => {
            vi.advanceTimersByTime(300)
            await Promise.resolve()
        })

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/products/search?q=keyboard&limit=8',
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        )
        expect(screen.getByText('Gaming Keyboard')).toBeInTheDocument()

        fireEvent.mouseDown(document.body)
        expect(screen.queryByText('Gaming Keyboard')).not.toBeInTheDocument()
    })
})
