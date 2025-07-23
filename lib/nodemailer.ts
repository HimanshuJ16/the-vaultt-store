import nodemailer from 'nodemailer';

const email = process.env.EMAIL;

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  },
});

export const mailOptions = {
  from: email,
  to: 'thevaulttstore@gmail.com', // This should be the admin's email address
};