import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEEMULAND — Your little social world",
  description:
    "Explore, meet friends and create your own stories in Meemuland."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}