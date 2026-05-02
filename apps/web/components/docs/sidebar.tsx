"use client";

import { getPagesFromFolder } from "@/lib/page-tree";
import type { Root } from "fumadocs-core/page-tree";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { PAGES_NEW } from "@/lib/docs";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

const EXCLUDED_SECTIONS = new Set<string>([]);
const EXCLUDED_PAGES = new Set<string>([]);

export function DocsSidebar({
  tree,
  ...props
}: ComponentProps<typeof Sidebar> & { tree: Root }) {
  const pathname = usePathname();
  const topLevelPages = tree.children.filter(
    (
      item,
    ): item is (typeof tree.children)[number] & { url: string; name: string } =>
      !EXCLUDED_SECTIONS.has(item.$id ?? "") &&
      item.type !== "folder" &&
      "url" in item &&
      !EXCLUDED_PAGES.has(item.url),
  );

  const navButtonClass =
    "font-sans h-auto min-h-9 w-full justify-start gap-2 rounded-lg border-0 px-2.5 py-2 text-[0.8125rem] leading-snug font-normal text-muted-foreground shadow-none transition-colors duration-200 " +
    "hover:bg-muted/60 hover:text-foreground " +
    "data-active:border-transparent data-active:bg-primary/10 data-active:font-medium data-active:text-foreground " +
    "dark:data-active:bg-primary/15 " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none";

  return (
    <Sidebar
      className="sticky top-(--header-height) z-30 hidden h-[calc(100svh-var(--header-height))] overscroll-none border-r border-border/50 bg-transparent px-3 lg:flex"
      collapsible="none"
      {...props}
    >
      <SidebarContent className="no-scrollbar relative min-w-[15rem] max-w-[17.5rem] flex-1 overflow-x-hidden pb-10 font-sans">
        {topLevelPages.length > 0 && (
          <SidebarGroup className="pt-5">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {topLevelPages.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.url === pathname}
                      className={navButtonClass}
                    >
                      <Link
                        href={item.url}
                        className="flex w-full cursor-pointer items-center gap-2"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {item.name}
                        </span>
                        {PAGES_NEW.includes(item.url) ? (
                          <span
                            className="bg-primary ms-auto shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium text-primary-foreground"
                            title="New"
                          >
                            New
                          </span>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {tree.children.map((item) => {
          if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
            return null;
          }

          if (item.type !== "folder") {
            return null;
          }

          return (
            <SidebarGroup key={item.$id} className="mt-6">
              <SidebarGroupLabel className="text-muted-foreground px-2 pb-2 text-[11px] font-semibold tracking-wide uppercase">
                {item.name}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {getPagesFromFolder(item).map((page) => {
                    if (EXCLUDED_PAGES.has(page.url)) {
                      return null;
                    }

                    return (
                      <SidebarMenuItem key={page.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={page.url === pathname}
                          className={navButtonClass}
                        >
                          <Link
                            href={page.url}
                            className="flex w-full cursor-pointer items-center gap-2"
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {page.name}
                            </span>
                            {PAGES_NEW.includes(page.url) ? (
                              <span
                                className="bg-primary ms-auto shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium text-primary-foreground"
                                title="New"
                              >
                                New
                              </span>
                            ) : null}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
        <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 shrink-0 bg-linear-to-t to-transparent" />
      </SidebarContent>
    </Sidebar>
  );
}
