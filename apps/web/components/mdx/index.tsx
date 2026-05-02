import * as React from "react";

import { cn, getHeadingId } from "@/lib/utils";
import { Callout } from "@/components/mdx/callout";
import { CodeBlockCommand } from "@/components/mdx/code-block";
import { CodeCollapsibleWrapper } from "@/components/mdx/code-collapsible-wrapper";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { FileIcon } from "lucide-react";
import type { MDXComponents } from "mdx/types";

function normalizeHeadingText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function plainTextFromChildren(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(plainTextFromChildren).join("");
  }
  if (React.isValidElement(node)) {
    const ch = node.props as { children?: React.ReactNode };
    return plainTextFromChildren(ch.children);
  }
  return "";
}

function MdxH1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "font-heading mt-2 scroll-m-28 text-3xl font-bold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function getIconForLanguageExtension(language: string) {
  switch (language) {
    case "json":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 0 0 3.146-.863 12.404 12.404 0 0 0 3.793-2.542 11.977 11.977 0 0 0 2.44-3.427 11.794 11.794 0 0 0 1.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 0 0-.793-2.788 11.197 11.197 0 0 0-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 0 0-2.172-.87h-.005c.119.063.24.132.345.201.12.074.239.146.351.225a8.93 8.93 0 0 1 1.559 1.33c1.063 1.145 1.797 2.548 2.218 4.041.284.982.434 1.998.495 3.017.044.743.044 1.491-.047 2.229-.149 1.27-.554 2.51-1.228 3.596a7.475 7.475 0 0 1-1.903 2.084c-1.244.928-2.877 1.482-4.436 1.114a3.916 3.916 0 0 1-.748-.258 4.692 4.692 0 0 1-.779-.45 6.08 6.08 0 0 1-1.244-1.105 6.507 6.507 0 0 1-1.049-1.747 7.366 7.366 0 0 1-.494-2.54c-.03-1.273.225-2.553.854-3.67a6.43 6.43 0 0 1 1.663-1.918c.225-.178.464-.333.704-.479l.016-.007a5.121 5.121 0 0 0-1.441-.12 4.963 4.963 0 0 0-1.228.24c-.359.12-.704.27-1.019.45a6.146 6.146 0 0 0-.733.494c-.211.18-.42.36-.615.555-1.123 1.153-1.768 2.682-2.022 4.256-.15.973-.15 1.96-.091 2.95.105 1.395.391 2.787.945 4.062a8.518 8.518 0 0 0 1.348 2.173 8.14 8.14 0 0 0 3.132 2.23 7.934 7.934 0 0 0 2.113.54c.074.015.149.015.209.015zm-2.934-.398a4.102 4.102 0 0 1-.45-.228 8.5 8.5 0 0 1-2.038-1.534c-1.094-1.137-1.827-2.566-2.247-4.08a15.184 15.184 0 0 1-.495-3.172 12.14 12.14 0 0 1 .046-2.082c.135-1.257.495-2.501 1.124-3.58a6.889 6.889 0 0 1 1.783-2.053 6.23 6.23 0 0 1 1.633-.9 5.363 5.363 0 0 1 3.522-.045c.029 0 .029 0 .045.03.015.015.045.015.06.03.045.016.104.045.165.074.239.12.479.271.704.42a6.294 6.294 0 0 1 2.097 2.502c.42.914.615 1.934.631 2.938.014 1.079-.18 2.157-.645 3.146a6.42 6.42 0 0 1-2.638 2.832c.09.03.18.045.271.075.225.044.449.074.688.074 1.468.045 2.892-.66 3.94-1.647.195-.18.375-.375.54-.585.225-.27.435-.54.614-.823.239-.375.435-.75.614-1.154a8.112 8.112 0 0 0 .509-1.664c.196-1.004.211-2.022.149-3.026-.135-2.022-.673-4.045-1.842-5.724a9.054 9.054 0 0 0-.555-.719 9.868 9.868 0 0 0-1.063-1.034 8.477 8.477 0 0 0-1.363-.915 9.927 9.927 0 0 0-1.692-.598l-.3-.06c-.209-.03-.42-.044-.634-.06a8.453 8.453 0 0 0-1.015.016c-.704.045-1.412.16-2.112.337C5.799 1.227 2.863 3.566 1.3 6.67A11.834 11.834 0 0 0 .238 9.801a11.81 11.81 0 0 0-.104 3.775c.12 1.02.374 2.023.778 2.977.227.57.511 1.124.825 1.648 1.094 1.783 2.683 3.236 4.51 4.24.688.39 1.408.69 2.157.944.226.074.45.15.689.21z"
          />
        </svg>
      );
    case "css":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="fill-foreground"
        >
          <path d="M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63" />
        </svg>
      );
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "typescript":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="fill-foreground"
        >
          <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
        </svg>
      );

    default:
      return <FileIcon />;
  }
}

