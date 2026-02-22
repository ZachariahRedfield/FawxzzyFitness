import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { GlassEffectsBootstrap } from "@/components/ui/GlassEffectsBootstrap";
import { PwaDebugOverlay } from "@/components/PwaDebugOverlay";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minimalist Gym Progression Engine",
  description: "Foundation app for logging gym sessions.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fawxzzy Fitness",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Fawxzzy Fitness",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative overflow-x-hidden">
        <ToastProvider>
          <Suspense fallback={null}>
            <PwaDebugOverlay />
          </Suspense>
          <GlassEffectsBootstrap />
          <AnimatedBackground />
          <main className="relative z-10 mx-auto min-h-screen w-full max-w-md px-4 py-6">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
