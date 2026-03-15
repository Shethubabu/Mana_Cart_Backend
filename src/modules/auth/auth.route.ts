import { Router } from "express"
import * as controller from "./auth.controller"
import { authenticate } from "../../middleware/auth.middleware"
import rateLimit from "express-rate-limit"

const router = Router()
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication requests, please try again later."
  }
})

router.post("/register", authLimiter, controller.register)

router.post("/login", authLimiter, controller.login)

router.post("/refresh", authLimiter, controller.refresh)

router.get("/me", authenticate, controller.me)

router.post("/logout", controller.logout)

export default router
