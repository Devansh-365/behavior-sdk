import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Installer } from "@/components/installer";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      id="hero"
      className="flex w-full flex-col items-center justify-center gap-6 py-16 text-pretty md:py-24 lg:py-32"
    >
      <h1 className="mx-auto max-w-none text-center text-4xl font-semibold tracking-[-0.06em]! sm:max-w-4xl sm:text-5xl md:max-w-5xl md:text-6xl xl:max-w-6xl xl:text-7xl">
        Classify humans, bots, and AI agents
      </h1>

      <p className="text-muted-foreground mx-auto max-w-none text-center text-base sm:max-w-3xl sm:text-lg md:max-w-4xl lg:text-xl xl:text-2xl">
        Captures behavioral, fingerprint, and network signals on the client, runs
        lightweight detection, and sends a scored payload to your API. Integrate
        with one{" "}
        <code className="text-foreground bg-muted/80 rounded-md px-1.5 py-0.5 text-[0.9em] font-medium">
          collect()
        </code>{" "}
        call.
      </p>

      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-center gap-3">
        <Installer
          command="npm install behavior-sdk"
          className="w-60 text-xs md:w-72"
        />
        <Button
          variant="outline"
          size="lg"
          className="h-9 shrink-0 gap-1.5 rounded-lg font-medium md:h-10"
          asChild
        >
          <Link href="/demo">
            View demo
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
