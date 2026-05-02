"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" },
    );

    for (const id of itemIds ?? []) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      for (const id of itemIds ?? []) {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      }
    };
  }, [itemIds]);

  return activeId;
}

export function DocsTableOfContents({
  toc,
  variant = "list",
  className,
}: {
  toc: {
    title?: React.ReactNode;
    url: string;
    depth: number;
  }[];
  variant?: "dropdown" | "list";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc],
  );
  const activeHeading = useActiveItem(itemIds);

  if (!toc?.length) {
    return null;
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 md:h-7", className)}
          >
            On This Page
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="no-scrollbar max-h-[70svh]"
        >
          {toc.map((item) => (
            <DropdownMenuItem
              key={item.url}
              asChild
              onClick={() => {
                setOpen(false);
              }}
              data-depth={item.depth}
              className="data-[depth=3]:pl-6 data-[depth=4]:pl-8"
            >
              <a href={item.url}>{item.title}</a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "border-border/50 font-sans pl-1 text-[0.8125rem] leading-snug",
        className,
      )}
    >
      <p className="text-muted-foreground mb-3 px-2 text-[11px] font-semibold tracking-wide uppercase">
        On this page
      </p>
      <ul className="relative m-0 list-none space-y-0.5 border-l border-border/60 pl-0">
        {toc.map((item) => {
          const isActive = activeHeading && item.url === `#${activeHeading}`;
          const depth = item.depth;
          const indent =
            depth >= 4 ? "pl-7" : depth === 3 ? "pl-5" : "pl-3";

          return (
            <li key={item.url} className="relative">
              <a
                href={item.url}
                className={cn(
                  "-ml-px block cursor-pointer border-l-2 border-transparent py-1.5 pr-2 no-underline transition-colors duration-200",
                  indent,
                  "text-muted-foreground hover:text-foreground",
                  isActive &&
                    "border-primary text-foreground font-medium dark:border-primary",
                )}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
