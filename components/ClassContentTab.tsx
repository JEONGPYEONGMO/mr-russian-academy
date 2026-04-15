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
  const { contents, addContent, updateContent, deleteContent } = useAcademyStore();
  const classContents = contents.filter((c) => c.classId === classId).sort((a, b) => b.date.localeCompare(a.date));

  const [editing, setEditing] = useState<ClassContent | null>(null);
  const [form, setForm] = useState(emptyForm(classId));
  const [showForm, setShowForm] = useState(false);

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
          <div className="grid grid-cols-2 gap-3">
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

      <style>{`
        .input-field { width:100%; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; font-size:0.875rem; outline:none; }
        .input-field:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
      `}</style>
    </div>
  );
}
