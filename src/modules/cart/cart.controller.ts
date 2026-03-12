import { Request, Response } from "express"
import * as service from "./cart.service"

export const getCart = async (req: any, res: Response) => {

  const cart = await service.getCart(req.user.userId)

  res.json(cart)

}

export const addToCart = async (req: any, res: Response) => {

  const { productId, quantity } = req.body

  const item = await service.addToCart(
    req.user.userId,
    productId,
    quantity
  )

  res.json(item)

}

export const updateCart = async (req: Request, res: Response) => {

  const { cartId, quantity } = req.body

  const item = await service.updateCart(cartId, quantity)

  res.json(item)

}

export const removeItem = async (req: Request, res: Response) => {

  const cartId = Number(req.params.id)

  await service.removeCartItem(cartId)

  res.json({ message: "Item removed from cart" })

}

export const clearCart = async (req: any, res: Response) => {

  await service.clearCart(req.user.userId)

  res.json({ message: "Cart cleared" })

}