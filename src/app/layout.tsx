import type { Metadata } from "next";
import localFont from "next/font/local";
import SessionProvider from "@/components/providers/SessionProvider";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import ChatAssistant from "@/components/ChatAssistant";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shipping-savior.vercel.app"),
  title: "Shipping Savior | International Logistics Platform",
  description:
    "Comprehensive logistics platform for international freight, cold chain, and import/export operations. Landed cost calculators, FTZ savings analysis, route comparison, and tariff optimization.",
  openGraph: {
    title: "Shipping Savior | International Logistics Platform",
    description:
      "Turn manual freight brokerage into data-driven operations. Calculators, route comparison, FTZ strategy, and more.",
    type: "website",
    siteName: "Shipping Savior",
    url: "https://shipping-savior.vercel.app",
    // OG image is auto-generated from src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipping Savior | International Logistics Platform",
    description:
      "Turn manual freight brokerage into data-driven operations. Calculators, route comparison, FTZ strategy, and more.",
    // Twitter image is auto-generated from src/app/twitter-image.tsx
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-white text-navy-900`}
      >
        <SessionProvider>{children}</SessionProvider>
        <AnalyticsProvider />
        <ChatAssistant />
      </body>
    </html>
  );
}
