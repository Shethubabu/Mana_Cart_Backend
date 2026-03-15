import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt"

export const authenticate = (
  req: any,
  res: Response,
  next: NextFunction
) => {

  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    })
  }

  try {

    const decoded = verifyAccessToken(token)

    req.user = decoded

    next()

  } catch {

    return res.status(401).json({
      message: "Invalid token"
    })

  }
}