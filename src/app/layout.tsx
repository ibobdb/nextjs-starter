import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import './globals.css';

const fontSans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: 'Dashify',
  description: 'Modern dashboard for all your needs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`} >
        {children}
      </body>
    </html>
  );
}
