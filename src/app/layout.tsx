import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import "./globals.css";
import { Inter } from "next/font/google";

export const inter = Inter({ subsets: ["latin-ext"] });

export const metadata: Metadata = {
  title: "ShortLi",
  description: "The Free Link Shortener",
  icons: "/favicon.svg",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <div className='max-w-[2560px] mx-auto'>
          <NavBar />
          {children}
        </div>
      </body>
    </html>
  );
}
