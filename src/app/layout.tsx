import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header, Footer } from "@/components/layout/header-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GovEx — Evidence-Based Manifesto Tracker",
  description:
    "Track electoral manifesto promises through verifiable evidence chains. GovEx presents evidence, not political judgement.",
  keywords: ["manifesto", "promises", "evidence", "government", "tracking", "civic tech"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} scroll-smooth`} suppressHydrationWarning>
      <head>
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
