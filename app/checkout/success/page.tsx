"use client";

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <PageLayout>
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 overflow-hidden">
        <Card className="w-full max-w-md p-8 relative z-10">
          <CardHeader>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-500 w-16 h-16" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Order Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            {orderId && (
              <CardDescription className="text-md text-muted-foreground mt-2">
                Your Order ID is: <strong>{orderId}</strong>
              </CardDescription>
            )}
            <p className="text-lg text-muted-foreground mt-2">
              Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.
            </p>
            <Button asChild className="mt-8">
                <Link href="/shop">
                    Continue Shopping
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}