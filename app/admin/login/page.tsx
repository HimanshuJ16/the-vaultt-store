"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Import toast from sonner

export default function AdminLoginPage() {
  const [code, setCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/send-code', { method: 'POST' });
      if (res.ok) {
        setEmailSent(true);
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
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full"
              />
              <Button
                onClick={handleVerifyCode}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}