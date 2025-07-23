import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
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
  title: "ACME Store",
  description: "ACME Store, your one-stop shop for all your needs.",
    generator: 'v0.dev'
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = getCart();
  await getUserId(); // This will create the user in the DB if they don't exist

  return (
    <ClerkProvider >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
          suppressHydrationWarning
        >
          <CartProvider cartPromise={cart}>
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