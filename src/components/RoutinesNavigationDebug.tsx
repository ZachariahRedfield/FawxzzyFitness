"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

function debugRoutinesNav(source: string, href?: string) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // Standalone diagnostics: Safari chrome can appear when navigation leaves Next client routing or opens a new browsing context.
  console.log("[PWA routines nav]", {
    source,
    href: href ?? null,
    currentHref: window.location.href,
    navigationType: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type ?? "unknown",
  });
}

type DebugLinkProps = PropsWithChildren<{
  href: string;
  source: string;
  className: string;
}>;

export function RoutinesDebugLink({ href, source, className, children }: DebugLinkProps) {
  return (
    <Link href={href} className={className} onClick={() => debugRoutinesNav(source, href)}>
      {children}
    </Link>
  );
}

type DebugSubmitButtonProps = ComponentPropsWithoutRef<"button"> & {
  source: string;
};

export function RoutinesDebugSubmitButton({ source, onClick, ...props }: DebugSubmitButtonProps) {
  return (
    <button
      {...props}
      onClick={(event) => {
        debugRoutinesNav(source);
        onClick?.(event);
      }}
    />
  );
}
