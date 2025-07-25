import { type NextRequest, NextResponse } from "next/server"
import { createRazorpayOrder } from "@/lib/razorpay"
import { getCart } from "@/lib/sfcc"

export async function POST(req: NextRequest) {
  try {
    const cart = await getCart()

    if (!cart || cart.lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const amount = Number.parseFloat(cart.cost.totalAmount.amount)
    const razorpayOrder = await createRazorpayOrder(amount)

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
