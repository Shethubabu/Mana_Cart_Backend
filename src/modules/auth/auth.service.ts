import { prisma } from "../../config/prisma"
import bcrypt from "bcrypt"

export const registerUser = async (data:any) => {

  const hashedPassword = await bcrypt.hash(data.password, 10)

  return prisma.user.create({
    data:{
      name:data.name,
      email:data.email,
      password:hashedPassword
    }
  })

}