import type { Metadata } from "next";
import localFont from "next/font/local";
import SessionProvider from "@/components/providers/SessionProvider";
import ChatAssistant from "@/components/ChatAssistant";
import CookieConsent from "@/components/CookieConsent";
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
  title: "Shipping Savior | International Logistics Platform",
  description:
    "Comprehensive logistics platform for international freight, cold chain, and import/export operations. Landed cost calculators, FTZ savings analysis, route comparison, and tariff optimization.",
  openGraph: {
    title: "Shipping Savior | International Logistics Platform",
    description:
      "Turn manual freight brokerage into data-driven operations. Calculators, route comparison, FTZ strategy, and more.",
    type: "website",
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Shipping Savior — AI-Powered Global Trade Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipping Savior | International Logistics Platform",
    description:
      "Turn manual freight brokerage into data-driven operations. Calculators, route comparison, FTZ strategy, and more.",
    images: ["/images/og-image.svg"],
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
        <ChatAssistant />
        <CookieConsent />
      </body>
    </html>
  );
}
