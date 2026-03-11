import express from "express"
import cors from "cors"
import productRoutes from "./modules/product/product.route"
import authRoutes from "./modules/auth/auth.route"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/products", productRoutes)
app.use("/api/auth", authRoutes)

export default app