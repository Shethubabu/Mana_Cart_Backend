import { prisma } from "../../config/prisma"

export const getHomeData = async () => {

  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    take: 8,
    include: { images: true }
  })

  const categories = await prisma.category.findMany({
    take: 10
  })

  const latestProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { images: true }
  })

  const topRatedProducts = await prisma.product.findMany({
    orderBy: { rating: "desc" },
    take: 8,
    include: { images: true }
  })

  return {
    featuredProducts,
    categories,
    latestProducts,
    topRatedProducts
  }
}