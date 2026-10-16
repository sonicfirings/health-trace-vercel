import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Health Trace - Chog Guardian",
  description:
    "A private Chog Guardian where verified healthy actions evolve your Chog NFT on Monad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
