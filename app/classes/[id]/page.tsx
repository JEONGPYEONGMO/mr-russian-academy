'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAcademyStore } from '@/lib/store';
import ClassFormModal from '@/components/ClassFormModal';
import ClassStudentsAttendanceTab from '@/components/ClassStudentsAttendanceTab';
import ClassContentTab from '@/components/ClassContentTab';
import ClassNoticesTab from '@/components/ClassNoticesTab';

type Tab = 'members' | 'content' | 'notices';

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { classes, instructors, enrollments } = useAcademyStore();
  const [tab, setTab] = useState<Tab>('members');
  const [showEdit, setShowEdit] = useState(false);

  const cls = classes.find((c) => c.id === id);
  if (!cls) {
    return (
      <div className="p-8 text-slate-500">
        수업을 찾을 수 없습니다.{' '}
        <Link href="/" className="text-blue-600 underline">시간표로 돌아가기</Link>
      </div>
    );
  }

  const instr = instructors.find((i) => i.id === cls.instructorId);
  const activeEnrollments = enrollments.filter((e) => e.classId === id && e.status === 'active');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'members',  label: '학생·출석', icon: '👥' },
    { key: 'content',  label: '수업 내용', icon: '📝' },
    { key: 'notices',  label: '공지사항',  icon: '📢' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 sm:mb-3 flex-wrap">
          <Link href="/" className="hover:text-blue-600">시간표</Link>
          <span>/</span>
          <Link href="/classes" className="hover:text-blue-600">수업 관리</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{cls.name}</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-xl font-extrabold text-slate-700 shadow-sm shrink-0"
              style={{ backgroundColor: cls.color }}
            >
              {cls.level[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-800 tracking-tight truncate">{cls.name}</h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-slate-500 mt-0.5">
                <span>{instr?.name}</span>
                <span className="text-slate-300">|</span>
                <span>{cls.days.join(', ')}요일&nbsp;{cls.startTime}–{cls.endTime}</span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="hidden sm:inline font-semibold text-slate-700">{activeEnrollments.length}<span className="font-normal text-slate-400">/{cls.maxStudents}명</span></span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="hidden sm:inline text-blue-600 font-semibold">{cls.fee.toLocaleString()}원</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shrink-0"
          >
            수업 수정
          </button>
        </div>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-slate-200 px-2 sm:px-6 shrink-0">
        <div className="flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {tab === 'members'  && <ClassStudentsAttendanceTab classId={id} />}
        {tab === 'content'  && <ClassContentTab classId={id} />}
        {tab === 'notices'  && <ClassNoticesTab classId={id} />}
      </div>

      {showEdit && <ClassFormModal initial={cls} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
