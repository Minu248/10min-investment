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
  title: "10분 재테크 | 매일 아침 9시 10분 경제 팟캐스트",
  description: "가장 최신 재테크 소식을 핵심만 요약하여 전달드려요.",
  keywords: ["재테크", "경제", "팟캐스트", "투자", "금융", "10분"],
  authors: [{ name: "10분 재테크" }],
  creator: "10분 재테크",
  publisher: "10분 재테크",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://10min-investment.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "10분 재테크 | 매일 아침 9시 10분 경제 팟캐스트",
    description: "가장 최신 재테크 소식을 핵심만 요약하여 전달드려요.",
    url: 'https://10min-investment.vercel.app',
    siteName: '10분 재테크',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '10분 재테크 - 매일 아침 9시 10분 경제 팟캐스트',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "10분 재테크 | 매일 아침 9시 10분 경제 팟캐스트",
    description: "가장 최신 재테크 소식을 핵심만 요약하여 전달드려요.",
    images: ['/og-image.jpg'],
    creator: '@10min_investment',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
