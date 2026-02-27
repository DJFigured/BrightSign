import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import ComgatePaymentService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [ComgatePaymentService],
})
