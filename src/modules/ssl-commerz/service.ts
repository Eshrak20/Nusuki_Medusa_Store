import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils";
import type {
    ProviderWebhookPayload,
    WebhookActionResult,
    InitiatePaymentInput,
    InitiatePaymentOutput,
    AuthorizePaymentInput,
    AuthorizePaymentOutput,
    CancelPaymentInput,
    CancelPaymentOutput,
    CapturePaymentInput,
    CapturePaymentOutput,
    DeletePaymentInput,
    DeletePaymentOutput,
    RefundPaymentInput,
    RefundPaymentOutput,
    RetrievePaymentInput,
    RetrievePaymentOutput,
    UpdatePaymentInput,
    UpdatePaymentOutput,
    GetPaymentStatusInput,
    GetPaymentStatusOutput
} from "@medusajs/framework/types";
import SSLCommerzPayment from "sslcommerz-lts";

class SslCommerzService extends AbstractPaymentProvider {
    static identifier = "ssl"
    protected sslcz: any;


    constructor(container: any, options: any) {
        super(container);
        this.sslcz = new SSLCommerzPayment(
            options.store_id,
            options.store_passwd,
            options.is_live
        );
    }

    async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
        const baseUrl = 'http://localhost:9000';
        const debugUrl = 'https://webhook.site/b2eb03ba-2d5d-4de6-a46d-df7f779a0920';

        try {
            // SSLCommerz requires these fields to not be empty
            const data = {
                total_amount: input.amount,
                currency: (input.currency_code || "BDT").toUpperCase(),
                tran_id: input.data?.tran_id || `TRX-${Date.now()}`,
                // FIX: Add /store/ to the path
                // success_url: `${baseUrl}/store/sslcommerz/success`,
                // fail_url: `${baseUrl}/store/sslcommerz/fail`,
                // cancel_url: `${baseUrl}/store/sslcommerz/cancel`,
                // ipn_url: `${baseUrl}/store/sslcommerz/ipn`,


                // Redirect SSLCommerz to the debug site
                success_url: debugUrl,
                fail_url: debugUrl,
                cancel_url: debugUrl,
                ipn_url: debugUrl,

                // MANDATORY CUSTOMER INFO (Use placeholders if input is missing them)
                cus_name: 'Customer Name',
                cus_email: 'customer@mail.com',
                cus_add1: 'Dhaka',
                cus_city: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: '01700000000',

                // MANDATORY SHIPPING INFO (This was causing your error)
                ship_name: 'Customer Name', // Add this
                ship_add1: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: '1000',
                ship_country: 'Bangladesh',

                shipping_method: 'Courier',
                product_name: 'Nusuki Store Products',
                product_category: 'E-commerce',
                product_profile: 'general'
            };

            const apiResponse = await this.sslcz.init(data);

            if (apiResponse?.status !== "SUCCESS") {
                throw new Error(apiResponse?.failedreason || "SSL Commerz failed to initialize");
            }

            return {
                id: apiResponse.sessionkey,
                data: {
                    ...apiResponse,
                    gateway_url: apiResponse.GatewayPageURL,
                }
            };
        } catch (error: any) {
            throw new Error(`SSL Commerz Init Failed: ${error.message}`);
        }
    }
    async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
        return {
            status: PaymentSessionStatus.AUTHORIZED,
            data: input.data
        };
    }

    // In v2, use input.data to access the stored session data
    async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
        return { data: input.data };
    }

    async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
        return { data: input.data };
    }

    async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
        return { data: input.data };
    }

    async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
        return { data: input.data };
    }

    async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
        return { data: input.data };
    }

    async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
        return {
            status: PaymentSessionStatus.AUTHORIZED
        };
    }

    async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
        return { data: input.data };
    }

    async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
        const { data } = payload;

        // SSLCOMMERZ sends 'tran_id' and 'amount' in the IPN body
        // We map these to Medusa's expected format
        return {
            action: "captured", // or "not_supported" if validation fails
            data: {
                session_id: (data.tran_id as string) || (data.value_a as string),
                amount: Number(data.amount),
            }
        };
    }
}

// CRITICAL: Export the service as the default export of the file
export default SslCommerzService;