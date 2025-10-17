import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { BrowserWarning } from "@/components/ui/browser-warning";
import { MaintenanceMode } from "@/components/ui/maintenance-mode";
import { HistoryPanel } from "@/components/ui/history-panel";
import { ShortcutsModal } from "@/components/ui/shortcuts-modal";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { PWAInstall } from "@/components/pwa-install";
import { RateLimitWarning } from "@/components/ui/rate-limit-warning";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FileTools - Your Online File Utilities",
  description: "Free online tools for converting, compressing, and managing your files",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FileTools",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

// Note: Metadata is static, dynamic title/description would need middleware

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-900 dark:text-zinc-100`}
      >
        <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none dark:opacity-[0.03]" />
        <Providers>
          <MaintenanceMode />
          <Header />
          <BrowserWarning />
          <div className="min-h-screen">{children}</div>
          <Footer />

          <HistoryPanel />
          <SettingsPanel />
          <ShortcutsModal />
          <PWAInstall />
          <RateLimitWarning />
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
