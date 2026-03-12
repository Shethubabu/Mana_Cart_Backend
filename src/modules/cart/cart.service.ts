import { prisma } from "../../config/prisma"

export const getCart = async (userId: number) => {

  return prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: true,
          category: true
        }
      }
    }
  })

}

export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number
) => {

  const existing = await prisma.cart.findFirst({
    where: {
      userId,
      productId
    }
  })

  if (existing) {

    return prisma.cart.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity
      }
    })

  }

  return prisma.cart.create({
    data: {
      userId,
      productId,
      quantity
    }
  })

}

export const updateCart = async (
  cartId: number,
  quantity: number
) => {

  return prisma.cart.update({
    where: { id: cartId },
    data: { quantity }
  })

}

export const removeCartItem = async (cartId: number) => {

  return prisma.cart.delete({
    where: { id: cartId }
  })

}

export const clearCart = async (userId: number) => {

  return prisma.cart.deleteMany({
    where: { userId }
  })

}