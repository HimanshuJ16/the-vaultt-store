import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const cookieStore = await cookies(); // Call the cookies function and wait for the promise to resolve
  let verificationCode = cookieStore.get('verification-code')?.value;
  try {
    const { code } = await req.json();

    if (code === verificationCode) {
      // Code is correct. Reset the code and set a cookie.
      verificationCode = ''; // Invalidate the code after use

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin-authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 day
        path: '/',
      });

      response.cookies.delete('verification-code');
      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 });
  }
}