import express from "express"
import cors from "cors"
import productRoutes from "./modules/product/product.route"
import authRoutes from "./modules/auth/auth.route"
import cartRoutes from "./modules/cart/cart.route"
import orderRoutes from "./modules/order/order.route"
import { errorHandler } from "./middleware/error.middleware"
import categoryRoutes from "./modules/category/category.route"
import cookieParser from "cookie-parser"



const app = express()

app.use(cors())
app.use(express.json())
app.use(errorHandler)
app.use(cookieParser())

app.use("/api/products", productRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/categories", categoryRoutes)

export default app