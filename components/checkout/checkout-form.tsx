"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart/cart-context"
import { RazorpayPayment } from "./razorpay-payment"
import { toast } from "sonner"

interface ShippingAddress {
  line1: string
  city: string
  state: string
  postal_code: string
  country: string
}

export function CheckoutForm() {
  const router = useRouter()
  const { cart, isLoading: cartLoading } = useCart()
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  })
  const [email, setEmail] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [userName, setUserName] = useState("")

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Your cart is empty</p>
        <Button onClick={() => router.push("/shop")} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    )
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!email || !contactNumber) {
      toast.error("Please provide email and contact number")
      return
    }

    setStep("payment")
  }

  const handlePaymentSuccess = (paymentData: any) => {
    toast.success("Payment successful!")
    router.push(`/checkout/success?orderId=${paymentData.orderId}&paymentId=${paymentData.paymentId}`)
  }

  const handlePaymentError = (error: any) => {
    console.error("Payment failed:", error)
    toast.error("Payment failed. Please try again.")
  }

  const totalAmount = cart.cost.totalAmount.amount

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div>
          {step === "shipping" && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Full Name</Label>
                    <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="line1">Address Line 1</Label>
                    <Input
                      id="line1"
                      value={shippingAddress.line1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p className="text-sm text-gray-600">
                      {shippingAddress.line1}
                      <br />
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                      <br />
                      {shippingAddress.country}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setStep("shipping")} className="mt-2">
                      Edit Address
                    </Button>
                  </div>

                  <RazorpayPayment
                    amount={Number(totalAmount)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    shippingAddress={shippingAddress}
                    email={email}
                    contactNumber={contactNumber}
                    userName={userName}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.lines.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.merchandise.product.featuredImage || "/placeholder.svg"}
                      alt={item.merchandise.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.merchandise.product.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.merchandise.title} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{Number(Number(item.cost.totalAmount.amount) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{Number(cart.cost.subtotalAmount.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{Number(cart.cost.totalTaxAmount.amount).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{Number(totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
