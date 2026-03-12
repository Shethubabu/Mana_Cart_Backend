import { prisma } from "../../config/prisma"

export const findCategories = () => {

  return prisma.category.findMany({
    include: {
      products: true
    }
  })

}