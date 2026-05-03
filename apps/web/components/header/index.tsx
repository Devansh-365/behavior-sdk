import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Links } from "@/components/header/links";

import { Search } from "@/components/header/search";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-fd-background/80 sticky inset-x-0 top-0 z-40 h-(--header-height) border-b backdrop-blur-sm transition-colors">
      <div className="container flex size-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-3">
          <Link
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-primary h-auto gap-2 px-2 py-1.5",
            )}
            href="/"
            aria-label="Home"
          >
            <BrandMark className="size-7" aria-hidden />
          </Link>
          <Links className="hidden gap-1 md:flex" />
        </nav>

        <div className="flex flex-auto justify-end items-center md:gap-2">
          <Search className="hidden md:flex" />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};
