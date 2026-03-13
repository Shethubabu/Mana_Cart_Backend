import { prisma } from "../../config/prisma"

export const findRefreshToken = async (token: string) => {

  return prisma.refreshToken.findUnique({
    where: { token }
  })

}
export const deleteRefreshToken = async (token: string) => {

  await prisma.refreshToken.deleteMany({
    where: { token }
  })

}