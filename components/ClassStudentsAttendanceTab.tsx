'use client';

import { useState } from 'react';
import { useAcademyStore } from '@/lib/store';

interface Props { classId: string; }

type AttStatus = 'present' | 'late' | 'absent' | 'excused';
type EnrollStatus = 'active' | 'paused' | 'cancelled';

const ATT: { key: AttStatus; label: string; active: string; idle: string }[] = [
  { key: 'present', label: '출석', active: 'bg-green-500 text-white border-green-500',  idle: 'bg-white text-slate-400 border-slate-200 hover:border-green-400 hover:text-green-600' },
  { key: 'late',    label: '지각', active: 'bg-yellow-400 text-white border-yellow-400', idle: 'bg-white text-slate-400 border-slate-200 hover:border-yellow-400 hover:text-yellow-600' },
  { key: 'absent',  label: '결석', active: 'bg-red-500 text-white border-red-500',       idle: 'bg-white text-slate-400 border-slate-200 hover:border-red-400 hover:text-red-500' },
  { key: 'excused', label: '공결', active: 'bg-blue-500 text-white border-blue-500',     idle: 'bg-white text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-500' },
];

const ENROLL_BADGE: Record<EnrollStatus, string> = {
  active:    'bg-green-100 text-green-700',
  paused:    'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
};
const ENROLL_LABEL: Record<EnrollStatus, string> = {
  active: '수강 중', paused: '일시중단', cancelled: '취소',
};

function toKorDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

export default function ClassStudentsAttendanceTab({ classId }: Props) {
  const { students, enrollments, attendances, addEnrollment, updateEnrollment, upsertAttendance } = useAcademyStore();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showAdd, setShowAdd] = useState(false);
  const [addId, setAddId] = useState('');

  /* ── 수강생 ── */
  const classEnrollments = enrollments.filter((e) => e.classId === classId);
  const activeIds = new Set(classEnrollments.filter((e) => e.status === 'active').map((e) => e.studentId));
  const unenrolled = students.filter((s) => !activeIds.has(s.id));

  function handleEnroll() {
    if (!addId) return;
    const existing = enrollments.find((e) => e.classId === classId && e.studentId === addId);
    if (existing) {
      updateEnrollment({ ...existing, status: 'active' });
    } else {
      addEnrollment({ id: 'e' + Date.now(), studentId: addId, classId, enrollDate: date, status: 'active' });
    }
    setShowAdd(false);
    setAddId('');
  }

  function togglePause(enrollId: string, cur: EnrollStatus) {
    const e = enrollments.find((x) => x.id === enrollId)!;
    updateEnrollment({ ...e, status: cur === 'active' ? 'paused' : 'active' });
  }

  /* ── 출석 ── */
  function getAtt(studentId: string): AttStatus {
    return (attendances.find(
      (a) => a.classId === classId && a.studentId === studentId && a.date === date
    )?.status ?? 'present') as AttStatus;
  }

  function setAtt(studentId: string, status: AttStatus) {
    upsertAttendance({
      id: `att-${classId}-${studentId}-${date}`,
      classId, studentId, date, status,
    });
  }

  /* ── 날짜별 요약 ── */
  const dateMap = attendances
    .filter((a) => a.classId === classId)
    .reduce<Record<string, Record<AttStatus, number>>>((acc, a) => {
      acc[a.date] ??= { present: 0, late: 0, absent: 0, excused: 0 };
      acc[a.date][a.status as AttStatus]++;
      return acc;
    }, {});
  const historyDates = Object.keys(dateMap).sort().reverse();

  /* ── 렌더 ── */
  const activeEnrollments = classEnrollments.filter((e) => e.status === 'active');

  return (
    <div className="space-y-5">

      {/* ── 상단 툴바 ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-700">
            수강생&nbsp;
            <span className="text-blue-600">{activeEnrollments.length}</span>명
          </h2>
          <div className="h-4 w-px bg-slate-200" />
          <label className="text-xs font-semibold text-slate-500">출석일</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm outline-none focus:border-blue-400"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3.5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + 수강생 추가
        </button>
      </div>

      {/* ── 수강생 추가 패널 ── */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">추가할 학생</span>
          <select
            className="flex-1 min-w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
          >
            <option value="">-- 학생 선택 --</option>
            {unenrolled.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
            ))}
          </select>
          <button onClick={handleEnroll} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">확인</button>
          <button onClick={() => { setShowAdd(false); setAddId(''); }} className="px-3 py-2 text-slate-500 text-sm rounded-lg hover:bg-slate-200">취소</button>
        </div>
      )}

      {/* ── 통합 테이블 ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">이름</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold hidden sm:table-cell">연락처</th>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">수강 상태</th>
              <th className="px-4 py-3 text-slate-600 font-semibold text-center">
                출석 체크
                <span className="ml-1.5 text-xs font-normal text-slate-400">({toKorDate(date)})</span>
              </th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classEnrollments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-14 text-slate-400">
                  등록된 수강생이 없습니다
                </td>
              </tr>
            ) : (
              classEnrollments.map((enroll) => {
                const stu = students.find((s) => s.id === enroll.studentId);
                if (!stu) return null;
                const isActive = enroll.status === 'active';
                const curAtt = getAtt(stu.id);
                return (
                  <tr key={enroll.id} className={`transition-colors ${isActive ? 'hover:bg-slate-50' : 'opacity-50'}`}>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{stu.name}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{stu.phone}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ENROLL_BADGE[enroll.status]}`}>
                        {ENROLL_LABEL[enroll.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {ATT.map((s) => (
                          <button
                            key={s.key}
                            disabled={!isActive}
                            onClick={() => setAtt(stu.id, s.key)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              isActive
                                ? curAtt === s.key ? s.active : s.idle
                                : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {enroll.status !== 'cancelled' && (
                        <button
                          onClick={() => togglePause(enroll.id, enroll.status)}
                          className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2"
                        >
                          {enroll.status === 'active' ? '중단' : '재개'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 출석 이력 ── */}
      {historyDates.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-sm">출석 이력</h3>
            <span className="text-xs text-slate-400">{historyDates.length}일 기록</span>
          </div>
          <div className="divide-y divide-slate-100">
            {historyDates.map((d) => {
              const s = dateMap[d];
              const isSelected = d === date;
              return (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                    {toKorDate(d)}
                  </span>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {s.present > 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">출석 {s.present}</span>}
                    {s.late    > 0 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">지각 {s.late}</span>}
                    {s.absent  > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">결석 {s.absent}</span>}
                    {s.excused > 0 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">공결 {s.excused}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
