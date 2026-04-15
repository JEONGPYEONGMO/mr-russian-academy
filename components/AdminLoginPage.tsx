'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';

export default function AdminLoginPage() {
  const adminLogin = useAuthStore((s) => s.adminLogin);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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

      <div className={`relative w-full max-w-sm mx-4 transition-all ${shake ? 'animate-shake' : ''}`}>
        {/* 로고 카드 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-4 shadow-xl">
            <span className="text-3xl">🇷🇺</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">MR Russian</h1>
          <p className="text-blue-300 text-sm mt-1">어학원 관리 시스템</p>
        </div>

        {/* 로그인 폼 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-white font-bold text-lg mb-6 text-center">관리자 로그인</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-blue-200 text-xs font-semibold mb-2 uppercase tracking-wide">
                관리자 비밀번호
              </label>
              <input
                ref={inputRef}
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="비밀번호를 입력하세요"
                className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all text-sm ${
                  error
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-white/20 focus:border-blue-400 focus:bg-white/15'
                }`}
              />
              {error && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> 비밀번호가 올바르지 않습니다
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 text-sm"
            >
              로그인
            </button>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            학생 페이지는 우측 하단 버튼을 이용하세요
          </p>
        </form>
      </div>

      {/* 학생 페이지 바로가기 */}
      <a
        href="/student"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-sm font-semibold hover:bg-white/20 transition-all shadow-lg"
      >
        🎓 학생 페이지
      </a>

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
