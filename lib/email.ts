import { transporter } from './nodemailer';
import { Address } from './sfcc/types';
import { baseUrl } from './utils';

// Define the logo URL (use the full URL or a relative path like '/logo1.png')
const logoUrl = 'https://the-vaultt-store.vercel.app/logo1.png';

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const shopUrl = baseUrl + '/shop';
  const year = new Date().getFullYear();

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
          <img src="${logoUrl}" alt="The Vaultt Store Logo" />
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
          <p>© ${year} The Vaultt Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: userEmail,
    subject: 'Welcome to The Vaultt Store!',
    html: htmlContent,
    // No attachments needed since the image is embedded via URL
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email.');
  }
}

// Interface for the order details
interface OrderDetails {
  id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: Date;
  shippingAddress: Address; // Use `any` or a more specific type for your address object
  items: {
    quantity: number;
    price: number;
    product: {
      title: string;
      image: string;
    };
    variant: {
      color: string;
      size: string;
    };
  }[];
}

// Function to send an order confirmation email
export async function sendOrderConfirmationEmail(userEmail: string, userName: string, order: OrderDetails) {
  const itemsHtml = order.items.map(item => `
    <tr class="item">
        <td><img src="${item.product.image}" alt="${item.product.title}" width="60" /></td>
        <td>
            ${item.product.title}<br>
            <small>Size: ${item.variant.size}</small>
        </td>
        <td>${item.quantity}</td>
        <td>₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  // A simple way to format the address
  const formattedAddress = `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country} - ${order.shippingAddress.postal_code}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Your Order Confirmation</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
            body { font-family: 'Poppins', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }
            .container { max-width: 650px; margin: 20px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); overflow: hidden; }
            .header { background-color: #F1F1F1; padding: 20px; text-align: center; }
            .header img { max-width: 160px; }
            .content { padding: 30px 40px; }
            .content h1 { font-size: 24px; color: #000; margin-bottom: 10px; }
            .content p { font-size: 16px; line-height: 1.6; }
            .order-summary { margin: 30px 0; }
            .summary-table { width: 100%; border-collapse: collapse; }
            .summary-table th, .summary-table td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
            .summary-table th { color: #888; font-weight: 600; text-transform: uppercase; font-size: 12px; }
            .item td { vertical-align: middle; }
            .item img { border-radius: 4px; margin-right: 15px; }
            .total-row td { font-size: 18px; font-weight: 600; border-top: 2px solid #000; border-bottom: none; text-align: right; }
            .shipping-details { background-color: #fafafa; padding: 20px; border-radius: 5px; margin-top: 20px; }
            .shipping-details h2 { font-size: 18px; margin-bottom: 10px; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; }
            .footer { background-color: #f2f2f2; padding: 25px 20px; text-align: center; font-size: 12px; color: #888; }
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
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="The Vaultt Store Logo">
            </div>
            <div class="content">
                <h1>Thanks for your order, ${userName}!</h1>
                <p>We've received it and we're getting it ready for shipment. You'll receive another email once your order has shipped.</p>
                
                <div class="order-summary">
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th colspan="2">Order Summary</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            <tr class="total-row">
                                <td colspan="3">Total</td>
                                <td>₹${order.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="shipping-details">
                    <h2>Shipping To</h2>
                    <p>${formattedAddress}</p>
                </div>
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
                <p>© ${new Date().getFullYear()} The Vaultt Store. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: userEmail,
    subject: `Your The Vaultt Store Order Confirmation [#${order.orderNumber}]`,
    html: htmlContent,
    // No attachments needed since the image is embedded via URL
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error('Failed to send order confirmation email.');
  }
}

export async function sendOrderShippedEmail(
    userEmail: string,
    userName: string,
    order: string,
    trackingId: string,
    parcelImageUrl: string
) {
    const year = new Date().getFullYear();

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
                <img src="${logoUrl}" alt="The Vaultt Store Logo" style="max-width: 160px;" />
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
                <p>© ${year} The Vaultt Store. All rights reserved.</p>
            </div>
            
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.NODE_MAILER_EMAIL,
        to: userEmail,
        subject: `Your Order [#${order}] has been shipped!`,
        html: htmlContent,
        // No attachments needed since the image is embedded via URL
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order shipped email sent to:', userEmail);
    } catch (error) {
        console.error('Error sending order shipped email:', error);
        throw new Error('Failed to send order shipped email.');
    }
}