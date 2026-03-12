import { Request, Response } from "express"
import * as service from "./home.service"

export const getHome = async (req: Request, res: Response) => {

  const data = await service.getHomeData()

  res.json(data)

}