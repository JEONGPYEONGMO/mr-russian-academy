import type { Metadata } from 'next';
import './globals.css';
import AuthWrapper from '@/components/AuthWrapper';
import FirebaseProvider from '@/components/FirebaseProvider';

export const metadata: Metadata = {
  title: 'MR Russian 어학원',
  description: 'MR Russian 어학원 통합 관리 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full overflow-hidden bg-[#f0f4f8]">
        <FirebaseProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </FirebaseProvider>
      </body>
    </html>
  );
}
