import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import InPostFulfillmentService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [InPostFulfillmentService],
})
