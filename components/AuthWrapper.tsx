'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import AdminLoginPage from './AdminLoginPage';
import Sidebar from './Sidebar';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminLoggedIn = useAuthStore((s) => s.adminLoggedIn);

  // /student 또는 /student/* 경로는 학생 전용 (관리자 인증 불필요, 사이드바 없음)
  const isStudentRoute = pathname === '/student' || pathname.startsWith('/student/');

  if (isStudentRoute) {
    return <>{children}</>;
  }

  // 관리자 페이지 — 로그인 필요
  if (!adminLoggedIn) {
    return <AdminLoginPage />;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
