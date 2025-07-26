import { type NextRequest, NextResponse } from "next/server"
import { transporter, mailOptions } from "@/lib/nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, orderNumber, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    // Email content for admin
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission - The Vaultt Store
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #007bff;">${email}</a></td>
            </tr>
            ${
              phone
                ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #007bff;">${phone}</a></td>
            </tr>
            `
                : ""
            }
            ${
              orderNumber
                ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Number:</td>
              <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${orderNumber}</td>
            </tr>
            `
                : ""
            }
          </table>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Subject</h3>
          <p style="font-size: 16px; font-weight: bold; color: #333; margin: 0;">${subject}</p>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Message</h3>
          <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">${message}</div>
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6c757d;">
            <strong>Submitted on:</strong> ${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })} (IST)
          </p>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #dee2e6; margin-top: 30px;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            This email was sent from The Vaultt Store contact form.
          </p>
        </div>
      </div>
    `

    // Send email to admin
    await transporter.sendMail({
      ...mailOptions,
      subject: `New Contact Form: ${subject} - The Vaultt Store`,
      html: adminEmailContent,
      replyTo: email, // Allow admin to reply directly to customer
    })

    // Send confirmation email to customer
    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background-color: #007bff; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="color: #333; line-height: 1.6;">
            Thank you for reaching out to <strong>The Vaultt Store</strong>! We have received your message and our team will get back to you within 24 hours (excluding Sundays and public holidays).
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-top: 0;">Your Message Summary:</h3>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
            ${orderNumber ? `<p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>` : ""}
            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })} (IST)</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>Need immediate assistance?</strong><br>
              WhatsApp: <a href="https://wa.me/918860515565" style="color: #007bff;">+91 88605 15565</a><br>
              Email: <a href="mailto:thevaulttstore@gmail.com" style="color: #007bff;">thevaulttstore@gmail.com</a>
            </p>
          </div>

          <p style="color: #333; line-height: 1.6; margin-top: 20px;">
            Thank you for choosing The Vaultt Store. Happy shopping! 🛍️
          </p>
        </div>
        
        <div style="text-align: center; padding: 15px; color: #6c757d; font-size: 12px;">
          <p style="margin: 0;">
            Follow us on Instagram: <a href="https://instagram.com/thevaultstore" style="color: #007bff;">@thevaultstore</a>
          </p>
        </div>
      </div>
    `

    // Send confirmation email to customer
    await transporter.sendMail({
      from: process.env.NODE_MAILER_EMAIL,
      to: email,
      subject: "Thank you for contacting The Vaultt Store - We'll be in touch soon!",
      html: customerEmailContent,
    })

    return NextResponse.json(
      { message: "Message sent successfully! We'll get back to you within 24 hours." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again or contact us directly." },
      { status: 500 },
    )
  }
}
