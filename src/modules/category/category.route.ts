import { Router } from "express"
import * as controller from "./category.controller"

const router = Router()

router.get("/", controller.getCategories)

export default router