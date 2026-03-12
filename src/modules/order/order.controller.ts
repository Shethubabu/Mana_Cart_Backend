import { Request, Response } from "express"
import * as service from "./order.service"

export const checkout = async (req: any, res: Response) => {

  const order = await service.checkout(req.user.userId)

  res.json(order)
}

export const getOrders = async (req: any, res: Response) => {

  const orders = await service.getOrders(req.user.userId)

  res.json(orders)
}