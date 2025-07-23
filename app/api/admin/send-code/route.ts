import { transporter, mailOptions } from '@/lib/nodemailer';
import { NextResponse } from 'next/server';

// In-memory store for the verification code.
// In production, use a more persistent and secure store like a database or Redis.
let verificationCode = '';

export async function POST() {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCode = code; // Store the code

    await transporter.sendMail({
      ...mailOptions,
      subject: 'Your Admin Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<h1>Admin Verification</h1><p>Your verification code is: <strong>${code}</strong></p>`,
    });

    const response = NextResponse.json({ success: true })

    response.cookies.set('verification-code', code, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5,
        path: '/',
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}