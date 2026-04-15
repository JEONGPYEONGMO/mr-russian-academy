'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import type { Student } from '@/lib/types';

export default function StudentPortalPage() {
  const router = useRouter();
  const { students, classes, enrollments } = useAcademyStore();
  const { studentLogin } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) setTimeout(() => pwRef.current?.focus(), 80);
  }, [selected]);

  const filtered = students.filter(
    (s) => s.name.includes(search) || s.phone.includes(search),
  );

  function getMyClasses(studentId: string) {
    return enrollments
      .filter((e) => e.studentId === studentId && e.status === 'active')
      .map((e) => classes.find((c) => c.id === e.classId))
      .filter(Boolean) as typeof classes;
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const ok = studentLogin(selected.id, selected.phone, pw);
    if (ok) {
      router.push(`/student/${selected.id}`);
    } else {
      setError(true);
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 500);
      pwRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <div className="relative text-center pt-12 pb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-3 shadow-xl">
          <span className="text-2xl">🇷🇺</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">MR Russian</h1>
        <p className="text-blue-300 text-sm mt-1">학생 포털</p>
      </div>

      <div className="relative flex-1 px-4 pb-8 max-w-md mx-auto w-full">
        {/* 검색 */}
        <div className="relative mb-4">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
          <input
            className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-blue-400 focus:bg-white/15 text-sm transition-all"
            placeholder="이름 또는 연락처 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* 학생 목록 */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/40">검색 결과가 없습니다</div>
          ) : (
            filtered.map((s) => {
              const myClasses = getMyClasses(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelected(s); setPw(''); setError(false); }}
                  className="w-full bg-white/10 backdrop-blur border border-white/15 hover:border-blue-400 hover:bg-white/15 rounded-xl px-4 py-3.5 flex items-center justify-between transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                      {s.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{s.name}</div>
                      <div className="text-white/40 text-xs mt-0.5">{s.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap justify-end">
                      {myClasses.map((c) => (
                        <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-slate-700" style={{ backgroundColor: c.color }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                    <span className="text-white/30 group-hover:text-blue-400 transition-colors">›</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 관리자 페이지 링크 */}
      <a
        href="/"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-xs font-semibold hover:bg-white/20 transition-all"
      >
        🔑 관리자 페이지
      </a>

      {/* ── 비밀번호 모달 ── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSelected(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleLogin}
            className={`w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 transition-all ${shake ? 'animate-shake' : ''}`}
          >
            {/* 학생 정보 */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {selected.name[0]}
              </div>
              <div>
                <div className="font-extrabold text-slate-800 text-lg">{selected.name}</div>
                <div className="text-slate-400 text-xs">{selected.phone}</div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                비밀번호 입력
              </label>
              <input
                ref={pwRef}
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="숫자 4자리 입력"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 outline-none text-center text-xl font-bold tracking-widest transition-all ${
                  error ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-400'
                }`}
              />
              {error ? (
                <p className="text-red-500 text-xs text-center mt-2">⚠ 비밀번호가 올바르지 않습니다</p>
              ) : (
                <p className="text-slate-400 text-xs text-center mt-2">
                  기본 비밀번호: 핸드폰 번호 마지막 4자리
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm transition-colors shadow-sm"
              >
                로그인
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        .animate-shake { animation: shake 0.45s ease; }
      `}</style>
    </div>
  );
}
