'use client';

import { useState } from 'react';
import { ClassSession } from '@/lib/types';
import { useAcademyStore } from '@/lib/store';

interface Props {
  studentId: string;
  myClasses: ClassSession[];
}

const STATUS_STYLE = {
  present: { label: '출석', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  late:    { label: '지각', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  absent:  { label: '결석', bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
  excused: { label: '공결', bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-400' },
} as const;

export default function StudentAttendanceTab({ studentId, myClasses }: Props) {
  const attendances = useAcademyStore((s) => s.attendances);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const myAtt = attendances.filter(
    (a) =>
      a.studentId === studentId &&
      (selectedClassId === 'all' || a.classId === selectedClassId)
  );

  const sorted = [...myAtt].sort((a, b) => b.date.localeCompare(a.date));

  // 통계
  const stats = {
    present: myAtt.filter((a) => a.status === 'present').length,
    late:    myAtt.filter((a) => a.status === 'late').length,
    absent:  myAtt.filter((a) => a.status === 'absent').length,
    excused: myAtt.filter((a) => a.status === 'excused').length,
  };
  const total = myAtt.length;
  const rate = total > 0 ? Math.round(((stats.present + stats.late) / total) * 100) : null;

  function getClassName(classId: string) {
    return myClasses.find((c) => c.id === classId)?.name ?? classId;
  }

  function getClassColor(classId: string) {
    return myClasses.find((c) => c.id === classId)?.color ?? '#e2e8f0';
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
                selectedClassId === c.id
                  ? 'text-slate-800 border-slate-400'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
              style={selectedClassId === c.id ? { backgroundColor: c.color } : {}}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(stats) as [keyof typeof stats, number][]).map(([key, val]) => {
          const s = STATUS_STYLE[key];
          return (
            <div key={key} className={`${s.bg} rounded-xl p-4 text-center`}>
              <div className={`text-2xl font-extrabold ${s.text}`}>{val}</div>
              <div className="text-slate-600 text-xs mt-0.5 font-medium">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* 출석률 바 */}
      {total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">출석률</span>
            <span className="text-lg font-extrabold text-blue-600">{rate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1.5">총 {total}회 수업 중 출석+지각 {stats.present + stats.late}회</div>
        </div>
      )}

      {/* 출석 이력 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-700 text-sm">출석 이력</h3>
        </div>

        {sorted.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">출석 기록이 없습니다</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sorted.map((a) => {
              const s = STATUS_STYLE[a.status];
              const dateObj = new Date(a.date);
              return (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <div>
                      <div className="text-sm font-semibold text-slate-700">
                        {dateObj.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: getClassColor(a.classId) }}
                        />
                        {getClassName(a.classId)}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
