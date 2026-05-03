"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { MenuIcon, SearchIcon } from "lucide-react";

import { LINKS } from "@/components/header/links";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  className?: string;
};

export function MobileNav({ className }: MobileNavProps): ReactElement {
  const { setOpenSearch } = useSearchContext();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="extend-touch-target text-muted-foreground hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="size-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className={cn(
            "flex w-[min(100%,20rem)] flex-col gap-0 border-border border-l p-0 sm:max-w-sm",
            "bg-fd-background/95 text-foreground backdrop-blur-md supports-backdrop-filter:bg-fd-background/90",
            "font-sans text-sm shadow-2xl",
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Main navigation</SheetTitle>
          </SheetHeader>
          <nav
            className="flex flex-col gap-1 p-3 pt-14 font-sans"
            aria-label="Main"
          >
            {LINKS.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "extend-touch-target text-foreground h-auto min-h-11 w-full justify-start rounded-lg px-4 py-3 shadow-none transition-colors",
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
            <div className="border-border mt-2 border-t pt-2">
              <Button
                type="button"
                variant="secondary"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  "h-auto min-h-11 w-full shrink justify-start gap-2 rounded-lg px-4 py-3 font-normal",
                )}
                onClick={() => {
                  setOpen(false);
                  setOpenSearch(true);
                }}
              >
                <SearchIcon className="size-4 shrink-0" aria-hidden />
                Search
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
