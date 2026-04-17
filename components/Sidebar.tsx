'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

interface SidebarProps {
  onClose?: () => void;
}

const navGroups = [
  {
    label: '관리자',
    items: [
      { href: '/', label: '시간표', icon: '📅' },
      { href: '/students', label: '학생 관리', icon: '👥' },
      { href: '/classes', label: '수업 관리', icon: '📚' },
      { href: '/notices', label: '공지사항', icon: '📢' },
    ],
  },
  {
    label: '데이터',
    items: [
      { href: '/import', label: '엑셀 가져오기', icon: '📊' },
    ],
  },
  {
    label: '학생 포털',
    items: [
      { href: '/student', label: '학생 페이지', icon: '🎓' },
    ],
  },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const adminLogout = useAuthStore((s) => s.adminLogout);

  return (
    <aside className="w-52 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm">
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-base font-extrabold text-blue-700 leading-tight tracking-tight">MR Russian</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">어학원 관리 시스템</div>
        </div>
        {/* 모바일에서만 닫기 버튼 표시 */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-3 px-2.5 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 하단 */}
      <div className="px-4 py-4 border-t border-slate-100 bg-slate-50 space-y-2">
        <div className="px-1">
          <div className="text-xs font-semibold text-slate-700">임미란 선생님</div>
          <div className="text-[11px] text-slate-400">관리자</div>
        </div>
        <button
          onClick={() => adminLogout()}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span> 로그아웃
        </button>
      </div>
    </aside>
  );
}
