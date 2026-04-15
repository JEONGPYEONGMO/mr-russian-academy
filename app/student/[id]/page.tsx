'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAcademyStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import StudentScheduleTab from '@/components/student/StudentScheduleTab';
import StudentContentTab from '@/components/student/StudentContentTab';
import StudentNoticesTab from '@/components/student/StudentNoticesTab';
import StudentMessagesTab from '@/components/student/StudentMessagesTab';

type Tab = 'schedule' | 'content' | 'notices';

export default function StudentDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { students, classes, enrollments, messages } = useAcademyStore();
  const { loggedInStudentId, studentLogout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('schedule');

  // 인증 확인 — 로그인된 학생 ID와 다르면 로그인 페이지로
  useEffect(() => {
    if (loggedInStudentId !== id) {
      router.replace('/student');
    }
  }, [loggedInStudentId, id, router]);

  const student = students.find((s) => s.id === id);
  if (!student || loggedInStudentId !== id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900">
        <div className="text-white/60 text-sm">인증 확인 중...</div>
      </div>
    );
  }

  const myEnrollments = enrollments.filter((e) => e.studentId === id && e.status === 'active');
  const myClasses = myEnrollments
    .map((e) => classes.find((c) => c.id === e.classId))
    .filter(Boolean) as typeof classes;

  const unreadCount = messages.filter((m) => m.studentId === id && !m.read).length;

  const TABS: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: 'schedule', label: '내 시간표', icon: '📅' },
    { key: 'content',  label: '수업 내용', icon: '📝' },
    { key: 'notices',  label: '공지·메시지', icon: '📢', badge: unreadCount },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 프로필 배너 */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-6 text-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <Link href="/student" className="text-blue-200 hover:text-white text-sm transition-colors">
            ‹ 학생 목록
          </Link>
          <button
            onClick={() => { studentLogout(); router.replace('/student'); }}
            className="text-blue-200 hover:text-white text-xs flex items-center gap-1 transition-colors"
          >
            🚪 로그아웃
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-extrabold shadow-inner">
            {student.name[0]}
          </div>
          <div>
            <div className="text-xl font-extrabold">{student.name}</div>
            <div className="text-blue-200 text-sm mt-0.5">{student.phone}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {myClasses.map((c) => (
                <span
                  key={c.id}
                  className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-slate-700"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-slate-200 px-4 shrink-0">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge && t.badge > 0 ? (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-auto bg-[#f0f4f8]">
        <div className="p-5 max-w-3xl mx-auto">
          {tab === 'schedule' && <StudentScheduleTab studentId={id} myClasses={myClasses} />}
          {tab === 'content'  && <StudentContentTab myClasses={myClasses} />}
          {tab === 'notices'  && (
            <>
              <StudentNoticesTab myClasses={myClasses} />
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">💬</span>
                  <h2 className="font-bold text-slate-700 text-sm">선생님 메시지</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{unreadCount} 새 메시지</span>
                  )}
                </div>
                <StudentMessagesTab studentId={id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
