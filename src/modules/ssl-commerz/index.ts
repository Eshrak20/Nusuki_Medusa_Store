import SslCommerzProviderService from "./service"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

// This string MUST match the ID used in medusa-config.ts
export const SSL_COMMERZ_PROVIDER = "ssl-commerz"

export default ModuleProvider(Modules.PAYMENT, {
  services: [SslCommerzProviderService],
})