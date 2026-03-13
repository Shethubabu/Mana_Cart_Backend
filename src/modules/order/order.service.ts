import { prisma } from "../../config/prisma"
import { getStripe } from "../../config/stripe"
import { AppError } from "../../utils/app-error"

const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || "inr").toLowerCase()

type CheckoutInput = {
  addressId?: number
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
  const stripe = getStripe()

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: STRIPE_CURRENCY,
    automatic_payment_methods: {
      enabled: true
    },
    receipt_email: user.email,
    metadata: {
      userId: String(userId)
    }
  })

  const order = await prisma.order.create({
    data: {
      userId,
      addressId: address?.id,
      total,
      currency: STRIPE_CURRENCY,
      paymentIntentId: paymentIntent.id,
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
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amount,
    currency: STRIPE_CURRENCY
  }
}

export const confirmPayment = async (
  userId: number,
  paymentIntentId: string
) => {
  if (!paymentIntentId) {
    throw new AppError("paymentIntentId is required", 400)
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      paymentIntentId
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
    return order
  }

  const stripe = getStripe()
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.status !== "succeeded") {
    throw new AppError(
      `Payment is not complete. Current status: ${paymentIntent.status}`,
      400
    )
  }

  const paidOrder = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paymentStatus: "paid"
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
