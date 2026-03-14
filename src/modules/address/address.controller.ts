import { Request, Response } from "express"
import {prisma} from "../../config/prisma"

export const getAddresses = async (req: any, res: Response) => {

  const addresses = await prisma.address.findMany({
    where: { userId: req.user.userId }
  })

  res.json(addresses)
}

export const createAddress = async (req: any, res: Response) => {

  const address = await prisma.address.create({
    data: {
      ...req.body,
      userId: req.user.userId
    }
  })

  res.json(address)
}

export const updateAddress = async (req: any, res: Response) => {

  const id = Number(req.params.id)

  const address = await prisma.address.update({
    where: { id },
    data: req.body
  })

  res.json(address)
}

export const deleteAddress = async (req: any, res: Response) => {

  const id = Number(req.params.id)

  await prisma.address.delete({
    where: { id }
  })

  res.json({ message: "Address deleted" })
}