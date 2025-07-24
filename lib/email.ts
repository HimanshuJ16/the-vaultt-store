import { transporter } from './nodemailer';
import { baseUrl } from './utils';

// Function to send a welcome email with an improved design
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
          background-color: #8B8B8B;
          color: #fff;
          padding: 14px 36px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #333;
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
  `;

  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: userEmail,
    subject: 'Welcome to The Vaultt Store!',
    html: htmlContent,
    attachments: [{
      filename: 'logo1.png',
      path: './public/logo1.png',
      cid: 'logo'
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email.');
  }
}