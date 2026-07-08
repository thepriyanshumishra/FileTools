"use client";

import { usePathname } from "next/navigation";
import React from "react";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/tools/studio/")) {
    return null;
  }

  return <>{children}</>;
}
