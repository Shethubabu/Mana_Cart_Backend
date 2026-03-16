import axios from "axios"
import crypto from "crypto"
import { AppError } from "../utils/app-error"

const RAZORPAY_API_BASE_URL = "https://api.razorpay.com/v1"

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()

  if (!keyId || !keySecret) {
    throw new AppError("Razorpay is not configured", 500)
  }

  return {
    keyId,
    keySecret
  }
}

const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayCredentials()

  return axios.create({
    baseURL: RAZORPAY_API_BASE_URL,
    auth: {
      username: keyId,
      password: keySecret
    },
    proxy: false,
    timeout: 10000
  })
}

export const getRazorpayKeyId = () => getRazorpayCredentials().keyId

export const createRazorpayOrder = async (input: {
  amount: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}) => {
  try {
    const client = getRazorpayClient()
    const { data } = await client.post("/orders", {
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes
    })

    return data as {
      id: string
      amount: number
      currency: string
      receipt: string
      status: string
    }
  } catch (error: any) {
    console.error("Razorpay order creation failed", {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data
    })

    const message =
      error?.response?.data?.error?.description ||
      error?.response?.data?.error?.reason ||
      error?.code ||
      "Failed to create Razorpay order"

    throw new AppError(message, error?.response?.status || 502)
  }
}

export const getRazorpayPayment = async (paymentId: string) => {
  try {
    const client = getRazorpayClient()
    const { data } = await client.get(`/payments/${paymentId}`)

    return data as {
      id: string
      order_id: string | null
      amount: number
      currency: string
      status: string
    }
  } catch (error: any) {
    console.error("Razorpay payment fetch failed", {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data
    })

    const message =
      error?.response?.data?.error?.description ||
      error?.response?.data?.error?.reason ||
      error?.code ||
      "Failed to verify Razorpay payment"

    throw new AppError(message, error?.response?.status || 502)
  }
}

export const verifyRazorpaySignature = (input: {
  orderId: string
  paymentId: string
  signature: string
}) => {
  const { keySecret } = getRazorpayCredentials()

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex")

  const providedSignature = input.signature.trim()

  if (providedSignature.length !== expectedSignature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(providedSignature)
  )
}
