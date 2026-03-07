import type { Metadata } from "next";
import { Poppins, Lora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

const fontSerif = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-mono",
});

import meta from "@/config/meta";

export const metadata: Metadata = {
  metadataBase: new URL(meta.url),
  title: {
    template: "%s | DB Studio",
    default: "DB Studio | " + meta.description,
  },
  description: meta.description,
  authors: [{ name: meta.author, url: meta.repoUrl }],
  creator: meta.author,
  keywords: ["Next.js", "RBAC", "Dashboard", "Auth", "Better Auth", "Admin Template"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "DB Studio",
    description: meta.description,
    url: meta.url,
    siteName: "DB Studio",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DB Studio",
    description: meta.description,
    images: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
