import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@bryntum/schedulerpro/schedulerpro.css";
import "@bryntum/schedulerpro/stockholm-light.css";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CAIRE Work Sample",
  description: "Timefold + Bryntum prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} ${geistMono.className}`}>{children}</body>
    </html>
  );
}
