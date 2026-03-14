import { prisma } from "../../config/prisma"
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  getRazorpayPayment,
  verifyRazorpaySignature
} from "../../config/razorpay"
import { AppError } from "../../utils/app-error"

const RAZORPAY_CURRENCY = (
  process.env.RAZORPAY_CURRENCY ||
  process.env.STRIPE_CURRENCY ||
  "INR"
).toUpperCase()

type CheckoutInput = {
  addressId?: number
}

type ConfirmPaymentInput = {
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
}

const getCheckoutContext = async (
  userId: number,
  addressId?: number
) => {
  const [user, cartItems, address] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    }),
    prisma.cart.findMany({
      where: { userId },
      include: {
        product: true
      }
    }),
    addressId
      ? prisma.address.findFirst({
          where: {
            id: addressId,
            userId
          }
        })
      : Promise.resolve(null)
  ])

  if (!user) {
    throw new AppError("User not found", 404)
  }

  if (cartItems.length === 0) {
    throw new AppError("Cart is empty", 400)
  }

  if (addressId && !address) {
    throw new AppError("Address not found", 404)
  }

  const unavailableProduct = cartItems.find(
    (item) => item.quantity < 1 || item.quantity > item.product.stock
  )

  if (unavailableProduct) {
    throw new AppError(
      `Invalid quantity for ${unavailableProduct.product.title}`,
      400
    )
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const amount = Math.round(total * 100)

  if (amount <= 0) {
    throw new AppError("Invalid order total", 400)
  }

  return {
    user,
    cartItems,
    address,
    total,
    amount
  }
}

export const checkout = async (
  userId: number,
  input: CheckoutInput
) => {
  const { user, cartItems, total, amount, address } =
    await getCheckoutContext(userId, input.addressId)
  const receipt = `mc_${userId}_${Date.now()}`.slice(0, 40)

  const razorpayOrder = await createRazorpayOrder({
    amount,
    currency: RAZORPAY_CURRENCY,
    receipt,
    notes: {
      userId: String(userId),
      email: user.email
    }
  })

  const order = await prisma.order.create({
    data: {
      userId,
      addressId: address?.id,
      total,
      currency: RAZORPAY_CURRENCY,
      paymentProvider: "razorpay",
      paymentProviderOrderId: razorpayOrder.id,
      status: "pending",
      paymentStatus: "pending",
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      }
    },
    include: {
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    }
  })

  return {
    order,
    razorpayKeyId: getRazorpayKeyId(),
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: RAZORPAY_CURRENCY
  }
}

export const confirmPayment = async (
  userId: number,
  input: ConfirmPaymentInput
) => {
  const razorpayOrderId = input.razorpayOrderId?.trim()
  const razorpayPaymentId = input.razorpayPaymentId?.trim()
  const razorpaySignature = input.razorpaySignature?.trim()

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError(
      "razorpayOrderId, razorpayPaymentId and razorpaySignature are required",
      400
    )
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      paymentProvider: "razorpay",
      paymentProviderOrderId: razorpayOrderId
    },
    include: {
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    throw new AppError("Order not found", 404)
  }

  if (order.paymentStatus === "paid") {
    if (
      order.paymentProviderPaymentId &&
      order.paymentProviderPaymentId !== razorpayPaymentId
    ) {
      throw new AppError("Payment ID does not match the paid order", 400)
    }

    return order
  }

  const isValidSignature = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature
  })

  if (!isValidSignature) {
    throw new AppError("Invalid Razorpay payment signature", 400)
  }

  const payment = await getRazorpayPayment(razorpayPaymentId)
  const expectedAmount = Math.round(order.total * 100)

  if (payment.order_id !== razorpayOrderId) {
    throw new AppError("Payment does not belong to this Razorpay order", 400)
  }

  if (payment.amount !== expectedAmount) {
    throw new AppError("Payment amount mismatch", 400)
  }

  if (payment.currency.toUpperCase() !== order.currency.toUpperCase()) {
    throw new AppError("Payment currency mismatch", 400)
  }

  if (!["authorized", "captured"].includes(payment.status)) {
    throw new AppError(
      `Payment is not complete. Current status: ${payment.status}`,
      400
    )
  }

  const paidOrder = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paymentStatus: "paid",
        paymentProviderPaymentId: razorpayPaymentId
      },
      include: {
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    })

    await tx.cart.deleteMany({
      where: {
        userId,
        productId: {
          in: order.items.map((item) => item.productId)
        }
      }
    })

    return updatedOrder
  })

  return paidOrder
}

export const getOrders = async (userId: number) => {

  return prisma.order.findMany({
    where: { userId },
    include: {
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

}

export const getOrderById = async (
  orderId: number,
  userId: number
) => {

  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    }
  })

}
