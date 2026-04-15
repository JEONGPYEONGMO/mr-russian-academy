'use client';

import { useState } from 'react';
import { useAcademyStore } from '@/lib/store';
import { ClassSession, Day, Level } from '@/lib/types';

const DAYS: Day[] = ['월', '화', '수', '목', '금', '토', '일'];
const LEVELS: Level[] = ['입문', '초급', '중급', '고급', '원어민'];
const COLORS = ['#f9a8d4', '#fdba74', '#86efac', '#93c5fd', '#c4b5fd', '#fde68a', '#a5f3fc'];

interface Props {
  initial?: ClassSession | null;
  onClose: () => void;
}

function newId() {
  return 'c' + Date.now();
}

export default function ClassFormModal({ initial, onClose }: Props) {
  const { addClass, updateClass, instructors } = useAcademyStore();

  const [form, setForm] = useState<ClassSession>(
    initial ?? {
      id: newId(),
      name: '',
      level: '초급',
      instructorId: instructors[0]?.id ?? '',
      days: [],
      startTime: '10:00',
      endTime: '12:00',
      fee: 250000,
      maxStudents: 8,
      description: '',
      color: COLORS[0],
    }
  );

  function toggleDay(d: Day) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (initial) updateClass(form);
    else addClass(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <form
        className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold text-slate-800">{initial ? '수업 수정' : '수업 추가'}</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">수업명</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">레벨</label>
            <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as Level })}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">강사</label>
            <select className="input" value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })}>
              {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">시작 시간</label>
            <input type="time" className="input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div>
            <label className="label">종료 시간</label>
            <input type="time" className="input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <div>
            <label className="label">수강료</label>
            <input type="number" className="input" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">최대 인원</label>
            <input type="number" className="input" value={form.maxStudents} onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })} />
          </div>
        </div>

        {/* 요일 선택 */}
        <div>
          <label className="label">수업 요일</label>
          <div className="flex gap-2 mt-1">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`w-9 h-9 rounded-full text-sm font-medium border transition-colors ${
                  form.days.includes(d)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 색상 선택 */}
        <div>
          <label className="label">카드 색상</label>
          <div className="flex gap-2 mt-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{ backgroundColor: c, borderColor: form.color === c ? '#1e40af' : 'transparent' }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">설명</label>
          <textarea className="input h-16 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">취소</button>
          <button type="submit" className="btn-primary">저장</button>
        </div>
      </form>

      <style>{`
        .label { display:block; font-size:0.75rem; font-weight:600; color:#475569; margin-bottom:4px; }
        .input { width:100%; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; font-size:0.875rem; outline:none; }
        .input:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
        .btn-primary { background:#3b82f6; color:white; px:16px; py:8px; border-radius:8px; font-size:0.875rem; font-weight:600; padding:8px 20px; }
        .btn-primary:hover { background:#2563eb; }
        .btn-ghost { border:1px solid #cbd5e1; color:#475569; border-radius:8px; font-size:0.875rem; padding:8px 16px; }
        .btn-ghost:hover { background:#f1f5f9; }
      `}</style>
    </div>
  );
}
