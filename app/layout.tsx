import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { ConstellationBackground } from '@/components/constellation-background';
import { Footer } from '@/components/footer';
import { getPersonalInfo } from '@/lib/config';
import { Toaster } from '@/components/ui/toaster';
import { LoadingAnimation } from '@/components/loading-animation';
import { ScrollIndicator } from '@/components/scroll-indicator';

const inter = Inter({ subsets: ['latin'] });

const personalInfo = getPersonalInfo();

export const metadata: Metadata = {
  title: `${personalInfo.name} - ${personalInfo.title}`,
  description: personalInfo.bio,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings caused by browser extensions
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  if (
                    typeof args[0] === 'string' &&
                    (args[0].includes('Hydration') ||
                     args[0].includes('hydration') ||
                     args[0].includes('did not match'))
                  ) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingAnimation />
          <ConstellationBackground />
          <Navbar />
          <ScrollIndicator />
          <main className="min-h-screen" suppressHydrationWarning>{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}