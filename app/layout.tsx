import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../src/styles/auth.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ETF 투자 도우미",
  description: "ETF 투자를 위한 AI 도우미",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
