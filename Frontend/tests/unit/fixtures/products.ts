import type { Product } from '@/lib/products'

export const productA: Product = {
    sku: 'SKU-1',
    name: 'Gaming Keyboard',
    image: '/images/keyboard.png',
    price: 199.99,
    oldPrice: 249.99,
    available: true,
    subtitle: 'Mechanical',
    advantages: ['RGB'],
    description: 'Compact keyboard',
    specs: { general: ['Switches: Red'] },
    keywords: ['keyboard']
}

export const productB: Product = {
    sku: 'SKU-2',
    name: 'Wireless Mouse',
    image: '/images/mouse.png',
    price: 89.99,
    available: true,
    specs: { general: ['Type: Wireless'] }
}

export const products = [productA, productB]
