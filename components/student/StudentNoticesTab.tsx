'use client';

import { ClassSession } from '@/lib/types';
import { useAcademyStore } from '@/lib/store';

interface Props {
  myClasses: ClassSession[];
}

export default function StudentNoticesTab({ myClasses }: Props) {
  const notices = useAcademyStore((s) => s.notices);

  const myClassIds = new Set(myClasses.map((c) => c.id));

  // 전체 공지 + 내 수업 공지
  const myNotices = notices
    .filter((n) => n.classId === null || myClassIds.has(n.classId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function getClass(classId: string | null) {
    if (!classId) return null;
    return myClasses.find((c) => c.id === classId) ?? null;
  }

  return (
    <div className="space-y-3">
      {myNotices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          공지사항이 없습니다
        </div>
      ) : (
        myNotices.map((n) => {
          const cls = getClass(n.classId);
          const isGlobal = n.classId === null;
          return (
            <div key={n.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* 상단 컬러 바 */}
              <div
                className="h-1.5"
                style={{ backgroundColor: cls ? cls.color : '#e2e8f0' }}
              />
              <div className="p-5">
                {/* 배지 + 날짜 */}
                <div className="flex items-center gap-2 mb-2">
                  {isGlobal ? (
                    <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-semibold">
                      전체 공지
                    </span>
                  ) : cls ? (
                    <span
                      className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold text-slate-700"
                      style={{ backgroundColor: cls.color }}
                    >
                      {cls.name}
                    </span>
                  ) : null}
                  <span className="text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-1">{n.title}</h3>
                {n.body && (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mt-2">
                    {n.body}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
