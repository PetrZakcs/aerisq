import { Rajdhani, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AerisQ | Physics-Based Radar Intelligence",
  description: "Physics, not Art. Deep learning analysis of Sentinel-1 SAR data without hallucinations.",
};

import HUDLayout from "@/components/HUDLayout";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.variable} ${jetbrainsMono.variable} ${inter.variable} antialiased bg-aeris-black text-gray-100 font-sans`}
      >
        <Providers>
          <HUDLayout>
            {children}
          </HUDLayout>
        </Providers>
      </body>
    </html>
  );
}
