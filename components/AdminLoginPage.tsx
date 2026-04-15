'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';

export default function AdminLoginPage() {
  const adminLogin = useAuthStore((s) => s.adminLogin);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = adminLogin(pw);
    if (!ok) {
      setError(true);
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* 모달 */}
      <div className={`relative w-full max-w-sm mx-4 ${shake ? 'animate-shake' : ''}`}>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* 상단 헤더 */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-7 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 mb-3 shadow-lg">
              <span className="text-3xl">🇷🇺</span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">MR Russian</h1>
            <p className="text-blue-200 text-xs mt-1">어학원 관리 시스템</p>
          </div>

          {/* 입력 영역 */}
          <div className="px-8 py-7">
            <h2 className="text-slate-800 font-bold text-base mb-5 text-center">관리자 로그인</h2>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                비밀번호
              </label>
              <input
                ref={inputRef}
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="관리자 비밀번호 입력"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-300 outline-none transition-all text-sm font-medium ${
                  error
                    ? 'border-red-400 bg-red-50 focus:border-red-400'
                    : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {error ? (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> 비밀번호가 올바르지 않습니다
                </p>
              ) : (
                <p className="text-slate-400 text-xs mt-2">관리자 전용 접근입니다</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
            >
              로그인
            </button>
          </div>
        </form>

        {/* 학생 페이지 링크 */}
        <p className="text-center text-white/40 text-xs mt-4">
          학생이신가요?{' '}
          <a href="/student" className="text-blue-300 hover:text-white underline transition-colors">
            학생 페이지로 이동
          </a>
        </p>
      </div>

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
