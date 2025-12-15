import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Theme Gallery | Beautiful UI Color Palettes',
  description: 'Discover and use stunning UI themes and color palettes for your next project. Copy CSS variables with one click.',
  keywords: ['themes', 'color palettes', 'UI design', 'CSS variables', 'dark mode', 'design system'],
  openGraph: {
    title: 'Theme Gallery | Beautiful UI Color Palettes',
    description: 'Discover and use stunning UI themes and color palettes for your next project.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
