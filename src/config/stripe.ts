import Stripe from "stripe"
import { AppError } from "../utils/app-error"

let stripeClient: Stripe | null = null

export const getStripe = () => {
  if (stripeClient) {
    return stripeClient
  }

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new AppError("Stripe is not configured", 500)
  }

  stripeClient = new Stripe(secretKey)

  return stripeClient
}
