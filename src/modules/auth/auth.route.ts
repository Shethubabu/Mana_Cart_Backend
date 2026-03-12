import { Router } from "express"
import * as controller from "./auth.controller"
import { authenticate } from "../../middleware/auth.middleware"

const router = Router()

router.post("/register", controller.register)

router.post("/login", controller.login)

router.post("/refresh", controller.refresh)

router.get("/me", authenticate, controller.me)

router.post("/logout", controller.logout)

export default router