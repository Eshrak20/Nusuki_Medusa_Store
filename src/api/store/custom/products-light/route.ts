import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query")

    const type = req.query.type as string

    const limitRaw = parseInt(req.query.limit as string)
    const offsetRaw = parseInt(req.query.offset as string)

    const limit = isNaN(limitRaw) ? 8 : Math.min(limitRaw, 50)
    const offset = isNaN(offsetRaw) ? 0 : offsetRaw

    // 🔹 STEP 1: get ALL products (no pagination)
    const { data: allProducts } = await query.graph({
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
        ]
    })

    // 🔥 STEP 2: handle "new"
    let sorted = allProducts

    if (type === "new") {
        sorted = [...allProducts].sort(
            (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )
    }

    // 🔥 STEP 3: apply pagination manually
    const paginated = sorted.slice(offset, offset + limit)

    // 🔹 FORMAT
    const formatted = paginated.map((p: any) => {
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

    return res.json({
        products: formatted,
        offset,
        limit,
        total: allProducts.length
    })
}