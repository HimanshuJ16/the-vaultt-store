import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Users, Lock, FileText, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-12 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy for The Vaultt Store</h1>
        <p className="text-lg text-muted-foreground">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you visit and purchase from our website.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              1. Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you visit and purchase from our website. By using our site, you agree to the
              collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              2. Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-2">Personal Information:</p>
              <p>
                When you purchase something from our store, we collect personal details such as your name, address,
                phone number, email address, and payment information to process your order.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Device Information:</p>
              <p>
                We automatically collect certain information about your device, including IP address, browser type,
                operating system, time zone, and cookies installed on your device.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Usage Information:</p>
              <p>
                We collect data about how you interact with our website, such as pages viewed, time spent, and referring
                websites.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Cookies and Tracking Technologies:</p>
              <p>
                We use cookies, log files, web beacons, tags, and pixels to collect data about your browsing actions and
                usage patterns.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              3. How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">We may use your information to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Process transactions and deliver products.</li>
              <li>Improve and personalize your experience on our website.</li>
              <li>Communicate with you about orders or account activities.</li>
              <li>Send you promotional emails.</li>
              <li>Analyze website traffic and usage to improve our services.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              4. Disclosure of Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-2">Third-Party Service Providers:</p>
              <p>
                We may share your information with trusted service providers to help us operate our website, fulfill
                your orders, process payments, and analyze data.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Legal Requirements:</p>
              <p>
                We may disclose your information to comply with a legal obligation, protect our rights, or respond to
                lawful requests by public authorities.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Marketing Partners:</p>
              <p>We will only share your information for marketing purposes if you have given explicit consent.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. User Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access, correct, or request the deletion of your personal information.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
              <li>Restrict data processing for certain purposes.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              6. Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We implement strict security measures, including SSL encryption for online transactions, to protect your
              data from unauthorized access, alteration, or disclosure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Cookies Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We use cookies to enhance user experiences. You can set your browser to refuse cookies or alert you when
              cookies are being sent.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Retention of Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We retain personal data only as long as needed to fulfill the purposes outlined in this policy, unless a
              longer retention is required or permitted by law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our website is not intended for users under the age of 18. We do not knowingly collect personal
              information from children.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We reserve the right to modify this Privacy Policy at any time. Changes will be posted on this page with
              an updated "Effective Date." Please review this policy periodically.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Phone className="h-5 w-5" />
              11. Grievance/Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <p className="mb-4">
              If you have questions, concerns, or complaints regarding this Privacy Policy or our data practices,
              contact us at:
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Link href="mailto:thevaulttstore@gmail.com" className="underline">
                  thevaulttstore@gmail.com
                </Link>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <Link href="tel:+918860515565" className="underline">
                  +91 88605 15565
                </Link>
              </p>
            </div>
            <p className="mt-4 text-sm">
              You may also submit a complaint to the Data Protection Board of India if you believe your rights under the
              DPDPA have been violated.
            </p>
          </CardContent>
        </Card>

        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="font-semibold text-lg mb-2">Effective Date</p>
          <p className="text-muted-foreground mb-4">This Privacy Policy is effective as of January 1, 2024.</p>
          <p className="text-sm text-muted-foreground">
            For any questions about this policy, please{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
