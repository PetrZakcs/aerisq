import { Space_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhasQ — Radar Intelligence Platform",
  description: "Physics-based Synthetic Aperture Radar analysis. All-weather satellite intelligence for agriculture, defense, and infrastructure.",
};

import HUDLayout from "@/components/HUDLayout";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceMono.variable} ${inter.variable} antialiased`}
        style={{ background: '#000', color: '#fff' }}
      >
        <Providers>
          <HUDLayout>
            {children}
          </HUDLayout>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
