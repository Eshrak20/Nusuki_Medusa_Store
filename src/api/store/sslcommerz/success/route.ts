import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Define the shape of the data SSLCommerz sends back
interface SSLCommerzCallbackBody {
    status: string;
    tran_id: string;
    val_id: string;
    amount: string;
    card_type?: string;
    store_amount?: string;
    // Add other fields you might need from the SSLCommerz response
    [key: string]: any; // Allows for other dynamic fields
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    // Fix: Cast req.body to your interface
    const data = req.body as SSLCommerzCallbackBody;
    console.log("SSLCommerz Callback Data:", data);
    // Now TypeScript knows 'data' has 'status' and 'tran_id'
    if (data.status === "VALID" || data.status === "AUTHENTICATED") {

        // Redirect to your Next.js frontend
        return res.redirect(`http://localhost:3000/checkout/success?tran_id=${data.tran_id}`);
    }

    return res.redirect(`http://localhost:3000/checkout/error`);
}