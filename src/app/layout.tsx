import "./globals.css";
import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";


const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Acuspeak — Speak English with confidence",
  description: "Acuspeak is an English speaking practice app with live voice rooms, structured lessons, and speaking tests built for real-world fluency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${manrope.variable} ${outfit.variable} font-sans bg-[#F5F8FF] text-[#0F172A] antialiased`}>
        {children}
      </body>
    </html>
  );
}