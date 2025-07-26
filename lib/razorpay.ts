import Razorpay from "razorpay"
import crypto from "crypto"

// Initialize Razorpay instance only if credentials are available
let razorpay: Razorpay | null = null

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID

export async function createRazorpayOrder(amount: number, currency = "INR") {
  if (!razorpay) {
    throw new Error(
      "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables.",
    )
  }

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)
    return order
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw new Error("Failed to create payment order")
  }
}

export function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay secret key is not configured")
  }

  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    return expectedSignature === razorpaySignature
  } catch (error) {
    console.error("Error verifying payment:", error)
    return false
  }
}

export { razorpay }
