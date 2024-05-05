import type { Metadata } from "next";
import NavBar from "@/components/views/NavBar";
import "./globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";

export const inter = Inter({ subsets: ["latin-ext"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ShortLi",
  description: "The Free Link Shortener",
  icons: "/icons/favicon.svg",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <AuthProvider>
          <div className="mx-auto flex min-h-screen max-w-[2560px] flex-col">
            <NavBar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
