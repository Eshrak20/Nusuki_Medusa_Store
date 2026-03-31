import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query")
    const type = req.query.type as string

    const { data: products } = await query.graph({
        entity: "product",
        fields: [
            "id",
            "title",
            "type.value",
            "thumbnail",
            "images.url",
            "variants.prices.amount",
            "variants.prices.currency_code",
            "created_at"
        ],
        pagination: {
            take: 8 
        }
    })

    // 🚀 New Arrivals
    if (type === "new") {
        products.sort(
            (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )
    }

    const formatted = products.map((p: any) => {
        const variant = p.variants?.[0]
        const price = variant?.prices?.[0]

        return {
            id: p.id,
            title: p.title,
            brand: p.type?.value || null,
            image: p.thumbnail || p.images?.[0]?.url,
            price: price?.amount || 0,
            currency: price?.currency_code || "bdt",
        }
    })

    return res.json({ products: formatted })
}