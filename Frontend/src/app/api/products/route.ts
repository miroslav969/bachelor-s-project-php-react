import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { mapProductRow } from '@/lib/products'

const selectFields =
    'sku, name, image, price, old_price, available, subtitle, advantages, description, specs, keywords'
const baseQuery = `SELECT ${selectFields} FROM products`

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const skusParam = searchParams.get('skus')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined
    const safeLimit = Number.isFinite(limit) ? Math.min(limit as number, 200) : undefined

    let sql = baseQuery
    const params: Array<string | number> = []

    if (skusParam) {
        const skus = skusParam
            .split(',')
            .map((sku) => sku.trim())
            .filter(Boolean)

        if (skus.length === 0) {
            return NextResponse.json([])
        }

        sql += ` WHERE sku IN (${skus.map(() => '?').join(', ')})`
        params.push(...skus)
    }

    if (safeLimit && safeLimit > 0) {
        sql += ' LIMIT ?'
        params.push(safeLimit)
    }

    try {
        const [rows] = await getPool().query(sql, params)
        return NextResponse.json((rows as any[]).map(mapProductRow))
    } catch (error) {
        console.error('Products query failed', error)
        return NextResponse.json({ error: 'Failed to load products.' }, { status: 500 })
    }
}
