import { Request, Response } from "express"
import * as service from "./product.service"

export const getProducts = async (req: Request, res: Response) => {

  const search = req.query.search as string
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const products = await service.getProducts(search, page, limit)

  res.json(products)

}

export const getProductById = async (req: Request, res: Response) => {

  const id = Number(req.params.id)

  const product = await service.getProductById(id)

  res.json(product)

}