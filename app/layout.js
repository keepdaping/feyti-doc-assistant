import { DM_Serif_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'DocMind – AI Document Assistant',
  description: 'Upload any PDF or Word document and get an instant AI-powered analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
