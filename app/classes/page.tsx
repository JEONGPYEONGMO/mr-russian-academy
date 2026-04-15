'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAcademyStore } from '@/lib/store';
import ClassFormModal from '@/components/ClassFormModal';

export default function ClassesPage() {
  const { classes, instructors, enrollments, deleteClass } = useAcademyStore();
  const [showAdd, setShowAdd] = useState(false);

  function getInstructor(id: string) {
    return instructors.find((i) => i.id === id);
  }

  function enrollCount(classId: string) {
    return enrollments.filter((e) => e.classId === classId && e.status === 'active').length;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">수업 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {classes.length}개 수업</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>+</span> 수업 추가
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const instr = getInstructor(cls.instructorId);
            const count = enrollCount(cls.id);
            return (
              <div
                key={cls.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 색상 바 */}
                <div className="h-2" style={{ backgroundColor: cls.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{cls.name}</h3>
                      <div className="text-sm text-slate-500 mt-0.5">{cls.level} · {instr?.name}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: cls.color + '80' }}>
                      {cls.level}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📅</span>
                      {cls.days.join(', ')} {cls.startTime}–{cls.endTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">💰</span>
                      {cls.fee.toLocaleString()}원/월
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">👥</span>
                      {count}/{cls.maxStudents}명 수강 중
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <Link
                      href={`/classes/${cls.id}`}
                      className="flex-1 text-center py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      상세 보기
                    </Link>
                    <button
                      onClick={() => { if (confirm(`"${cls.name}" 수업을 삭제할까요?`)) deleteClass(cls.id); }}
                      className="px-3 py-2 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAdd && <ClassFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
