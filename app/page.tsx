'use client';

import { useState } from 'react';
import Timetable from '@/components/Timetable';
import ClassFormModal from '@/components/ClassFormModal';
import { useAcademyStore } from '@/lib/store';

export default function HomePage() {
  const [showAdd, setShowAdd] = useState(false);
  const classes = useAcademyStore((s) => s.classes);

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">주간 시간표</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            수업 카드 클릭 → 상세 관리 &nbsp;|&nbsp; 마우스를 올리면 <span className="text-red-400 font-semibold">✕ 삭제</span> 버튼이 나타납니다
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* 수업 범례 */}
          <div className="hidden md:flex items-center gap-3">
            {classes.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full inline-block border border-white shadow-sm" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            수업 추가
          </button>
        </div>
      </header>

      {/* 시간표 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <Timetable />
        </div>
      </div>

      {showAdd && <ClassFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
