import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query")
    const productId = req.params.id

    // 🔹 STEP 1: Fetch the Product with its basic info only
    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle", "description", "thumbnail"],
        filters: { id: productId }
    })

    if (!products.length) {
        return res.status(404).json({ message: "Product not found" })
    }

    const product = products[0]

    // 🔹 STEP 2: Fetch the VARIANTS directly (This is the secret)
    // By querying 'variant' as the root entity, we get ONLY the images 
    // explicitly linked to that variant ID in the database.
    const { data: variants } = await query.graph({
        entity: "variant",
        fields: [
            "id", 
            "title", 
            "sku", 
            "images.url", 
            "images.id",
            "prices.*"
        ],
        filters: { product_id: productId }
    })

    // 🔹 STEP 3: Format the response
    const formattedVariants = variants.map((v: any) => {
        // If the variant has NO specific images selected, 
        // fallback to the product thumbnail so the UI doesn't break.
        const variantImages = v.images && v.images.length > 0 
            ? v.images.map((img: any) => ({ id: img.id, url: img.url }))
            : [{ id: "fallback", url: product.thumbnail }]

        return {
            id: v.id,
            title: v.title,
            sku: v.sku,
            images: variantImages, // This will now strictly be your 2 selected images
            prices: v.prices?.map((p: any) => ({
                amount: p.amount,
                currency: p.currency_code
            }))
        }
    })

    return res.json({
        product: {
            ...product,
            variants: formattedVariants
        }
    })
}