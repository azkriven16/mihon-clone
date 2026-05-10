import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "@/components/layout/Providers";
import { ServiceWorkerRegistrar } from "@/components/layout/ServiceWorkerRegistrar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Mihon Web – Manga Reader",
  description: "Free and open source manga reader. Read manga online with a beautiful, fast experience.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mihon",
  },
  openGraph: {
    title: "Mihon Web – Manga Reader",
    description: "Read manga online, free.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg)" }}>
        <Providers>
          <ServiceWorkerRegistrar />
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
