import ProductClient from './ProductClient'

export default async function ProductPage({ params }: any) {
    return <ProductClient sku={params.sku} />
}