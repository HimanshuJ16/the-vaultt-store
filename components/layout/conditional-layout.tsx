"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function ConditionalLayout({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  const showLayout = !isAdminPage && !isAuthPage;

  return (
    <>
      {showLayout ? header : null}
      {children}
      {showLayout ? footer : null}
    </>
  );
}