export interface Product {
    sku: string
    name: string
    image: string
    price: number
    oldPrice?: number
    available: boolean
    subtitle?: string
    advantages?: string[]
    description?: string
    specs?: Record<string, string[]>
    keywords?: string[]
}

type ProductRow = {
    sku: string
    name: string
    image: string
    price: number | string
    old_price?: number | string | null
    available: number | boolean
    subtitle?: string | null
    advantages?: string[] | string | null
    description?: string | null
    specs?: Record<string, string[]> | string | null
    keywords?: string | string[] | null
}

const parseJson = <T>(value: unknown): T | undefined => {
    if (value === null || value === undefined) return undefined
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as T
        } catch {
            return undefined
        }
    }
    return value as T
}

const parseKeywords = (value: unknown): string[] | undefined => {
    if (value === null || value === undefined) return undefined
    if (Array.isArray(value)) return value.filter(Boolean).map(String)
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return undefined
        if (trimmed.startsWith('[')) {
            const parsed = parseJson<string[]>(trimmed)
            if (parsed && Array.isArray(parsed)) return parsed
        }
        return trimmed
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
    }
    return undefined
}

export const mapProductRow = (row: ProductRow): Product => {
    const advantages = parseJson<string[]>(row.advantages)
    const specs = parseJson<Record<string, string[]>>(row.specs)
    const keywords = parseKeywords(row.keywords)
    const oldPriceValue = row.old_price
    const oldPrice =
        oldPriceValue === null || oldPriceValue === undefined
            ? undefined
            : Number(oldPriceValue)

    return {
        sku: row.sku,
        name: row.name,
        image: row.image,
        price: Number(row.price),
        oldPrice: oldPrice !== undefined && Number.isNaN(oldPrice) ? undefined : oldPrice,
        available: Boolean(row.available),
        subtitle: row.subtitle ?? undefined,
        advantages,
        description: row.description ?? undefined,
        specs,
        keywords
    }
}
