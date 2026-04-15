'use client';

import { useState } from 'react';
import { useAcademyStore } from '@/lib/store';

interface Props { classId: string; }

export default function ClassNoticesTab({ classId }: Props) {
  const { notices, addNotice, deleteNotice } = useAcademyStore();
  const classNotices = notices.filter((n) => n.classId === classId || n.classId === null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });

  function handleSave() {
    if (!form.title.trim()) return;
    addNotice({ id: 'n' + Date.now(), classId, title: form.title, body: form.body, createdAt: new Date().toISOString() });
    setForm({ title: '', body: '' });
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">공지사항</h2>
        <button onClick={() => setShowForm(true)} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + 공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-3">
          <h3 className="font-semibold text-slate-700">새 공지사항</h3>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 h-28 resize-none"
            placeholder="공지 내용을 입력하세요"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">취소</button>
            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">등록</button>
          </div>
        </div>
      )}

      {classNotices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">공지사항이 없습니다</div>
      ) : (
        <div className="space-y-3">
          {classNotices.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {n.classId === null && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">전체 공지</span>
                    )}
                    <h3 className="font-semibold text-slate-800">{n.title}</h3>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    {new Date(n.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  {n.body && <p className="text-sm text-slate-600 whitespace-pre-wrap">{n.body}</p>}
                </div>
                {n.classId !== null && (
                  <button
                    onClick={() => { if (confirm('삭제할까요?')) deleteNotice(n.id); }}
                    className="ml-4 text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
