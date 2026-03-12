import { prisma } from "../../config/prisma"

export const checkout = async (userId: number) => {

  return prisma.$transaction(async (tx) => {

    const cartItems = await tx.cart.findMany({
      where: { userId },
      include: {
        product: true
      }
    })

    if (cartItems.length === 0) {
      throw new Error("Cart is empty")
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    const order = await tx.order.create({
      data: {
        userId,
        total,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: {
        items: true
      }
    })

    await tx.cart.deleteMany({
      where: { userId }
    })

    return order
  })

}

export const getOrders = async (userId: number) => {

  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

}

export const getOrderById = async (
  orderId: number,
  userId: number
) => {

  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    }
  })

}