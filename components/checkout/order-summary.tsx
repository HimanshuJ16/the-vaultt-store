"use client";
import { Cart } from "@/lib/sfcc/types";
import Image from "next/image";

export function OrderSummary({ cart }: { cart: Cart }) {
  return (
    <section
      aria-labelledby="summary-heading"
      className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
    >
      <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
        Order summary
      </h2>

      <dl className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600">Subtotal</dt>
          <dd className="text-sm font-medium text-gray-900">
            ${cart.cost.subtotalAmount.amount}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="flex items-center text-sm text-gray-600">
            <span>Shipping estimate</span>
          </dt>
          <dd className="text-sm font-medium text-gray-900">
            ${cart.cost.shippingAmount.amount}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="text-base font-medium text-gray-900">Order total</dt>
          <dd className="text-base font-medium text-gray-900">
            ${cart.cost.totalAmount.amount}
          </dd>
        </div>
      </dl>

      <ul role="list" className="mt-6 divide-y divide-gray-200 border-t border-gray-200">
        {cart.lines.map((item) => (
          <li key={item.id} className="flex py-6">
            <div className="flex-shrink-0">
              <Image
                src={item.merchandise.product.featuredImage}
                alt={item.merchandise.product.title}
                width={96}
                height={96}
                className="h-24 w-24 rounded-md object-cover object-center"
              />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <h3>
                    <a href={`/product/${item.merchandise.product.handle}`}>{item.merchandise.product.title}</a>
                  </h3>
                  <p className="ml-4">${item.totalAmount}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Size(EUR): {item.merchandise.selectedOptions.find(o => o.name.toLowerCase() === 'size')?.value}
                </p>
              </div>
              <div className="flex flex-1 items-end justify-between text-sm">
                <p className="text-gray-500">Qty {item.quantity}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
