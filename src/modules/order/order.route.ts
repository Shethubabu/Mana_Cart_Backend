import { Router } from "express"
import * as controller from "./order.controller"
import { authenticate } from "../../middleware/auth.middleware"

const router = Router()

router.post("/checkout", authenticate, controller.checkout)

router.get("/", authenticate, controller.getOrders)

router.get("/:id", authenticate, controller.getOrderById)

export default router