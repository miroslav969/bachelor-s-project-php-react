type ProductRow = {
    sku: string
    name: string
    image: string
    price: string | number
    old_price: string | number | null
    available: number | boolean
    subtitle: string | null
    advantages: string | null
    description: string | null
    specs: string | null
    keywords: string | null
}

export const createProductRow = (overrides: Partial<ProductRow> = {}): ProductRow => ({
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
    keywords: 'keyboard, gaming',
    ...overrides
})

export const mappedProduct = {
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
}
