"use client"

import { Suspense } from "react"
import { CheckCircle, Package, CreditCard, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")
  const paymentId = searchParams.get("paymentId")
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Thank you for your order. We've received your payment.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Order Status</span>
                <span className="font-semibold text-green-600">Confirmed & Paid</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Payment Processed</h3>
                  <p className="text-sm text-green-600">Your payment has been successfully processed via Razorpay</p>
                </div>
              </div>
<div className="mt-8 space-y-4">
            {orderNumber && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-900">Order ID</p>
                <p className="text-sm text-gray-600 font-mono">{orderNumber}</p>
              </div>
            )}

            {paymentId && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-900">Payment ID</p>
                <p className="text-sm text-gray-600 font-mono">{paymentId}</p>
              </div>
            )}

          </div>
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <Truck className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Order Processing</h3>
                  <p className="text-sm text-blue-600">We're preparing your order for shipment</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Order Confirmation Email</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive an email confirmation with your order details and payment information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Order Processing</h4>
                  <p className="text-sm text-gray-600">
                    We'll prepare your items for shipment within 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Shipping Notification</h4>
                  <p className="text-sm text-gray-600">You'll receive tracking information once your order ships.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-gray-600">Need help with your order?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
