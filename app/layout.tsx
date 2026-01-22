import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import '@/app/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Asette Inventory',
    template: '%s | Asette Inventory',
  },
  description: 'Asette Inventory Management System',
  keywords: ['inventory', 'asette', 'ai'],
  authors: [{ name: 'Asette' }],
  creator: 'Asette Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Asette Inventory',
    title: 'Asette Inventory',
    description: 'Asette Inventory Management System',
    images: [
      {
        url: '/img/banner.png',
        alt: 'Asette Inventory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asette Inventory',
    description: 'Asette Inventory Management System',
    images: ['/img/banner.png'],
  },
  icons: {
    icon: '/img/logo.jpg',
    apple: '/img/logo.jpg',
    shortcut: '/img/logo.jpg',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
