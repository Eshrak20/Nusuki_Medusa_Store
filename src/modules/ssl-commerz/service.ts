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
    static identifier = "ssl-commerz";
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
        try {
            // In v2, IDs and amounts are directly on the input
            const data = {
                total_amount: input.amount || 0, // Ensure it's not undefined
                currency: (input.currency_code || "BDT").toUpperCase(),
                tran_id: input.data?.tran_id || Date.now().toString(),
                success_url: 'http://localhost:8000/api/sslcommerz/success',
                fail_url: 'http://localhost:8000/api/sslcommerz/fail',
                cancel_url: 'http://localhost:8000/api/sslcommerz/cancel',
                ipn_url: 'http://localhost:8000/api/sslcommerz/ipn',
                shipping_method: 'Courier',
                product_name: 'Nusuki Store Products',
                product_category: 'E-commerce',
                product_profile: 'general'
            };

            const apiResponse = await this.sslcz.init(data);

            return {
                id: apiResponse.sessionkey,
                data: {
                    gateway_url: apiResponse.GatewayPageURL,
                    session_key: apiResponse.sessionkey,
                    ...apiResponse
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