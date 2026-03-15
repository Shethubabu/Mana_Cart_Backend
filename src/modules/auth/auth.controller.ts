import { CookieOptions, Request, Response } from "express"
import { prisma } from "../../config/prisma"
import * as service from "./auth.service"
import {
  verifyRefreshToken,
  generateAccessToken
} from "../../utils/jwt"

const isProduction = process.env.NODE_ENV === "production"

const buildCookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge
})

export const register = async (req: Request, res: Response) => {

  const { user, accessToken, refreshToken } =
    await service.registerUser(req.body)

  res.cookie("accessToken", accessToken, buildCookieOptions(15 * 60 * 1000))

  res.cookie("refreshToken", refreshToken, buildCookieOptions(7 * 24 * 60 * 60 * 1000))

  res.status(201).json({ user })
}

export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body

  const { user, accessToken, refreshToken } =
    await service.loginUser(email, password)

  res.cookie("accessToken", accessToken, buildCookieOptions(15 * 60 * 1000))

  res.cookie("refreshToken", refreshToken, buildCookieOptions(7 * 24 * 60 * 60 * 1000))

  res.json({ user })
}

export const refresh = async (req: Request, res: Response) => {

  const token = req.cookies.refreshToken

  if (!token)
    return res.status(401).json({ message: "Unauthorized" })

  try {

    const decoded: any = verifyRefreshToken(token)

    const accessToken = generateAccessToken(decoded.userId)

    res.cookie("accessToken", accessToken, buildCookieOptions(15 * 60 * 1000))

    res.json({ success: true })

  } catch {

    res.status(403).json({ message: "Invalid refresh token" })

  }
}

export const me = async (req: any, res: Response) => {

  const user = await service.getUser(req.user.userId)

  res.json({ user })
}

export const logout = async (req: Request, res: Response) => {

  const token = req.cookies.refreshToken

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token }
    })
  }

  res.clearCookie("accessToken", buildCookieOptions(0))
  res.clearCookie("refreshToken", buildCookieOptions(0))

  res.json({ message: "Logged out successfully" })
}
