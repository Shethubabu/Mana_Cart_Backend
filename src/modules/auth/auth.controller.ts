import { Request, Response } from "express"
import * as service from "./auth.service"

export const register = async (req:Request,res:Response)=>{

  const user = await service.registerUser(req.body)

  res.json(user)

}