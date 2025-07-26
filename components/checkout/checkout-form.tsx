"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { RazorpayPayment } from "./razorpay-payment"
import type { Cart } from "@/lib/sfcc/types"

const formSchema = z.object({
  email: z.string().email(),
  contactNumber: z.string().min(10, "Please enter a valid phone number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
})

type UserData = {
  email: string
  firstName: string
  lastName: string
} | null

interface CheckoutFormProps {
  user: UserData
  cart: Cart
}

export function CheckoutForm({ user, cart }: CheckoutFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"shipping" | "payment">("shipping")
  const [shippingData, setShippingData] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      contactNumber: "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setShippingData(values)
    setStep("payment")
  }

  const handlePaymentSuccess = (paymentData: any) => {
    toast.success("Payment successful! Redirecting to confirmation...")
    router.push(
      `/checkout/success?orderId=${paymentData.orderId}&orderNumber=${paymentData.orderNumber}&paymentId=${paymentData.paymentId}`,
    )
  }

  const handlePaymentError = (error: any) => {
    toast.error("Payment failed. Please try again.")
    console.error("Payment error:", error)
  }

  if (step === "payment" && shippingData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setStep("shipping")} className="mb-4">
            ← Back to Shipping Information
          </Button>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-600">
              {shippingData.firstName} {shippingData.lastName}
              <br />
              {shippingData.address}
              <br />
              {shippingData.city}, {shippingData.state} {shippingData.postalCode}
              <br />
              {shippingData.country}
            </p>
          </div>
        </div>

        <RazorpayPayment
          amount={cart?.cost?.totalAmount?.amount || "0"}
          shippingAddress={{
            line1: shippingData.address,
            city: shippingData.city,
            state: shippingData.state,
            postal_code: shippingData.postalCode,
            country: shippingData.country,
          }}
          email={shippingData.email}
          contactNumber={shippingData.contactNumber}
          userName={`${shippingData.firstName} ${shippingData.lastName}`}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
          <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      {...field}
                      readOnly={!!user?.email}
                      className={user?.email ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Contact number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter your contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-10">
          <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>
          <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!!user?.firstName}
                      className={user?.firstName ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!!user?.lastName}
                      className={user?.lastName ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-10">
          <h2 className="text-lg font-medium text-gray-900">Payment</h2>
          <p className="mt-2 text-sm text-gray-600">
            You will be redirected to Razorpay for secure payment processing.
          </p>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </div>
      </form>
    </Form>
  )
}
