import type { Metadata } from "next";
import Script from "next/script";
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
      <body className="font-sans antialiased">
        {children}
        <Script src="/widget/kitfit.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
