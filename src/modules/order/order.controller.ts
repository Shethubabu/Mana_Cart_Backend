import { Request, Response } from "express"
import * as service from "./order.service"

export const checkout = async (req: any, res: Response) => {

  const order = await service.checkout(req.user.userId, {
    addressId: req.body.addressId,
    paymentMethod: req.body.paymentMethod
  })

  res.json(order)

}

export const confirmPayment = async (req: any, res: Response) => {

  const order = await service.confirmPayment(
    req.user.userId,
    {
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature
    }
  )

  res.json(order)

}

export const getOrders = async (req: any, res: Response) => {

  const orders = await service.getOrders(req.user.userId)

  res.json(orders)

}

export const getOrderById = async (req: any, res: Response) => {

  const orderId = Number(req.params.id)

  const order = await service.getOrderById(
    orderId,
    req.user.userId
  )

  res.json(order)

}
