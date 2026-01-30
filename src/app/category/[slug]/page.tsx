import CategoryClient from './CategoryClient'

export default async function CategoryPage({ params }: any) {
    return <CategoryClient slug={params.slug} />
}