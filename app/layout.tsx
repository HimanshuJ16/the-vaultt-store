import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
// The getCart function is now directly awaited
import { getCart, getUserId } from "@/lib/sfcc";
import { CartProvider } from "@/components/cart/cart-context";
import { DebugGrid } from "@/components/debug-grid";
import { isDevelopment } from "@/lib/constants";
import { ClerkProvider } from '@clerk/nextjs';
import { HeaderWithData } from "@/components/layout/header/server-wrapper";
import { Footer } from "@/components/layout/footer";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Vaultt Store",
  description: "The Vaultt Store, your one-stop shop for all your needs.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CORRECT: Await the promise to get the cart data directly.
  const cart = await getCart(); 
  // Ensure user is created in the DB if they exist in Clerk
  await getUserId();

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
          suppressHydrationWarning
        >
          {/* Provide the resolved cart data, not the promise */}
          <CartProvider serverCart={cart}>
            <NuqsAdapter>
              <ConditionalLayout
                header={<HeaderWithData />}
                footer={<Footer />}
              >
                {children}
              </ConditionalLayout>
              <Toaster closeButton position="bottom-right" />
              {isDevelopment && <DebugGrid />}
            </NuqsAdapter>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}