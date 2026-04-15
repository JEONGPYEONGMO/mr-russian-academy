'use client';

import { useState } from 'react';
import { useAcademyStore } from '@/lib/store';

export default function NoticesPage() {
  const { notices, classes, addNotice, deleteNotice } = useAcademyStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', classId: '' });

  function handleSave() {
    if (!form.title.trim()) return;
    addNotice({
      id: 'n' + Date.now(),
      classId: form.classId || null,
      title: form.title,
      body: form.body,
      createdAt: new Date().toISOString(),
    });
    setForm({ title: '', body: '', classId: '' });
    setShowForm(false);
  }

  const sorted = [...notices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">공지사항</h1>
          <p className="text-sm text-slate-500 mt-0.5">전체 {notices.length}건</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <span>+</span> 공지 작성
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {showForm && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-700">새 공지사항</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">제목 *</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="공지 제목"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">대상 수업</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                >
                  <option value="">전체 (모든 수강생)</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">내용</label>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 h-28 resize-none"
                placeholder="공지 내용을 입력하세요"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">취소</button>
              <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">등록</button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">공지사항이 없습니다</div>
        ) : (
          sorted.map((n) => {
            const cls = n.classId ? classes.find((c) => c.id === n.classId) : null;
            return (
              <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {cls ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: cls.color + '99' }}>
                          {cls.name}
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">전체 공지</span>
                      )}
                      <h3 className="font-semibold text-slate-800">{n.title}</h3>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      {new Date(n.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {n.body && <p className="text-sm text-slate-600 whitespace-pre-wrap">{n.body}</p>}
                  </div>
                  <button
                    onClick={() => { if (confirm('삭제할까요?')) deleteNotice(n.id); }}
                    className="ml-4 text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
