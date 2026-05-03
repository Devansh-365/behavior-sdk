"use client"

import type { ReactElement } from "react"
import type {
  BehavioralSignals,
  FingerprintSignals,
  NetworkSignals,
} from "@devanshhq/nyasa"
import { LayoutGrid, Radar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignalsCard } from "./SignalsCard"
import { FingerprintCard } from "./FingerprintCard"
import { NetworkCard } from "./NetworkCard"

interface DemoTelemetryPanelProps {
  behavioral: BehavioralSignals | null
  fingerprint: FingerprintSignals | null
  network: NetworkSignals | null
}

export function DemoTelemetryPanel({
  behavioral,
  fingerprint,
  network,
}: DemoTelemetryPanelProps): ReactElement {
  return (
    <div className="border-border bg-card/80 overflow-hidden rounded-2xl border shadow-sm ring-1 ring-black/[0.04] backdrop-blur-[2px] dark:ring-white/[0.06]">
      <Tabs defaultValue="behavior" className="gap-0">
        <div className="border-border bg-muted/20 px-4 pt-4 pb-0 sm:px-5">
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0"
          >
            <TabsTrigger
              value="behavior"
              className="data-active:after:bg-primary gap-2 rounded-none px-0 pb-3 text-[13px] after:bottom-0"
            >
              <LayoutGrid className="size-3.5 opacity-70" aria-hidden />
              Behavior
            </TabsTrigger>
            <TabsTrigger
              value="environment"
              className="data-active:after:bg-primary ml-6 gap-2 rounded-none px-0 pb-3 text-[13px] after:bottom-0 sm:ml-8"
            >
              <Radar className="size-3.5 opacity-70" aria-hidden />
              Environment
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="behavior"
          className="mt-0 border-t border-border/80 px-0 pb-0 pt-0 outline-none"
        >
          <SignalsCard signals={behavioral} embedded />
        </TabsContent>
        <TabsContent
          value="environment"
          className="mt-0 space-y-0 border-t border-border/80 outline-none"
        >
          <FingerprintCard fingerprint={fingerprint} embedded />
          <NetworkCard network={network} embedded />
        </TabsContent>
      </Tabs>
    </div>
  )
}
