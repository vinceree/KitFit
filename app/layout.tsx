import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KitFit — Virtual Try-On for Cycling Brands",
  description:
    "Let your customers see themselves in your cycling kit. AI-powered virtual try-on widget for cycling brands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
