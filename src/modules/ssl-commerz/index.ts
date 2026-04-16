import SslCommerzService from "./service"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

// Ensure you are exporting the result of ModuleProvider as the DEFAULT export
export default ModuleProvider(Modules.PAYMENT, {
  services: [SslCommerzService],
})