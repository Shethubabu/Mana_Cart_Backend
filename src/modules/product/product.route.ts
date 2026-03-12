import { Router } from "express"
import * as controller from "./product.controller"

const router = Router()

router.get("/featured", controller.getFeaturedProducts)

router.get("/", controller.getProducts)

router.get("/:id", controller.getProductById)

export default router