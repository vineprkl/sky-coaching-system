import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sky 代练服务 - 客户数据反馈系统",
  description: "《光·遇》代练服务的专业客户数据反馈平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 min-h-screen relative overflow-x-hidden`}
      >
        {/* 星空背景 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/30 to-slate-900/40"></div>
          {/* 星星 */}
          <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-32 left-1/4 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute top-40 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-3000"></div>
          <div className="absolute top-60 left-1/2 w-1 h-1 bg-blue-100 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-80 right-1/4 w-0.5 h-0.5 bg-purple-100 rounded-full animate-pulse delay-1500"></div>
          <div className="absolute bottom-40 left-20 w-1 h-1 bg-white rounded-full animate-pulse delay-2500"></div>
          <div className="absolute bottom-60 right-16 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse delay-4000"></div>
          <div className="absolute bottom-80 left-1/3 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-3500"></div>
          <div className="absolute bottom-20 right-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-1000"></div>
          {/* 更多星星 */}
          <div className="absolute top-1/4 left-3/4 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute top-3/4 left-1/6 w-1 h-1 bg-blue-100 rounded-full animate-pulse delay-4500"></div>
          <div className="absolute top-1/2 right-1/6 w-0.5 h-0.5 bg-purple-100 rounded-full animate-pulse delay-1200"></div>
          <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse delay-3200"></div>
          <div className="absolute bottom-1/3 right-1/3 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse delay-800"></div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
