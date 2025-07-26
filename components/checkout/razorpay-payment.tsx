"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Lock } from "lucide-react"

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
  const [isProcessing, setIsProcessing] = useState(false)

  // Prevent back button and page refresh during payment processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault()
        e.returnValue = "Payment is being processed. Please don't close this tab or press back button."
        return "Payment is being processed. Please don't close this tab or press back button."
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (isProcessing) {
        e.preventDefault()
        window.history.pushState(null, "", window.location.href)
        toast.error("Please don't press back button during payment processing!")
      }
    }

    if (isProcessing) {
      window.addEventListener("beforeunload", handleBeforeUnload)
      window.addEventListener("popstate", handlePopState)
      window.history.pushState(null, "", window.location.href)
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isProcessing])

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
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway")
        setIsLoading(false)
        return
      }

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

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "The Vaultt Store",
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
          setIsProcessing(true)
          // --- Start of Fix ---
          const toastId = toast.loading("Verifying payment... Please don't close this tab!")

          try {
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
              toast.dismiss(toastId)
              toast.success("Payment successful! Redirecting...")
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
            toast.dismiss(toastId)
            onError(error)
          } finally {
            setIsProcessing(false)
          }
          // --- End of Fix ---
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setIsProcessing(false)
            toast.error("Payment cancelled")
          },
        },
      }

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
    <div className="space-y-4">
      {isProcessing && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Payment Processing - Please Wait!</strong>
            <br />• Don't press the back button
            <br />• Don't close this tab
            <br />• Don't refresh the page
            <br />
            <br />
            Your payment is being verified and you'll be redirected automatically.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Complete Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>₹{Number.parseFloat(amount).toFixed(2)}</span>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure payment powered by Razorpay</span>
              </div>
              <p>• Supports UPI, Cards, Net Banking, and Wallets</p>
              <p>• Your payment information is encrypted and secure</p>
              <p>• SSL secured checkout process</p>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Important:</strong> After clicking "Pay Now", please don't press back button or close the tab
                until payment is complete and you're redirected to the success page.
              </AlertDescription>
            </Alert>

            <Button onClick={handlePayment} disabled={isLoading || isProcessing} className="w-full" size="lg">
              {isLoading
                ? "Loading Payment Gateway..."
                : isProcessing
                  ? "Processing Payment..."
                  : `Pay ₹${Number.parseFloat(amount).toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}