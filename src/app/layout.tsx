import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '../providers/query-provider';
import AuthProvider from '../providers/auth-provider';
import { ThemeProvider } from '../providers/theme-provider';
import { GlobalChatWidget } from '../components/public/GlobalChatWidget';

export const metadata: Metadata = {
  title: 'DocuMind AI - AI Knowledge Intelligence Platform',
  description: 'Unlock and synthesize unstructured documents into interactive knowledge structures with Gemini AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-indigo-500/30 selection:text-white">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <GlobalChatWidget />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
