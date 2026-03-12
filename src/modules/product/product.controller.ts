import { Request, Response } from "express"
import * as service from "./product.service"

export const getProducts = async (
  req: Request,
  res: Response
) => {

  const products = await service.getProducts(req.query)

  res.json(products)

}

export const getProductById = async (
  req: Request,
  res: Response
) => {

  const id = Number(req.params.id)

  const product = await service.getProductById(id)

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    })
  }

  res.json(product)

}
export const getFeaturedProducts = async (
  req: Request,
  res: Response
) => {

  const products = await service.getFeaturedProducts()

  res.json(products)

}