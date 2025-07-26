import { getCart } from "@/lib/sfcc";
import { PageLayout } from "@/components/layout/page-layout";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function CheckoutPage() {
 const cart = await getCart();
 const user = await currentUser();

  if (!cart || cart.lines.length === 0) {
    return notFound();
  }

  const userData = user ? {
    email: user.emailAddresses[0]?.emailAddress ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? ''
  } : null;

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-4 py-28 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Checkout
        </h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section className="lg:col-span-7">
            <CheckoutForm user={userData} cart={cart} />
          </section>
          <OrderSummary cart={cart} />
        </div>
      </div>
    </PageLayout>
  );
}
