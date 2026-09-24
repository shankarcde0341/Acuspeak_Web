import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";

const outfit = localFont({
  src: "../fonts/Outfit.woff2",
  variable: "--font-outfit",
  display: "swap",
});

const manrope = localFont({
  src: "../fonts/Manrope.woff2",
  variable: "--font-manrope",
  display: "swap",
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
