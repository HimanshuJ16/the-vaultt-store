import { type NextRequest, NextResponse } from "next/server"
import { createRazorpayOrder, RAZORPAY_KEY_ID } from "@/lib/razorpay"
import { getCart } from "@/lib/sfcc"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    if (!RAZORPAY_KEY_ID) {
      return NextResponse.json({ error: "Razorpay is not configured" }, { status: 500 })
    }

    const { shippingAddress, email, contactNumber, userName } = await request.json()

    // Get cart from cookies
    const cartId = (await cookies()).get("cartId")?.value
    if (!cartId) {
      return NextResponse.json({ error: "Cart not found" }, { status: 400 })
    }

    const cart = await getCart()
    if (!cart || cart.lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const amount = Number.parseFloat(cart.cost.totalAmount.amount)

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(amount)

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
