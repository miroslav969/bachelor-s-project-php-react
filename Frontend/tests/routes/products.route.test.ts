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

import { GET } from '@/app/api/products/route'

describe('GET /api/products', () => {
    beforeEach(() => {
        queryMock.mockReset()
    })

    it('returns products for base query', async () => {
        queryMock.mockResolvedValue([[createProductRow()]])

        const response = await GET(new Request('http://localhost/api/products'))
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(response.status).toBe(200)
        expect(sql).toContain('FROM products')
        expect(sql).not.toContain('WHERE sku IN')
        expect(sql).not.toContain('LIMIT ?')
        expect(params).toEqual([])
        expect(await response.json()).toEqual([mappedProduct])
    })

    it('filters by sku list and clamps limit to 200', async () => {
        queryMock.mockResolvedValue([[createProductRow()]])

        await GET(
            new Request('http://localhost/api/products?skus=SKU-1,SKU-2&limit=500')
        )
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(sql).toContain('WHERE sku IN (?, ?)')
        expect(sql).toContain('LIMIT ?')
        expect(params).toEqual(['SKU-1', 'SKU-2', 200])
    })

    it('trims and keeps only non-empty sku values', async () => {
        queryMock.mockResolvedValue([[]])

        await GET(
            new Request('http://localhost/api/products?skus=  SKU-1 , , SKU-2  ,')
        )
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(sql).toContain('WHERE sku IN (?, ?)')
        expect(params).toEqual(['SKU-1', 'SKU-2'])
    })

    it('returns empty list when skus parameter has no values', async () => {
        const response = await GET(new Request('http://localhost/api/products?skus=,, ,'))

        expect(queryMock).not.toHaveBeenCalled()
        expect(response.status).toBe(200)
        expect(await response.json()).toEqual([])
    })

    it('ignores invalid limit value', async () => {
        queryMock.mockResolvedValue([[]])

        await GET(new Request('http://localhost/api/products?limit=abc'))
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(sql).not.toContain('LIMIT ?')
        expect(params).toEqual([])
    })

    it('ignores non-positive limits', async () => {
        queryMock.mockResolvedValue([[]])

        await GET(new Request('http://localhost/api/products?limit=0'))
        await GET(new Request('http://localhost/api/products?limit=-10'))

        const [sql1, params1] = queryMock.mock.calls[0] as [string, unknown[]]
        const [sql2, params2] = queryMock.mock.calls[1] as [string, unknown[]]

        expect(sql1).not.toContain('LIMIT ?')
        expect(params1).toEqual([])
        expect(sql2).not.toContain('LIMIT ?')
        expect(params2).toEqual([])
    })

    it('uses limit when positive and below cap', async () => {
        queryMock.mockResolvedValue([[]])

        await GET(new Request('http://localhost/api/products?limit=25'))
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(sql).toContain('LIMIT ?')
        expect(params).toEqual([25])
    })

    it('returns 500 when query fails', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        queryMock.mockRejectedValue(new Error('db failed'))

        const response = await GET(new Request('http://localhost/api/products'))

        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({ error: 'Failed to load products.' })
        expect(errorSpy).toHaveBeenCalled()
    })
})
