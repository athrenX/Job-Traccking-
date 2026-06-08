import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerCompass – Sistem Manajemen Lamaran Kerja & Magang",
  description: "Bantu mahasiswa, fresh graduate, dan pencari kerja mencatat, mengelola, dan memantau seluruh proses lamaran kerja atau magang dalam satu dashboard terpusat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
