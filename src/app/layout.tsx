import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Opening Starter",
  description: "Minimal Next.js chessboard starter with chess.js and react-chessboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
