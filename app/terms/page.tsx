import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, Video, Shield } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="container mx-auto mt-12 px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to The Vaultt Store. Please read the following terms and conditions ("Terms") carefully before using
          our website or making any purchase. By accessing or using the website, you agree to comply with and be bound
          by these Terms.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              1. Order Acceptance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>• By placing an order, you agree to these terms and conditions.</p>
            <p>• All orders are subject to acceptance and availability.</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              2. Returns and Replacement Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-red-800">
            <div>
              <p className="font-semibold text-lg">No Returns:</p>
              <p>We do not accept returns or cancellations on any orders once they are placed.</p>
            </div>
            <div>
              <p className="font-semibold text-lg">Replacements Only for Damaged or Incorrect Products:</p>
              <p>
                Replacements will only be provided if the product delivered is damaged or different from what was
                ordered (e.g., incorrect size, model, or color).
              </p>
              <p>To qualify, the issue must be clearly shown in a video as detailed below.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Video className="h-5 w-5" />
              3. Parcel Opening Video Requirement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-orange-800">
            <p className="font-semibold">
              A clear, continuous video of the entire parcel opening process is mandatory to claim any replacement due
              to damage or discrepancy.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                The video must start before the package is opened and continue uncut until the product and any issue are
                fully visible.
              </li>
              <li>The shipping label must be clearly shown in the video before opening the parcel.</li>
              <li className="font-semibold">Claims without a valid parcel opening video will not be entertained.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              4. Filing a Replacement Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>• You must contact our customer support within 24 hours of receiving the order.</p>
            <p>• Attach the complete parcel opening video and order details with your request.</p>
            <p>• Our team will review your claim within 3 business days and provide a decision.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Conditions Not Covered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              • No refunds, returns, replacements, or exchanges will be provided for reasons except as stated above.
            </p>
            <p>
              • Any claims made after 24 hours of delivery, or without a valid parcel opening video, will not be
              considered.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Customer Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              • It is your responsibility to record and retain a proper parcel opening video as proof for any
              replacement claim.
            </p>
            <p>• You are responsible for providing accurate contact and delivery information.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Resolution Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our support team will review eligible claims and respond within 3 working days from receipt of a valid
              claim.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              • We are not responsible for any indirect, incidental, or consequential damages arising from product use,
              delivery delays, or service interruptions.
            </p>
            <p>• Our liability, in any case, is limited to the amount paid for the product.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              All site content, including logos, images, and designs, are the intellectual property of The Vaultt Store
              and may not be used without permission.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Policy Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>• We reserve the right to change these terms and conditions at any time without prior notice.</p>
            <p>• Please review this page before making any purchase, as the latest version of the Terms will apply.</p>
          </CardContent>
        </Card>

        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="font-semibold text-lg mb-2">Agreement</p>
          <p className="text-muted-foreground">
            By using this website and placing an order, you acknowledge and accept all the above terms and conditions.
            If you do not agree to these terms, please do not use the website or place an order.
          </p>
          <p className="mt-4">
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact us
            </Link>{" "}
            if you have any questions about these terms.
          </p>
        </div>
      </div>
    </div>
  )
}
