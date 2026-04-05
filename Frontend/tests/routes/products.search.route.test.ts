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

import { GET } from '@/app/api/products/search/route'

describe('GET /api/products/search', () => {
    beforeEach(() => {
        queryMock.mockReset()
    })

    it('returns empty list for blank query', async () => {
        const response = await GET(new Request('http://localhost/api/products/search?q=   '))

        expect(queryMock).not.toHaveBeenCalled()
        expect(response.status).toBe(200)
        expect(await response.json()).toEqual([])
    })

    it('returns empty list for too short query', async () => {
        const response = await GET(new Request('http://localhost/api/products/search?q=a'))

        expect(queryMock).not.toHaveBeenCalled()
        expect(response.status).toBe(200)
        expect(await response.json()).toEqual([])
    })

    it('searches by one term with default limit 8', async () => {
        queryMock.mockResolvedValue([[createProductRow()]])

        const response = await GET(
            new Request('http://localhost/api/products/search?q=keyboard')
        )
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(sql).toContain('FROM products WHERE')
        expect(sql).toContain(
            '(name LIKE ? OR subtitle LIKE ? OR description LIKE ? OR keywords LIKE ?)'
        )
        expect(sql).toContain('LIMIT ?')
        expect(params).toEqual([
            '%keyboard%',
            '%keyboard%',
            '%keyboard%',
            '%keyboard%',
            8
        ])
        expect(response.status).toBe(200)
        expect(await response.json()).toEqual([mappedProduct])
    })

    it('trims query and still searches', async () => {
        queryMock.mockResolvedValue([[]])

        await GET(new Request('http://localhost/api/products/search?q=   keyboard   '))
        const [, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(params.slice(0, 4)).toEqual([
            '%keyboard%',
            '%keyboard%',
            '%keyboard%',
            '%keyboard%'
        ])
    })

    it('supports multi-term query and clamps limit to 50', async () => {
        queryMock.mockResolvedValue([[createProductRow()]])

        await GET(
            new Request('http://localhost/api/products/search?q=gaming+mouse&limit=999')
        )
        const [sql, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(sql).toContain('AND')
        expect(params).toEqual([
            '%gaming%',
            '%gaming%',
            '%gaming%',
            '%gaming%',
            '%mouse%',
            '%mouse%',
            '%mouse%',
            '%mouse%',
            50
        ])
    })

    it('falls back to limit 8 when limit is invalid', async () => {
        queryMock.mockResolvedValue([[]])

        await GET(
            new Request('http://localhost/api/products/search?q=keyboard&limit=not-a-number')
        )
        const [, params] = queryMock.mock.calls[0] as [string, unknown[]]

        expect(params.at(-1)).toBe(8)
    })

    it('falls back to default limit when limit is zero or negative', async () => {
        queryMock.mockResolvedValue([[]])

        await GET(new Request('http://localhost/api/products/search?q=keyboard&limit=0'))
        await GET(new Request('http://localhost/api/products/search?q=keyboard&limit=-5'))

        const [, params1] = queryMock.mock.calls[0] as [string, unknown[]]
        const [, params2] = queryMock.mock.calls[1] as [string, unknown[]]

        expect(params1.at(-1)).toBe(8)
        expect(params2.at(-1)).toBe(8)
    })

    it('returns 500 when search query fails', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        queryMock.mockRejectedValue(new Error('db failed'))

        const response = await GET(
            new Request('http://localhost/api/products/search?q=keyboard')
        )

        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({ error: 'Failed to search products.' })
        expect(errorSpy).toHaveBeenCalled()
    })
})
