import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import productRoutes from "./modules/product/product.route"
import authRoutes from "./modules/auth/auth.route"
import cartRoutes from "./modules/cart/cart.route"
import orderRoutes from "./modules/order/order.route"
import { errorHandler } from "./middleware/error.middleware"
import categoryRoutes from "./modules/category/category.route"
import cookieParser from "cookie-parser"
import homeRoutes from "./modules/home/home.route"
import morgan from "morgan"
import rateLimit from "express-rate-limit"





const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
const app = express()

app.use(cors({
  origin: [process.env.CLIENT_URL as string, process.env.DEPLOYED_URL as string],
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(limiter)

app.use("/api/products", productRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/home", homeRoutes)

app.use(errorHandler)

export default app