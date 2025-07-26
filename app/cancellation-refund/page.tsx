import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, XCircle, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CancellationRefundPage() {
  return (
    <div className="container mx-auto mt-12 px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Cancellations and Refunds Policy</h1>
        <p className="text-lg text-muted-foreground">
          Please read our cancellation and refund policy carefully to understand your options and our procedures.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <XCircle className="h-5 w-5" />
              Order Cancellations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-800">
            <div>
              <p className="font-semibold text-lg mb-2">Cancellation Window:</p>
              <p>You may cancel your order within 24 hours of placement.</p>
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">How to Cancel:</p>
              <p>
                Contact our customer support team via email or phone within 24 hours, providing your order number and
                cancellation reason.
              </p>
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">After 24 Hours:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Orders cannot be canceled after the 24-hour window has passed.</li>
                <li>Once processing or shipping has begun, cancellations will not be accepted.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <RefreshCw className="h-5 w-5" />
              Refunds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-green-800">
            <div>
              <p className="font-semibold text-lg mb-2">Eligibility:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Refunds are issued only for orders successfully canceled within the 24-hour window.</li>
                <li>
                  No refunds will be provided for orders canceled after this window or once the order has been shipped.
                </li>
                <li>
                  No refunds are offered for returns, except when the product is damaged or incorrect and you have
                  submitted a valid parcel opening video, as per our Returns and Replacement Policy.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">Refund Process:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Approved refund requests will be processed within 4 working days to your original payment method.
                </li>
                <li>You will receive a confirmation once the refund is initiated.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-red-800">
            <p>• Orders that have entered shipment or delivery processing are ineligible for cancellation or refund.</p>
            <p>• It is the customer's responsibility to ensure timely communication for cancellation requests.</p>
            <p className="font-semibold">• Our refund decisions are final and binding.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Within 24 hours of order placement:</p>
                  <p className="text-muted-foreground">Cancellation and full refund available</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold">After 24 hours:</p>
                  <p className="text-muted-foreground">No cancellations or refunds accepted</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Refund processing:</p>
                  <p className="text-muted-foreground">4 working days to original payment method</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="font-semibold text-lg mb-2">Questions?</p>
          <p className="text-muted-foreground mb-4">
            By placing an order on our website, you agree to this Cancellations and Refunds Policy. If you have any
            questions, please contact our support before placing your order.
          </p>
          <div className="space-y-2">
            <p>
              <Link href="/contact" className="text-blue-600 hover:underline font-medium">
                Contact Support
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">Email: thevaulttstore@gmail.com | Phone: +91 88605 15565</p>
          </div>
        </div>
      </div>
    </div>
  )
}
