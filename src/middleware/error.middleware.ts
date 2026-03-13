import { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/app-error"

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  console.error(err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    })
  }

  res.status(500).json({
    message: err.message || "Internal Server Error"
  })
}