export const mdxComponents: MDXComponents = {
  h1: MdxH1,
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => {
    return (
      <h2
        id={props.id ?? getHeadingId(props.children)}
        className={cn(
          "[&+]*:[code]:text-xl font-heading mt-10 scroll-m-28 text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+.steps]:mt-0! [&+.steps>h3]:mt-4! [&+h3]:mt-6! [&+p]:mt-4!",
          className,
        )}
        {...props}
      />
    );
  },
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4
      className={cn(
        "font-heading mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: React.ComponentProps<"h5">) => (
    <h5
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: React.ComponentProps<"h6">) => (
    <h6
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.ComponentProps<"a">) => (
    <a
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
      className={cn("leading-relaxed [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-medium", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  ),
  img: ({ className, alt, ...props }: React.ComponentProps<"img">) => (
    <img className={cn("rounded-md", className)} alt={alt} {...props} />
  ),
  hr: ({ ...props }: React.ComponentProps<"hr">) => (
    <hr className="my-4 md:my-8" {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="no-scrollbar my-6 w-full overflow-y-auto rounded-xl border">
      <table
        className={cn(
          "relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0",
          className,
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr className={cn("m-0 border-b", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn(
        "px-4 py-2 text-left whitespace-nowrap [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => (
    <CodeBlock {...props}>
      <Pre>{children}</Pre>
    </CodeBlock>
  ),
  figure: ({ className, ...props }: React.ComponentProps<"figure">) => {
    return <figure className={cn(className)} {...props} />;
  },
  figcaption: ({
    className,
    children,
    ...props
  }: React.ComponentProps<"figcaption">) => {
    const iconExtension =
      "data-language" in props && typeof props["data-language"] === "string"
        ? getIconForLanguageExtension(props["data-language"])
        : null;

    return (
      <figcaption
        className={cn(
          "text-code-foreground [&_svg]:text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70",
          className,
        )}
        {...props}
      >
        {iconExtension}
        {children}
      </figcaption>
    );
  },
  code: ({
    className,
    __raw__,
    __src__,
    __npm__,
    __yarn__,
    __pnpm__,
    __bun__,
    ...props
  }: React.ComponentProps<"code"> & {
    __raw__?: string;
    __src__?: string;
    __npm__?: string;
    __yarn__?: string;
    __pnpm__?: string;
    __bun__?: string;
  }) => {
    // Inline Code.
    if (typeof props.children === "string") {
      return (
        <code
          className={cn(
            "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none",
            className,
          )}
          {...props}
        />
      );
    }

    // npm command.
    const isNpmCommand = __npm__ && __yarn__ && __pnpm__ && __bun__;
    if (isNpmCommand) {
      return (
        <CodeBlockCommand
          __npm__={__npm__}
          __yarn__={__yarn__}
          __pnpm__={__pnpm__}
          __bun__={__bun__}
        />
      );
    }

    // Fenced block: CodeBlock (pre) provides copy + chrome; keep shiki <code> only.
    return <code {...props} />;
  },
  Step: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "font-heading mt-8 scroll-m-32 text-lg font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  Steps: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
      className={cn(
        "steps [&>h3]:step mb-12 [counter-reset:step] md:ml-4 md:border-l md:pl-8",
        className,
      )}
      {...props}
    />
  ),
  Image: ({
    src,
    className,
    width,
    height,
    alt,
    ...props
  }: React.ComponentProps<"img">) => (
    <img
      className={cn("mt-6 rounded-md border", className)}
      src={src || ""}
      width={Number(width)}
      height={Number(height)}
      alt={alt || ""}
      {...props}
    />
  ),
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => {
    return (
      <Tabs className={cn("relative mt-6 w-full", className)} {...props} />
    );
  },
  TabsList: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsList>) => (
    <TabsList
      className={cn(
        "justify-start gap-4 rounded-none bg-transparent px-0",
        className,
      )}
      {...props}
    />
  ),
  TabsTrigger: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsTrigger>) => (
    <TabsTrigger
      className={cn(
        "text-muted-foreground hover:text-primary data-active:border-primary data-active:text-foreground dark:data-active:border-primary rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base data-active:bg-transparent data-active:shadow-none! dark:data-active:bg-transparent",
        className,
      )}
      {...props}
    />
  ),
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent
      className={cn(
        "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0 [&>.steps]:mt-6",
        className,
      )}
      {...props}
    />
  ),
  Tab: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={cn(className)} {...props} />
  ),
  Button,
  Callout,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  AspectRatio,
  CodeCollapsibleWrapper,
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "bg-surface text-surface-foreground hover:bg-surface/80 flex w-full flex-col items-center rounded-xl p-6 transition-colors sm:p-10",
        className,
      )}
      {...props}
    />
  ),
  Kbd,
};

/**
 * Builds on top of your `mdxComponents`: every mapping stays the same except the
 * first in-body `# ...` is omitted when it matches `pageTitle` (layout already shows that h1).
 */
export function withSuppressedDuplicateDocTitle(
  components: MDXComponents,
  pageTitle: string,
): MDXComponents {
  let isFirstH1 = true;
  const baseH1 = components.h1 ?? MdxH1;

  return {
    ...components,
    h1: (props: React.ComponentProps<"h1">) => {
      if (isFirstH1) {
        isFirstH1 = false;
        const body = normalizeHeadingText(
          plainTextFromChildren(props.children),
        );
        const title = normalizeHeadingText(pageTitle);
        if (body === title) {
          return null;
        }
      }
      if (typeof baseH1 === "string") {
        return React.createElement(baseH1, props);
      }
      return React.createElement(baseH1 as React.ElementType, props);
    },
  };
}
