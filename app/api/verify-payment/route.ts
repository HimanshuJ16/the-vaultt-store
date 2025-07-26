import { type NextRequest, NextResponse } from "next/server"
import { verifyRazorpayPayment } from "@/lib/razorpay"
import { placeOrder, clearCartAfterPayment, getUserId } from "@/lib/sfcc"
import { sendOrderConfirmationEmail } from "@/lib/email"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      email,
      contactNumber,
      userName,
    } = body

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

    // Get order with items for email
    const orderWithItems = await prisma.order.findUnique({
      where: { id: updatedOrder.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!orderWithItems) {
      throw new Error("Order not found after update")
    }

    // Transform the order data to match the OrderDetails interface
    const orderForEmail = {
      id: orderWithItems.id,
      totalAmount: orderWithItems.totalAmount,
      createdAt: orderWithItems.createdAt,
      shippingAddress: {
          line1: shippingAddress.line1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zip,
          country: shippingAddress.country,
      },
      paymentId: razorpay_payment_id,
      items: order.lines.map(item => {
          const colorOption = item.merchandise.selectedOptions.find(opt => opt.name.toLowerCase() === 'color');
          const sizeOption = item.merchandise.selectedOptions.find(opt => opt.name.toLowerCase() === 'size');
          return {
            quantity: item.quantity,
            price: parseFloat(item.cost.totalAmount.amount) / item.quantity,
            product: {
              title: item.merchandise.product.title,
              image: item.merchandise.product.featuredImage,
            },
            variant: {
              color: colorOption ? colorOption.value : 'N/A',
              size: sizeOption ? sizeOption.value : 'N/A',
            },
          };
        }),
    }

    // Send order confirmation email with payment ID
    try {
      await sendOrderConfirmationEmail(email, userName || "Customer", orderForEmail)
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Don't fail the entire request if email fails
    }

    // Clear the cart after successful payment
    const userId = await getUserId()
    if (userId) {
      await clearCartAfterPayment(userId)
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      paymentId: razorpay_payment_id,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
