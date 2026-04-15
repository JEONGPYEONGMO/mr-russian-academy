'use client';

import { useState } from 'react';
import { useAcademyStore } from '@/lib/store';

interface Props { classId: string; }

export default function ClassStudentsTab({ classId }: Props) {
  const { students, enrollments, addEnrollment, updateEnrollment } = useAcademyStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // 이 수업에 등록된 수강생
  const classEnrollments = enrollments.filter((e) => e.classId === classId);
  const enrolledIds = new Set(classEnrollments.filter((e) => e.status === 'active').map((e) => e.studentId));

  // 아직 등록 안 된 학생
  const unEnrolled = students.filter((s) => !enrolledIds.has(s.id));

  function handleEnroll() {
    if (!selectedStudentId) return;
    const existing = enrollments.find((e) => e.classId === classId && e.studentId === selectedStudentId);
    if (existing) {
      updateEnrollment({ ...existing, status: 'active' });
    } else {
      addEnrollment({
        id: 'e' + Date.now(),
        studentId: selectedStudentId,
        classId,
        enrollDate: new Date().toISOString().slice(0, 10),
        status: 'active',
      });
    }
    setShowAdd(false);
    setSelectedStudentId('');
  }

  function handlePause(enrollmentId: string, current: 'active' | 'paused' | 'cancelled') {
    const e = enrollments.find((x) => x.id === enrollmentId)!;
    updateEnrollment({ ...e, status: current === 'active' ? 'paused' : 'active' });
  }

  const statusLabel = { active: '수강 중', paused: '일시 중단', cancelled: '취소' } as const;
  const statusColor = { active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-red-100 text-red-600' } as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-700">수강생 ({classEnrollments.filter((e) => e.status === 'active').length}명)</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + 수강생 추가
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm font-medium text-slate-700 mb-2">추가할 학생 선택</p>
          <div className="flex gap-2">
            <select
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- 학생 선택 --</option>
              {unEnrolled.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
              ))}
            </select>
            <button onClick={handleEnroll} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">확인</button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-2 text-slate-500 text-sm rounded-lg hover:bg-slate-200">취소</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">이름</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">연락처</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">등록일</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">상태</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classEnrollments.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">등록된 수강생이 없습니다</td></tr>
            ) : (
              classEnrollments.map((enroll) => {
                const stu = students.find((s) => s.id === enroll.studentId);
                if (!stu) return null;
                return (
                  <tr key={enroll.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{stu.name}</td>
                    <td className="px-4 py-3 text-slate-600">{stu.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{enroll.enrollDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[enroll.status]}`}>
                        {statusLabel[enroll.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {enroll.status !== 'cancelled' && (
                        <button
                          onClick={() => handlePause(enroll.id, enroll.status)}
                          className="text-xs text-slate-500 hover:text-slate-800 underline"
                        >
                          {enroll.status === 'active' ? '일시중단' : '재개'}
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
    </div>
  );
}
