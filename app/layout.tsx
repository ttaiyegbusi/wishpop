import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WishPop — One list. Zero duplicate gifts.',
  description:
    'Create a wishlist, share one link, and let your friends quietly reserve gifts without spoiling the surprise.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wishpop.online'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
