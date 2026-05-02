import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { fonts } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "@/components/providers";
import type { ReactNode } from "react";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "behavior-sdk — Real-time human / bot / AI classification",
  description:
    "Browser-side behavioral analysis SDK. Classifies sessions as human, authorized AI agent, or unauthorized bot using behavioral, fingerprint, and network signals.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        data-slot="layout"
        className={cn(
          "group/layout bg-background relative z-10 [--footer-height:--spacing(14)] [--header-height:--spacing(14)]",
          fonts,
        )}
      >
        <Providers>
          <div className="flex min-h-svh flex-col">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
