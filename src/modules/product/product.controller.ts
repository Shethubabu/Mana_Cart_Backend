import { Request, Response } from "express"
import * as service from "./product.service"

export const getProducts = async (req: Request, res: Response) => {
  const products = await service.getProducts()
  res.json(products)
}

export const getProductById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)

  const product = await service.getProductById(id)

  res.json(product)
}