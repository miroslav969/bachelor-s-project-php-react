import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProductRow, mappedProduct } from './fixtures'

const { queryMock } = vi.hoisted(() => ({
    queryMock: vi.fn()
}))

vi.mock('@/lib/db', () => ({
    getPool: vi.fn(() => ({
        query: queryMock
    }))
}))

import { GET } from '@/app/api/products/[sku]/route'

describe('GET /api/products/[sku]', () => {
    beforeEach(() => {
        queryMock.mockReset()
    })

    it('returns product by sku', async () => {
        queryMock.mockResolvedValue([[createProductRow()]])

        const response = await GET(new Request('http://localhost/api/products/SKU-1'), {
            params: { sku: 'SKU-1' }
        })
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(sql).toContain('WHERE sku = ? LIMIT 1')
        expect(params).toEqual(['SKU-1'])
        expect(response.status).toBe(200)
        expect(await response.json()).toEqual(mappedProduct)
    })

    it('returns first row when db responds with multiple rows', async () => {
        queryMock.mockResolvedValue([
            [
                createProductRow({ sku: 'SKU-1' }),
                createProductRow({ sku: 'SKU-2', name: 'Second Product' })
            ]
        ])

        const response = await GET(new Request('http://localhost/api/products/SKU-1'), {
            params: { sku: 'SKU-1' }
        })

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual(mappedProduct)
    })

    it('returns 404 when product is missing', async () => {
        queryMock.mockResolvedValue([[]])

        const response = await GET(new Request('http://localhost/api/products/SKU-404'), {
            params: { sku: 'SKU-404' }
        })

        expect(response.status).toBe(404)
        expect(await response.json()).toEqual({ error: 'Product not found.' })
    })

    it('returns 500 when lookup fails', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        queryMock.mockRejectedValue(new Error('db failed'))

        const response = await GET(new Request('http://localhost/api/products/SKU-1'), {
            params: { sku: 'SKU-1' }
        })

        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({ error: 'Failed to load product.' })
        expect(errorSpy).toHaveBeenCalled()
    })
})
