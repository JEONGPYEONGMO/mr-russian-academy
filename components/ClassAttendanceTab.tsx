'use client';

import { useState } from 'react';
import { useAcademyStore } from '@/lib/store';
import { AttendanceRecord } from '@/lib/types';

interface Props { classId: string; }

type Status = 'present' | 'absent' | 'late' | 'excused';
const STATUS_LIST: { key: Status; label: string; color: string }[] = [
  { key: 'present', label: '출석', color: 'bg-green-100 text-green-700' },
  { key: 'late', label: '지각', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'absent', label: '결석', color: 'bg-red-100 text-red-600' },
  { key: 'excused', label: '공결', color: 'bg-blue-100 text-blue-700' },
];

function toKoreanDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

export default function ClassAttendanceTab({ classId }: Props) {
  const { students, enrollments, attendances, upsertAttendance } = useAcademyStore();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const enrolled = enrollments
    .filter((e) => e.classId === classId && e.status === 'active')
    .map((e) => students.find((s) => s.id === e.studentId))
    .filter(Boolean) as typeof students;

  function getStatus(studentId: string): Status {
    const rec = attendances.find((a) => a.classId === classId && a.studentId === studentId && a.date === selectedDate);
    return rec?.status ?? 'present';
  }

  function setStatus(studentId: string, status: Status) {
    upsertAttendance({
      id: `att-${classId}-${studentId}-${selectedDate}`,
      classId,
      studentId,
      date: selectedDate,
      status,
    });
  }

  // 날짜별 통계
  const dateStats = attendances
    .filter((a) => a.classId === classId)
    .reduce<Record<string, Record<Status, number>>>((acc, a) => {
      if (!acc[a.date]) acc[a.date] = { present: 0, absent: 0, late: 0, excused: 0 };
      acc[a.date][a.status]++;
      return acc;
    }, {});

  const sortedDates = Object.keys(dateStats).sort().reverse();

  return (
    <div className="space-y-6">
      {/* 날짜 선택 & 출석 입력 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700">출석 입력</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {enrolled.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">등록된 수강생이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {enrolled.map((stu) => {
              const current = getStatus(stu.id);
              return (
                <div key={stu.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-800">{stu.name}</span>
                  <div className="flex gap-1.5">
                    {STATUS_LIST.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setStatus(stu.id, s.key)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          current === s.key
                            ? s.color + ' border-transparent'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 출석 이력 */}
      {sortedDates.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">출석 이력</h2>
          <div className="space-y-2">
            {sortedDates.map((date) => {
              const s = dateStats[date];
              return (
                <div
                  key={date}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDate === date ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="text-sm text-slate-700">{toKoreanDate(date)}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">출석 {s.present}</span>
                    {s.late > 0 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">지각 {s.late}</span>}
                    {s.absent > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full">결석 {s.absent}</span>}
                    {s.excused > 0 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">공결 {s.excused}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
