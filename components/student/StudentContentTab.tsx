'use client';

import { useState } from 'react';
import { ClassSession } from '@/lib/types';
import { useAcademyStore } from '@/lib/store';

interface Props {
  myClasses: ClassSession[];
}

export default function StudentContentTab({ myClasses }: Props) {
  const contents = useAcademyStore((s) => s.contents);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const myContents = contents
    .filter(
      (c) =>
        myClasses.some((cls) => cls.id === c.classId) &&
        (selectedClassId === 'all' || c.classId === selectedClassId)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  function getClass(classId: string) {
    return myClasses.find((c) => c.id === classId);
  }

  return (
    <div className="space-y-4">
      {/* 수업 필터 */}
      {myClasses.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedClassId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              selectedClassId === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
            }`}
          >
            전체
          </button>
          {myClasses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedClassId === c.id ? 'text-slate-800 border-slate-400' : 'bg-white text-slate-600 border-slate-200'
              }`}
              style={selectedClassId === c.id ? { backgroundColor: c.color } : {}}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {myContents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          등록된 수업 내용이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {myContents.map((c) => {
            const cls = getClass(c.classId);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* 수업 색상 바 */}
                <div className="h-1.5" style={{ backgroundColor: cls?.color ?? '#e2e8f0' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {cls && (
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-slate-700"
                            style={{ backgroundColor: cls.color }}
                          >
                            {cls.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{c.date}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">{c.title}</h3>
                    </div>
                  </div>

                  {c.content && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">수업 내용</div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-3 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  )}

                  {c.homework && (
                    <div className="flex items-start gap-2.5 mt-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <span className="text-base">📌</span>
                      <div>
                        <div className="text-xs font-bold text-orange-600 mb-0.5">숙제</div>
                        <p className="text-sm text-slate-700">{c.homework}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
