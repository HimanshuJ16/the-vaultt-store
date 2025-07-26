"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, Instagram, Clock, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  name: string
  email: string
  phone: string
  orderNumber: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    orderNumber: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Message Sent Successfully!",
          description: "We'll get back to you within 24 hours.",
        })
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          orderNumber: "",
          subject: "",
          message: "",
        })
      } else {
        throw new Error(result.error || "Failed to send message")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          We're here to help! Whether you have a question about your order, need assistance with our policies, or just
          want to know more about our sneakers, our team is ready to assist you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Customer Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Email:</p>
              <Link href="mailto:thevaulttstore@gmail.com" className="text-blue-600 hover:underline">
                thevaulttstore@gmail.com
              </Link>
              <p className="text-sm text-muted-foreground">(Available 10:00 AM – 7:00 PM, Monday to Sunday)</p>
            </div>
            <div>
              <p className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone:
              </p>
              <Link href="tel:+918860515565" className="text-blue-600 hover:underline">
                +91 - 88605 15565
              </Link>
              <p className="text-sm text-muted-foreground">(Call or WhatsApp, business hours only)</p>
            </div>
            <div>
              <p className="font-medium flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram:
              </p>
              <Link
                href="https://instagram.com/thevaultstore"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @thevaultstore
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Store Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-2">We only sell online.</p>
            <p className="text-muted-foreground">
              The Vaultt Store is an online-only retailer. We don't have a physical store location, but we're always
              available through our digital channels to assist you with your sneaker needs.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Replacement/Order Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="text-orange-800">
          <p className="mb-4">
            If your query concerns a damaged or incorrect item, please review our{" "}
            <Link href="/cancellation-refund" className="underline font-medium">
              Returns & Replacement Policy
            </Link>{" "}
            before contacting us.
          </p>
          <p className="font-medium text-red-600">
            Note: A parcel opening video is mandatory for any replacement requests.
          </p>
          <div className="mt-4">
            <p className="font-medium mb-2">
              To help us serve you faster, please include the following with your message:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Your order number</li>
              <li>The issue details</li>
              <li>Parcel opening video (for replacement claims)</li>
              <li>Your contact information</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Us a Message</CardTitle>
          <CardDescription>
            We strive to respond to all messages within 24 hours (excluding Sundays and public holidays).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Thank you for your message! We've sent a confirmation email and will get back to you within 24 hours.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  placeholder="#ORDER-XXXXXXXXXXXXX (if applicable)"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Brief description of your inquiry"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Please provide detailed information about your inquiry. For replacement requests, mention that you have the parcel opening video ready."
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Message...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center mt-8 p-6 bg-muted rounded-lg">
        <p className="text-lg font-medium mb-2">Thank you for choosing The Vaultt Store.</p>
        <p className="text-muted-foreground">Happy shopping! 🛍️</p>
      </div>
    </div>
  )
}
