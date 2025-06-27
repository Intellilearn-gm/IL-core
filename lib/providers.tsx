// lib/providers.tsx
'use client'

import { ThirdwebProvider } from "@thirdweb-dev/react";
import React, { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider activeChain="mumbai">
      {children}
    </ThirdwebProvider>
  );
}
