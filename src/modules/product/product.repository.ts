import { prisma } from "../../config/prisma"

export const findProducts = async (
  search: string | undefined,
  page: number,
  limit: number
) => {

  const skip = (page - 1) * limit

  return prisma.product.findMany({
    where: {
      title: {
        contains: search,
        mode: "insensitive"
      }
    },
    skip,
    take: limit,
    include: {
      images: true,
      category: true
    }
  })

}

export const findProductById = async (id: number) => {

  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      reviews: true,
      category: true
    }
  })

}