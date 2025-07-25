"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayPaymentProps {
  shippingAddress: any
  email: string
  contactNumber?: string
  onSuccess: (orderId: string, orderNumber: string) => void
  onError: (error: string) => void
}

export function RazorpayPayment({ shippingAddress, email, contactNumber, onSuccess, onError }: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => {
      console.error("Failed to load Razorpay script")
      onError("Failed to load payment gateway")
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [onError])

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast.error("Payment gateway is still loading. Please try again.")
      return
    }

    setIsLoading(true)

    try {
      // Create Razorpay order
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to create payment order")
      }

      const { orderId, amount, currency, key } = await response.json()

      const options = {
        key,
        amount,
        currency,
        name: "Your Store Name",
        description: "Purchase from Your Store",
        order_id: orderId,
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email,
          contact: contactNumber || shippingAddress.phone,
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
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed")
            }

            const result = await verifyResponse.json()

            if (result.success) {
              onSuccess(result.orderId, result.orderNumber)
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            onError("Payment verification failed. Please contact support.")
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      onError("Failed to initiate payment. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading || !isScriptLoaded} className="w-full" size="lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : !isScriptLoaded ? (
        "Loading Payment Gateway..."
      ) : (
        "Pay Now"
      )}
    </Button>
  )
}
