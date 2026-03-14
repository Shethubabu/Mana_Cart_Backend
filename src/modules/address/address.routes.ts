import { Router } from "express"
import * as controller from "./address.controller"
import { authenticate } from "../../middleware/auth.middleware"

const router = Router()

router.get("/", authenticate, controller.getAddresses)

router.post("/", authenticate, controller.createAddress)

router.put("/:id", authenticate, controller.updateAddress)

router.delete("/:id", authenticate, controller.deleteAddress)

export default router