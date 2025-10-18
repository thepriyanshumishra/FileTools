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
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { QuickActions } from "@/components/ui/quick-actions";
import { ProgressBar } from "@/components/ui/progress-bar";
// import { AnimatedBackground } from "@/components/ui/animated-background"; // Optional: Uncomment for particle animation
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FileTools - Free Online File Converter & Compressor | PDF, Image, Video Tools",
  description: "Convert, compress, and edit files instantly in your browser. 150+ free tools for PDF, images, videos, audio, and documents. No upload, 100% secure, works offline.",
  keywords: ["file converter", "pdf tools", "image compressor", "video converter", "online tools", "free converter", "pdf merge", "image resize", "compress pdf"],
  authors: [{ name: "FileTools" }],
  creator: "FileTools",
  publisher: "FileTools",
  manifest: "/manifest.json",
  metadataBase: new URL('https://filetools.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'FileTools - Free Online File Utilities',
    description: 'Convert, compress, and edit files instantly. 150+ free tools for PDF, images, videos, and more.',
    siteName: 'FileTools',
    images: [{
      url: '/icon-512.png',
      width: 512,
      height: 512,
      alt: 'FileTools Logo',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FileTools - Free Online File Utilities',
    description: 'Convert, compress, and edit files instantly. 150+ free tools.',
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'FileTools',
              description: 'Free online tools for converting, compressing, and managing files',
              url: 'https://filetools.vercel.app',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: 'PDF tools, Image converter, Video compressor, Audio editor, Document converter',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Is FileTools free to use?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, FileTools is 100% free. All tools are available without any cost, registration, or subscription.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Are my files secure?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely. All file processing happens in your browser. Files never leave your device, ensuring complete privacy and security.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What file formats are supported?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'FileTools supports 40+ file formats including PDF, JPG, PNG, MP4, MP3, DOCX, and many more. We offer 150+ tools for file conversion and processing.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do I need to install software?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No installation required. FileTools works entirely in your web browser. You can also install it as a Progressive Web App (PWA) for offline access.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-900 dark:text-zinc-100`}
      >
        <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none dark:opacity-[0.03]" />
        <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        {/* <AnimatedBackground /> */} {/* Optional: Uncomment for particle animation */}
        <Providers>
          <ProgressBar />
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
          <ScrollToTop />
          <QuickActions />
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
