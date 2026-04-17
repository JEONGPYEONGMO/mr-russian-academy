'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import AdminLoginPage from './AdminLoginPage';
import Sidebar from './Sidebar';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminLoggedIn = useAuthStore((s) => s.adminLoggedIn);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isStudentRoute = pathname === '/student' || pathname.startsWith('/student/');

  if (isStudentRoute) return <>{children}</>;
  if (!adminLoggedIn) return <AdminLoginPage />;

  return (
    <div className="flex h-full">
      {/* 데스크탑 사이드바 (lg 이상에서만 표시) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* 모바일 사이드바 드로어 */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* 메인 영역 */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* 모바일 상단 바 */}
        <div className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 font-extrabold text-blue-700 tracking-tight">MR Russian</span>
          <span className="ml-1.5 text-xs text-slate-400 font-medium">어학원 관리</span>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
