import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FundMate AI — From Startup Idea to Funding Opportunity',
  description:
    'Discover Indian government funding schemes, check eligibility with AI-powered analysis grounded in official documents, and get a personalized application roadmap.',
  keywords: [
    'startup funding India',
    'government schemes',
    'eligibility checker',
    'Startup India',
    'DPIIT recognition',
    'SISFS',
    'MUDRA',
    'CGTMSE',
  ],
  openGraph: {
    title: 'FundMate AI — From Startup Idea to Funding Opportunity',
    description:
      'AI-powered eligibility analysis for Indian government funding schemes, grounded in official documents.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
