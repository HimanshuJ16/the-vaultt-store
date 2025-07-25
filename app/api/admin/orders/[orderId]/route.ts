import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOrderShippedEmail } from '@/lib/email';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { status, trackingId, parcelImage } = body;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingId,
        parcelImage,
      },
      include: {
        user: true,
      },
    });

    if (updatedOrder.status === 'SHIPPED' && updatedOrder.user) {
      try {
        await sendOrderShippedEmail(
          updatedOrder.user.email,
          updatedOrder.user.fullName || '',
          updatedOrder.orderNumber,
          updatedOrder.trackingId || '',
          updatedOrder.parcelImage || ''
        );
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the order." },
      { status: 500 }
    );
  }
}