import { Router } from "express"
import * as controller from "./cart.controller"
import { authenticate } from "../../middleware/auth.middleware"

const router = Router()

router.get("/", authenticate, controller.getCart)

router.post("/add", authenticate, controller.addToCart)

router.patch("/update", authenticate, controller.updateCart)

router.delete("/remove/:id", authenticate, controller.removeItem)

export default router