import { prisma } from "../../config/prisma"

export const findProducts = async ({
  search,
  category,
  minPrice,
  maxPrice,
  page,
  limit
}: any) => {

  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive"
    }
  }

  if (category) {
    where.category = {
      name: category
    }
  }

  if (minPrice || maxPrice) {
    where.price = {
      gte: minPrice ? Number(minPrice) : undefined,
      lte: maxPrice ? Number(maxPrice) : undefined
    }
  }

  const products = await prisma.product.findMany({
    where,
    skip,
    take: limit,
    include: {
      images: true,
      category: true,
     
    }
  })

  const total = await prisma.product.count({ where })

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }

}

export const findProductById = async (id: number) => {

  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true
    }
  })

}
export const findFeaturedProducts = async () => {

  return prisma.product.findMany({
    where: {
      featured: true
    },
    take: 10,
    include: {
      images: true,
      category: true
    }
  })

}