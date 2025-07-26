import nodemailer from "nodemailer"
import { baseUrl } from "./utils"

interface OrderDetails {
  id: string
  totalAmount: number
  createdAt: Date
  shippingAddress: {
    line1: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  paymentId?: string
  items: Array<{
    quantity: number
    price: number
    product: {
      title: string
      image: string
    }
    variant: {
      color: string
      size: string
    }
  }>
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  },
})

// Function to send a welcome email with an improved design
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const shopUrl = baseUrl + "/shop"
  const year = new Date().getFullYear()

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to The Vaultt Store!</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        body {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
          padding: 30px;
          text-align: center;
          background-color: #F0F0F0;
        }
        .header img {
          max-width: 160px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .content h1 {
          font-size: 26px;
          color: #000;
          margin-bottom: 16px;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
          color: #555;
          margin: 0 0 20px;
        }
        .highlight {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 6px;
          color: #b45309;
          font-weight: 600;
          margin: 20px 0;
        }
        .features {
          text-align: left;
          padding: 0 20px;
        }
        .features h3 {
          font-size: 18px;
          color: #000;
          margin-top: 30px;
        }
        .features ul {
          padding-left: 20px;
          color: #444;
        }
        .button-container {
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background-color: #f1f1f1;
          color: #0505fc;
          padding: 14px 36px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #fafafa;
        }
        .footer {
          background-color: #fafafa;
          padding: 25px 20px;
          text-align: center;
          font-size: 13px;
          color: #888;
        }
        .socials {
          margin-bottom: 15px;
        }
        .socials p {
          margin-bottom: 10px;
          font-size: 14px;
          color: #444;
          font-weight: 500;
        }
        .socials a {
          margin: 0 8px;
          display: inline-block;
        }
        .socials img {
          width: 28px;
          height: 28px;
          opacity: 0.85;
          transition: opacity 0.2s ease;
        }
        .socials img:hover {
          opacity: 1;
        }
        @media (max-width: 600px) {
          .content {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="The Vaultt Store Logo" />
        </div>
        <div class="content">
          <h1>Welcome, ${userName}!</h1>
          <p>You're officially in. Welcome to <strong>The Vaultt Store</strong> — where the most hyped sneakers meet exclusive access.</p>
    
          <div class="button-container">
            <a href="${shopUrl}" class="button">Explore Now!</a>
          </div>
    
          <p>Got questions or want style advice? Our sneaker support squad is always here to help.</p>
        </div>
    
        <div class="footer">
          <div class="socials">
            <p>Follow us for exclusive drops & updates:</p>
            <a href="https://www.instagram.com/thevaulttstore">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
            </a>
            <a href="https://api.whatsapp.com/send?phone=918860515565&text=Hi%20TheVaulttStore%2C%20want%20to%20order%20a%20product.">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" />
            </a>
          </div>
          <p>&copy; ${year} The Vaultt Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: userEmail,
    subject: "Welcome to The Vaultt Store!",
    html: htmlContent,
    attachments: [
      {
        filename: "logo1.png",
        path: "./public/logo1.png",
        cid: "logo",
      },
    ],
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Welcome email sent to:", userEmail)
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw new Error("Failed to send welcome email.")
  }
}

// Function to send an order confirmation email with payment ID
export async function sendOrderConfirmationEmail(email: string, customerName: string, orderDetails: OrderDetails) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <img src="${item.product.image}" alt="${item.product.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.product.title}</strong><br>
        <small>Color: ${item.variant.color} | Size: ${item.variant.size}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #28a745; margin: 0;">Order Confirmed!</h1>
        <p style="margin: 10px 0 0 0;">Thank you for your purchase, ${customerName}!</p>
      </div>

      <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin-top: 0;">Order Details</h2>
        <p><strong>Order ID:</strong> ${orderDetails.id}</p>
        <p><strong>Order Date:</strong> ${orderDetails.createdAt.toLocaleDateString()}</p>
        ${orderDetails.paymentId ? `<p><strong>Payment ID:</strong> ${orderDetails.paymentId}</p>` : ""}
        <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">PAID</span></p>
      </div>

      <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin-top: 0;">Items Ordered</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Image</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6;">
          <h3 style="margin: 0;">Total: ₹${orderDetails.totalAmount.toFixed(2)}</h3>
        </div>
      </div>

      <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin-top: 0;">Shipping Address</h2>
        <p style="margin: 0;">
          ${orderDetails.shippingAddress.line1}<br>
          ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postal_code}<br>
          ${orderDetails.shippingAddress.country}
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0;">Thank you for shopping with us!</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: email,
    subject: `Order Confirmation - ${orderDetails.id}`,
    html: htmlContent,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderShippedEmail(
  userEmail: string,
  userName: string,
  order: string,
  trackingId: string,
  parcelImageUrl: string,
) {
  const year = new Date().getFullYear()

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Your Order is on its way!</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
            body {
                font-family: 'Poppins', sans-serif;
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background-color: #f5f5f5; color: #333;">
        <div style="max-width: 600px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            
            <div style="padding: 30px; text-align: center; background-color: #F0F0F0;">
                <img src="cid:logo" alt="The Vaultt Store Logo" style="max-width: 160px;" />
            </div>
            
            <div style="padding: 40px 30px; text-align: center;">
                <h1 style="font-size: 26px; color: #000; margin-bottom: 16px;">Your Order Has Shipped!</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 20px;">Great news, <b>${userName}!</b></p>
              
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 20px;">Your order <b>#${order}</b> is on its way to you.</p>

                <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 16px; color: #333;">You can track your parcel using this tracking ID:</p>
                    <strong style="font-size: 20px; color: #0056b3; display: block; margin-top: 5px;">${trackingId}</strong>
                </div>

                <div style="margin: 25px 0;">
                    <p style="margin: 0 0 15px; font-size: 16px; color: #555;">Here's a look at your package:</p>
                    <img src="${parcelImageUrl}" alt="Your Parcel" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" /> 
                </div>
                                    
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 20px;">Thank you for shopping with us!</p>
            </div>
            
            <div style="background-color: #fafafa; padding: 25px 20px; text-align: center; font-size: 13px; color: #888;">
                <div style="margin-bottom: 15px;">
                    <p style="margin-bottom: 10px; font-size: 14px; color: #444; font-weight: 500;">Follow us for exclusive drops & updates:</p>
                    <a href="https://www.instagram.com/thevaulttstore" style="margin: 0 8px; display: inline-block;">
                        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 28px; height: 28px; opacity: 0.85;" />
                    </a>
                    <a href="https://api.whatsapp.com/send?phone=918860515565&text=Hi%20TheVaulttStore%2C%20want%20to%20order%20a%20product." style="margin: 0 8px; display: inline-block;">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style="width: 28px; height: 28px; opacity: 0.85;" />
                    </a>
                </div>
                <p>&copy; ${year} The Vaultt Store. All rights reserved.</p>
            </div>
            
        </div>
    </body>
    </html>
    `

  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: userEmail,
    subject: `Your Order [#${order}] has been shipped!`,
    html: htmlContent,
    attachments: [
      {
        filename: "logo1.png",
        path: "./public/logo1.png",
        cid: "logo",
      },
    ],
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Order shipped email sent to:", userEmail)
  } catch (error) {
    console.error("Error sending order shipped email:", error)
    throw new Error("Failed to send order shipped email.")
  }
}
