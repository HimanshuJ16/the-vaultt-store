"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayPaymentProps {
  amount: string
  shippingAddress: {
    line1: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  email: string
  contactNumber: string
  userName: string
  onSuccess: (data: any) => void
  onError: (error: any) => void
}

export function RazorpayPayment({
  amount,
  shippingAddress,
  email,
  contactNumber,
  userName,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway")
        setIsLoading(false)
        return
      }

      // Create Razorpay order
      const orderResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress,
          email,
          contactNumber,
          userName,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order")
      }

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Your Store Name",
        description: "Order Payment",
        order_id: orderData.orderId,
        prefill: {
          name: userName,
          email: email,
          contact: contactNumber,
        },
        theme: {
          color: "#000000",
        },
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress,
                email,
                contactNumber,
                userName,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.success) {
              onSuccess({
                orderId: verifyData.orderId,
                orderNumber: verifyData.orderNumber,
                paymentId: verifyData.paymentId,
              })
            } else {
              throw new Error(verifyData.error || "Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            onError(error)
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            toast.error("Payment cancelled")
          },
        },
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to initiate payment")
      onError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span>₹{Number.parseFloat(amount).toFixed(2)}</span>
          </div>

          <div className="text-sm text-gray-600">
            <p>• Secure payment powered by Razorpay</p>
            <p>• Supports UPI, Cards, Net Banking, and Wallets</p>
            <p>• Your payment information is encrypted and secure</p>
          </div>

          <Button onClick={handlePayment} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? "Processing..." : `Pay ₹${Number.parseFloat(amount).toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
