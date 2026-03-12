import { prisma } from "../../config/prisma"

export const getCart = async (userId: number) => {

  return prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: true
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

export const removeItem = async (cartId: number) => {

  return prisma.cart.delete({
    where: { id: cartId }
  })

}