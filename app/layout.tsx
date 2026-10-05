import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import{Plus_Jakarta_Sans} from "next/font/google"
import "./globals.css";
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restaurant Management System",
  description: "Restaurant Management System",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${jakarta.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
