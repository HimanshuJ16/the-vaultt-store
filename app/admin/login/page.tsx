"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [code, setCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    const res = await fetch('/api/admin/send-code', { method: 'POST' });
    if (res.ok) {
      setEmailSent(true);
      alert('Verification code sent to your email.');
    } else {
      alert('Failed to send verification code.');
    }
  };

  const handleVerifyCode = async () => {
    const res = await fetch('/api/admin/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push('/admin'); // Redirect to admin dashboard on success
    } else {
      alert('Invalid verification code.');
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>
      {!emailSent ? (
        <button onClick={handleSendCode}>Send Verification Code</button>
      ) : (
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <button onClick={handleVerifyCode}>Verify</button>
        </div>
      )}
    </div>
  );
}