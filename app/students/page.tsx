'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAcademyStore } from '@/lib/store';
import { Student } from '@/lib/types';

const emptyStudent = (): Student => ({
  id: 's' + Date.now(),
  name: '',
  phone: '',
  email: '',
  enrolledClassIds: [],
  joinDate: new Date().toISOString().slice(0, 10),
  memo: '',
});

export default function StudentsPage() {
  const { students, classes, enrollments, addStudent, updateStudent, deleteStudent } = useAcademyStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = students.filter(
    (s) => s.name.includes(search) || s.phone.includes(search) || s.email.includes(search)
  );

  function getClassNames(studentId: string) {
    return enrollments
      .filter((e) => e.studentId === studentId && e.status === 'active')
      .map((e) => classes.find((c) => c.id === e.classId)?.name)
      .filter(Boolean)
      .join(', ');
  }

  function openAdd() {
    setEditing(emptyStudent());
    setShowForm(true);
  }

  function openEdit(s: Student) {
    setEditing({ ...s });
    setShowForm(true);
  }

  function handleSave() {
    if (!editing || !editing.name.trim()) return;
    const exists = students.find((s) => s.id === editing.id);
    if (exists) updateStudent(editing);
    else addStudent(editing);
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">학생 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {students.length}명</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <span>+</span> 학생 등록
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {/* 검색 */}
        <div className="mb-5">
          <input
            className="w-full max-w-sm border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400 bg-white"
            placeholder="이름, 연락처, 이메일로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 폼 */}
        {showForm && editing && (
          <div className="mb-5 bg-white rounded-xl border border-blue-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4">{students.find((s) => s.id === editing.id) ? '학생 정보 수정' : '새 학생 등록'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">이름 *</label>
                <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">연락처</label>
                <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="010-0000-0000" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">이메일</label>
                <input type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">등록일</label>
                <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={editing.joinDate} onChange={(e) => setEditing({ ...editing, joinDate: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-500 block mb-1">메모</label>
                <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" value={editing.memo} onChange={(e) => setEditing({ ...editing, memo: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">취소</button>
              <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">저장</button>
            </div>
          </div>
        )}

        {/* 학생 목록 테이블 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-slate-600 font-medium">이름</th>
                <th className="text-left px-5 py-3 text-slate-600 font-medium">연락처</th>
                <th className="text-left px-5 py-3 text-slate-600 font-medium hidden md:table-cell">이메일</th>
                <th className="text-left px-5 py-3 text-slate-600 font-medium">수강 중인 수업</th>
                <th className="text-left px-5 py-3 text-slate-600 font-medium hidden lg:table-cell">등록일</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">학생이 없습니다</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/students/${s.id}`} className="font-semibold text-blue-700 hover:underline">{s.name}</Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{s.phone}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{s.email}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{getClassNames(s.id) || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{s.joinDate}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/students/${s.id}?tab=messages`)}
                          className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50"
                        >
                          💬 메시지
                        </button>
                        <button onClick={() => openEdit(s)} className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50">수정</button>
                        <button onClick={() => { if (confirm(`"${s.name}" 학생을 삭제할까요?`)) deleteStudent(s.id); }} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50">삭제</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
