"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ enabled: false }}>
      <ThemeProvider
        attribute="class"
        enableSystem
        disableTransitionOnChange
        scriptProps={
          typeof window === "undefined"
            ? undefined
            : ({ type: "application/json" } as const)
        }
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </RootProvider>
  );
}
