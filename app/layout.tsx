import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'MeetLah! - Simplify Plans with Friends',
    template: '%s | MeetLah!',
  },
  description: 'Track availability, maintain monthly streaks, and ensure punctuality with your friend group. Create shared calendars and never miss a meetup!',
  applicationName: 'MeetLah!',
  keywords: ['calendar', 'meetup', 'friends', 'schedule', 'availability', 'streak', 'punctuality'],
  authors: [{ name: 'MeetLah! Team' }],
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.svg',
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MeetLah!',
    title: 'MeetLah! - Simplify Plans with Friends',
    description: 'Track availability, maintain monthly streaks, and ensure punctuality with your friend group',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
