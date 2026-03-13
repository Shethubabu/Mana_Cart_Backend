import { prisma } from "../../config/prisma"
import { hashPassword, comparePassword } from "../../utils/password"
import {
  generateAccessToken,
  generateRefreshToken
} from "../../utils/jwt"

const REFRESH_EXPIRES = 7 * 24 * 60 * 60 * 1000

export const registerUser = async (data: any) => {

  const hashed = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed
    }
  })

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES)
    }
  })

  return { user, accessToken, refreshToken }
}
export const loginUser = async (email: string, password: string) => {

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) throw new Error("Invalid credentials")

  const valid = await comparePassword(password, user.password)

  if (!valid) throw new Error("Invalid credentials")

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES)
    }
  })

  return { user, accessToken, refreshToken }
}
export const getUser = async (userId: number) => {

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  })

}