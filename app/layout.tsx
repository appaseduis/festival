import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Festival del Egresado UIS V2",
  description: "Inscripción y control del Festival del Egresado UIS V2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`h-full antialiased ${poppins.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-[#F4F6F9]">{children}</body>
    </html>
  );
}