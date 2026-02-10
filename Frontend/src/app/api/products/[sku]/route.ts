import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { mapProductRow } from '@/lib/products'

const selectFields =
    'sku, name, image, price, old_price, available, subtitle, advantages, description, specs, keywords'
const baseQuery = `SELECT ${selectFields} FROM products`

export async function GET(
    _request: Request,
    { params }: { params: { sku: string } }
) {
    try {
        const [rows] = await getPool().query(`${baseQuery} WHERE sku = ? LIMIT 1`, [
            params.sku
        ])
        const data = rows as any[]
        if (!data.length) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
        }
        return NextResponse.json(mapProductRow(data[0]))
    } catch (error) {
        console.error('Product lookup failed', error)
        return NextResponse.json({ error: 'Failed to load product.' }, { status: 500 })
    }
}
