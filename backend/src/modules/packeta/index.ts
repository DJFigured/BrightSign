import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PacketaFulfillmentService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [PacketaFulfillmentService],
})
