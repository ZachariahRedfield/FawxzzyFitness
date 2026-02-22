"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavType = "navigate" | "reload" | "back_forward" | "prerender" | "client-route-change" | "unknown";

function getNavigationType(): NavType {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return "unknown";
  }

  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return (entry?.type as NavType | undefined) ?? "unknown";
}

function shortUserAgent(userAgent: string): string {
  if (userAgent.length <= 120) {
    return userAgent;
  }

  return `${userAgent.slice(0, 117)}...`;
}

export function PwaDebugOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [href, setHref] = useState("");
  const [referrer, setReferrer] = useState("");
  const [standalone, setStandalone] = useState<boolean>(false);
  const [displayStandalone, setDisplayStandalone] = useState<boolean>(false);
  const [displayFullscreen, setDisplayFullscreen] = useState<boolean>(false);
  const [userAgent, setUserAgent] = useState("");
  const [navigationType, setNavigationType] = useState<NavType>("unknown");

  const enabled = useMemo(() => {
    if (process.env.NODE_ENV === "development") {
      return true;
    }

    return searchParams.get("pwaDebug") === "1";
  }, [searchParams]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const standaloneMedia = window.matchMedia("(display-mode: standalone)");
    const fullscreenMedia = window.matchMedia("(display-mode: fullscreen)");

    const update = () => {
      setHref(window.location.href);
      setReferrer(document.referrer || "(none)");
      setStandalone(Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
      setDisplayStandalone(standaloneMedia.matches);
      setDisplayFullscreen(fullscreenMedia.matches);
      setUserAgent(shortUserAgent(window.navigator.userAgent));
    };

    update();
    setNavigationType(getNavigationType());

    const handleMediaChange = () => update();

    standaloneMedia.addEventListener("change", handleMediaChange);
    fullscreenMedia.addEventListener("change", handleMediaChange);

    return () => {
      standaloneMedia.removeEventListener("change", handleMediaChange);
      fullscreenMedia.removeEventListener("change", handleMediaChange);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setHref(window.location.href);
    setNavigationType((previous) => (previous === "unknown" ? getNavigationType() : "client-route-change"));
  }, [enabled, pathname, searchParams]);

  if (!enabled) {
    return null;
  }

  return (
    // TODO: remove PWA debug overlay once standalone-navigation issue is fully diagnosed.
    <aside className="fixed left-2 right-2 top-2 z-[1000] rounded-md border border-amber-300/60 bg-black/90 p-2 text-[11px] text-amber-100 shadow-lg backdrop-blur">
      <p className="font-semibold text-amber-200">PWA Debug</p>
      <ul className="mt-1 space-y-0.5 break-all font-mono">
        <li>href: {href || "(loading)"}</li>
        <li>navigator.standalone: {String(standalone)}</li>
        <li>display-mode standalone: {String(displayStandalone)}</li>
        <li>display-mode fullscreen: {String(displayFullscreen)}</li>
        <li>navigation: {navigationType}</li>
        <li>referrer: {referrer}</li>
        <li>ua: {userAgent || "(loading)"}</li>
      </ul>
      <p className="mt-1 text-[10px] text-amber-300/90">
        Diagnostic note: Safari chrome usually appears after full-document navigations, out-of-scope URLs, absolute/cross-origin links, or target/new-window behavior.
      </p>
    </aside>
  );
}
