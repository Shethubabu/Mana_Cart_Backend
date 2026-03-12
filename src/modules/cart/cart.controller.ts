import { Request, Response } from "express"
import * as service from "./cart.service"

export const getCart = async (req: any, res: Response) => {
  const cart = await service.getCart(req.user.userId)
  res.json(cart)
}

export const addToCart = async (req: any, res: Response) => {

  const item = await service.addToCart(
    req.user.userId,
    req.body.productId,
    req.body.quantity
  )

  res.json(item)
}

export const updateCart = async (req: Request, res: Response) => {

  const item = await service.updateCart(
    req.body.cartId,
    req.body.quantity
  )

  res.json(item)
}

export const removeItem = async (req: Request, res: Response) => {

  await service.removeItem(Number(req.params.id))

  res.json({ message: "Item removed" })
}