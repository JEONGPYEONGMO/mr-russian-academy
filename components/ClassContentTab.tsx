'use client';

import { useState } from 'react';
import { useAcademyStore } from '@/lib/store';
import { ClassContent } from '@/lib/types';

interface Props { classId: string; }

const emptyForm = (classId: string): Omit<ClassContent, 'id'> => ({
  classId,
  date: new Date().toISOString().slice(0, 10),
  title: '',
  content: '',
  homework: '',
});

export default function ClassContentTab({ classId }: Props) {
  const { contents, students, enrollments, addContent, updateContent, deleteContent, sendMessage } = useAcademyStore();
  const classContents = contents.filter((c) => c.classId === classId).sort((a, b) => b.date.localeCompare(a.date));

  const [editing, setEditing] = useState<ClassContent | null>(null);
  const [form, setForm] = useState(emptyForm(classId));
  const [showForm, setShowForm] = useState(false);

  // 전송 관련 상태
  const [sendingContent, setSendingContent] = useState<ClassContent | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  // 이 수업의 활성 학생 목록
  const activeStudents = enrollments
    .filter((e) => e.classId === classId && e.status === 'active')
    .map((e) => students.find((s) => s.id === e.studentId))
    .filter(Boolean) as typeof students;

  function openSend(c: ClassContent) {
    setSendingContent(c);
    setSelectedIds(activeStudents.map((s) => s.id)); // 기본: 전체 선택
    setSent(false);
  }

  function toggleStudent(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedIds.length === activeStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeStudents.map((s) => s.id));
    }
  }

  function handleSend() {
    if (!sendingContent || selectedIds.length === 0) return;
    const c = sendingContent;
    const lines = [`📝 수업 내용 안내 (${c.date})`, ``, `■ ${c.title}`];
    if (c.content) lines.push(``, c.content);
    if (c.homework) lines.push(``, `📌 숙제: ${c.homework}`);
    const msgText = lines.join('\n');

    const now = new Date().toISOString();
    selectedIds.forEach((studentId, i) => {
      sendMessage({
        id: `msg${Date.now()}${i}`,
        studentId,
        content: msgText,
        createdAt: now,
        read: false,
      });
    });
    setSent(true);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm(classId));
    setShowForm(true);
  }

  function openEdit(c: ClassContent) {
    setEditing(c);
    setForm({ classId: c.classId, date: c.date, title: c.title, content: c.content, homework: c.homework });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    if (editing) {
      updateContent({ ...editing, ...form });
    } else {
      addContent({ id: 'cont' + Date.now(), ...form });
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">수업 내용 ({classContents.length}건)</h2>
        <button onClick={openAdd} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + 수업 기록 추가
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-slate-700">{editing ? '수업 기록 수정' : '새 수업 기록'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">날짜</label>
              <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">제목</label>
              <input className="input-field" placeholder="수업 주제 또는 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">수업 내용</label>
            <textarea className="input-field h-24 resize-none" placeholder="오늘 배운 내용을 입력하세요" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">숙제</label>
            <input className="input-field" placeholder="숙제 내용" value={form.homework} onChange={(e) => setForm({ ...form, homework: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">취소</button>
            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">저장</button>
          </div>
        </div>
      )}

      {classContents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          수업 기록이 없습니다. 첫 수업 내용을 입력해보세요.
        </div>
      ) : (
        <div className="space-y-3">
          {classContents.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">{c.date}</div>
                  <h3 className="font-semibold text-slate-800">{c.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openSend(c)}
                    className="px-2.5 py-1 text-xs text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 font-semibold"
                  >
                    📤 전송
                  </button>
                  <button onClick={() => openEdit(c)} className="px-2.5 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">수정</button>
                  <button onClick={() => { if (confirm('삭제할까요?')) deleteContent(c.id); }} className="px-2.5 py-1 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50">삭제</button>
                </div>
              </div>
              {c.content && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-slate-500 mb-1">수업 내용</div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{c.content}</p>
                </div>
              )}
              {c.homework && (
                <div className="mt-3 flex items-start gap-2">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-0.5">숙제</span>
                  <p className="text-sm text-slate-700">{c.homework}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 전송 모달 ── */}
      {sendingContent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSendingContent(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-4 text-white">
              <div className="text-xs font-semibold text-indigo-200 mb-0.5">수업 내용 전송</div>
              <div className="font-bold text-base">{sendingContent.title}</div>
              <div className="text-xs text-indigo-200 mt-0.5">{sendingContent.date}</div>
            </div>

            <div className="p-5">
              {sent ? (
                /* 전송 완료 */
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-bold text-slate-800 mb-1">전송 완료!</div>
                  <div className="text-sm text-slate-500">
                    {selectedIds.length}명의 학생에게 전송되었습니다.
                  </div>
                  <button
                    onClick={() => setSendingContent(null)}
                    className="mt-5 w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700"
                  >
                    확인
                  </button>
                </div>
              ) : (
                <>
                  {/* 학생 선택 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700">받는 학생 선택</span>
                      <button
                        onClick={toggleAll}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        {selectedIds.length === activeStudents.length ? '전체 해제' : '전체 선택'}
                      </button>
                    </div>

                    {activeStudents.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl">
                        등록된 학생이 없습니다
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        {activeStudents.map((s) => (
                          <label
                            key={s.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(s.id)}
                              onChange={() => toggleStudent(s.id)}
                              className="w-4 h-4 accent-blue-600"
                            />
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {s.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800">{s.name}</div>
                              <div className="text-xs text-slate-400">{s.phone}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSendingContent(null)}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={selectedIds.length === 0}
                      className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      {selectedIds.length > 0 ? `${selectedIds.length}명에게 전송` : '전송'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-field { width:100%; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; font-size:0.875rem; outline:none; }
        .input-field:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
      `}</style>
    </div>
  );
}
