import { Request, Response } from "express"
import * as service from "./auth.service"
import {
  verifyRefreshToken,
  generateAccessToken
} from "../../utils/jwt"

export const register = async (req: Request, res: Response) => {

  const { user, accessToken, refreshToken } =
    await service.registerUser(req.body)

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ user, accessToken })
}

export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body

  const { user, accessToken, refreshToken } =
    await service.loginUser(email, password)

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ user, accessToken })
}

export const refresh = async (req: Request, res: Response) => {

  const token = req.cookies.refreshToken

  if (!token)
    return res.status(401).json({ message: "Unauthorized" })

  try {

    const decoded: any = verifyRefreshToken(token)

    const accessToken = generateAccessToken(decoded.userId)

    res.json({ accessToken })

  } catch {

    res.status(403).json({ message: "Invalid refresh token" })

  }
}

export const me = async (req: any, res: Response) => {

  const user = await service.getUser(req.user.userId)

  res.json(user)
}

export const logout = async (req: Request, res: Response) => {

  res.clearCookie("refreshToken")

  res.json({ message: "Logged out successfully" })
}