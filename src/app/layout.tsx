import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { HistoryPanel } from "@/components/ui/history-panel";
import { ShortcutsModal } from "@/components/ui/shortcuts-modal";
import { SettingsPanel } from "@/components/ui/settings-panel";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FileTools - Your Online File Utilities",
  description:
    "Free online tools for converting, compressing, and managing your files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-900 dark:text-zinc-100`}
      >
        <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none dark:opacity-[0.03]" />
        <Providers>
          <Header />
          <div className="min-h-screen">{children}</div>
          <Footer />

          <HistoryPanel />
          <SettingsPanel />
          <ShortcutsModal />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
