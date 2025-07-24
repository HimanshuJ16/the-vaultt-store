"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [code, setCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [showResend, setShowResend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setShowResend(true);
    }
    return () => clearInterval(interval);
  }, [emailSent, timer]);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/send-code', { method: 'POST' });
      if (res.ok) {
        setEmailSent(true);
        setTimer(300); // Reset timer
        setShowResend(false);
        toast.success("Verification code sent to your email.");
      } else {
        toast.error("Failed to send verification code.");
      }
    } catch (error) {
      console.error("Failed to send code:", error);
      toast.error("An error occurred while sending the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        toast.success("Login successful. Redirecting...");
        router.push('/admin');
      } else {
        toast.error("Invalid verification code.");
      }
    } catch (error) {
      console.error("Failed to verify code:", error);
      toast.error("An error occurred while verifying the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center">
          <Image
            src="/logo1.png"
            alt="Company Logo"
            width={200}
            height={50}
            className="mx-auto mb-4"
          />
          <CardTitle className='text-xl'>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                Click the button to send a verification code to your email.
              </p>
              <Button
                onClick={handleSendCode}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={handleVerifyCode}
                className="w-full"
                disabled={isLoading || code.length < 6}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
              <div className="text-center text-sm text-gray-500">
                {showResend ? (
                  <Button
                    variant="link"
                    onClick={handleSendCode}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                ) : (
                  <p>
                    Resend OTP in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}