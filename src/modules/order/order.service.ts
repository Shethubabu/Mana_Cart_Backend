import { prisma } from "../../config/prisma"

export const checkout = async (userId: number) => {

  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: { product: true }
  })

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      items: {
        create: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      }
    }
  })

  await prisma.cart.deleteMany({
    where: { userId }
  })

  return order
}

export const getOrders = async (userId: number) => {

  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

}