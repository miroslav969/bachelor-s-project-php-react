import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { mapProductRow } from '@/lib/products'

const selectFields =
    'sku, name, image, price, old_price, available, subtitle, advantages, description, specs, keywords'
const baseQuery = `SELECT ${selectFields} FROM products`

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('q') ?? '').trim()
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 8
    const safeLimit = Number.isFinite(limit) ? Math.min(limit, 50) : 8

    if (query.length < 2) {
        return NextResponse.json([])
    }

    const terms = query.split(/\s+/).filter(Boolean)
    const where = terms
        .map(
            () =>
                '(name LIKE ? OR subtitle LIKE ? OR description LIKE ? OR keywords LIKE ?)'
        )
        .join(' AND ')

    const params = terms.flatMap((term) => {
        const value = `%${term}%`
        return [value, value, value, value]
    })
    params.push(safeLimit)

    try {
        const [rows] = await getPool().query(
            `${baseQuery} WHERE ${where} LIMIT ?`,
            params
        )
        return NextResponse.json((rows as any[]).map(mapProductRow))
    } catch (error) {
        console.error('Product search failed', error)
        return NextResponse.json({ error: 'Failed to search products.' }, { status: 500 })
    }
}
