import { Request, Response } from "express"
import * as service from "./category.service"

export const getCategories = async (
  req: Request,
  res: Response
) => {

  const categories = await service.getCategories()

  res.json(categories)

}