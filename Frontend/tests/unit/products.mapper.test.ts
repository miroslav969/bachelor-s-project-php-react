import { describe, expect, it } from 'vitest'
import { mapProductRow } from '@/lib/products'

const baseRow = {
    sku: 'SKU-1',
    name: 'Gaming Keyboard',
    image: '/images/keyboard.png',
    price: '199.99',
    old_price: '249.99',
    available: 1,
    subtitle: 'Mechanical',
    advantages: '["RGB","Hot-swappable"]',
    description: 'Compact keyboard',
    specs: '{"switches":["Red"]}',
    keywords: 'keyboard, gaming'
}

describe('mapProductRow', () => {
    it('maps json and csv fields into api shape', () => {
        expect(mapProductRow(baseRow as any)).toEqual({
            sku: 'SKU-1',
            name: 'Gaming Keyboard',
            image: '/images/keyboard.png',
            price: 199.99,
            oldPrice: 249.99,
            available: true,
            subtitle: 'Mechanical',
            advantages: ['RGB', 'Hot-swappable'],
            description: 'Compact keyboard',
            specs: { switches: ['Red'] },
            keywords: ['keyboard', 'gaming']
        })
    })

    it('supports already parsed arrays/objects', () => {
        const result = mapProductRow({
            ...baseRow,
            price: 99,
            old_price: 129,
            available: false,
            advantages: ['Silent', 'Wireless'],
            specs: { size: ['TKL'] },
            keywords: ['keyboard', 'wireless']
        } as any)

        expect(result).toMatchObject({
            price: 99,
            oldPrice: 129,
            available: false,
            advantages: ['Silent', 'Wireless'],
            specs: { size: ['TKL'] },
            keywords: ['keyboard', 'wireless']
        })
    })

    it('returns undefined for invalid json blocks', () => {
        const result = mapProductRow({
            ...baseRow,
            advantages: '{bad json',
            specs: '{bad json',
            keywords: '   '
        } as any)

        expect(result.advantages).toBeUndefined()
        expect(result.specs).toBeUndefined()
        expect(result.keywords).toBeUndefined()
    })

    it('parses keyword json array string', () => {
        const result = mapProductRow({
            ...baseRow,
            keywords: '["mouse","rgb"]'
        } as any)

        expect(result.keywords).toEqual(['mouse', 'rgb'])
    })

    it('drops invalid old_price value', () => {
        const result = mapProductRow({
            ...baseRow,
            old_price: 'not-a-number'
        } as any)

        expect(result.oldPrice).toBeUndefined()
    })
})
