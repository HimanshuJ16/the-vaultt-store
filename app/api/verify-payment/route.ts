import { type NextRequest, NextResponse } from "next/server"
import { verifyRazorpayPayment } from "@/lib/razorpay"
import { placeOrder, clearCartAfterPayment, getUserId } from "@/lib/sfcc"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress, email, contactNumber } = body

    // Verify the payment signature
    const isValidPayment = verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!isValidPayment) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Place the order
    const order = await placeOrder({
      shippingAddress,
      email,
      contactNumber,
    })

    // Update order with payment information and set status to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: "PAID",
      },
    })

    // Clear the cart after successful payment
    const userId = await getUserId()
    if (userId) {
      await clearCartAfterPayment(userId)
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
