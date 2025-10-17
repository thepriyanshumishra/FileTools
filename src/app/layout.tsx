import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
        className={`${inter.className} min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased`}
      >
        <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <Providers>
          <main className="container mx-auto px-4 py-8">{children}</main>
          <ThemeToggle className="fixed bottom-8 right-8" />
        </Providers>
      </body>
    </html>
  );
}
