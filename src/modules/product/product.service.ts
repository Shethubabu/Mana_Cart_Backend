import { prisma } from "../../config/prisma"

export const getProducts = async () => {
  return prisma.product.findMany({
    include: {
      images: true,
      reviews: true,
      category: true
    }
  })
}

export const getProductById = async (id: number) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      reviews: true,
      category: true
    }
  })
}