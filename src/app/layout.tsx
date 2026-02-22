import type { Metadata, Viewport } from "next";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fawxzzy Fitness",
  description: "Log workouts and track your progression.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Fawxzzy Fitness",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
};


export const viewport: Viewport = {
  themeColor: "#111827",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="relative overflow-x-hidden">
        <AnimatedBackground />
        <main className="relative z-10 mx-auto min-h-screen w-full max-w-md px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
