'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAcademyStore } from '@/lib/store';

type Tab = 'info' | 'messages';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { students, classes, enrollments, attendances, messages, sendMessage, deleteMessage } = useAcademyStore();
  const [tab, setTab] = useState<Tab>('info');
  const [msgText, setMsgText] = useState('');

  const student = students.find((s) => s.id === id);
  if (!student) {
    return (
      <div className="p-8 text-slate-500">
        학생을 찾을 수 없습니다.{' '}
        <Link href="/students" className="text-blue-600 underline">학생 목록으로</Link>
      </div>
    );
  }

  const studentEnrollments = enrollments.filter((e) => e.studentId === id);
  const studentAttendances = attendances.filter((a) => a.studentId === id);
  const totalPresent = studentAttendances.filter((a) => a.status === 'present').length;
  const totalLate    = studentAttendances.filter((a) => a.status === 'late').length;
  const totalAbsent  = studentAttendances.filter((a) => a.status === 'absent').length;
  const totalClasses = studentAttendances.length;

  const myMessages = messages
    .filter((m) => m.studentId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = myMessages.filter((m) => !m.read).length;

  function handleSend() {
    const text = msgText.trim();
    if (!text) return;
    sendMessage({
      id: 'msg' + Date.now(),
      studentId: id,
      content: text,
      createdAt: new Date().toISOString(),
      read: false,
    });
    setMsgText('');
  }

  const TABS = [
    { key: 'info' as Tab,     label: '기본 정보',     icon: '👤' },
    { key: 'messages' as Tab, label: '메시지',         icon: '💬', badge: unread },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link href="/students" className="hover:text-blue-600">학생 관리</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{student.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              {student.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">{student.name}</h1>
              <div className="text-sm text-slate-500 mt-0.5">{student.phone} · 등록일 {student.joinDate}</div>
            </div>
          </div>
          {/* 빠른 메시지 보내기 버튼 */}
          <button
            onClick={() => setTab('messages')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            💬 메시지 보내기
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
            )}
          </button>
        </div>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-slate-200 px-6 shrink-0">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.badge && t.badge > 0 ? (
                <span className="ml-0.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* ── 기본 정보 탭 ── */}
        {tab === 'info' && (
          <div className="space-y-5 max-w-2xl">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-700 mb-4">기본 정보</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">연락처</div>
                  <div className="text-slate-800 font-semibold">{student.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">이메일</div>
                  <div className="text-slate-800">{student.email || '—'}</div>
                </div>
                {student.memo && (
                  <div className="col-span-2">
                    <div className="text-slate-400 text-xs mb-0.5">메모</div>
                    <div className="text-slate-700">{student.memo}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 출석 통계 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-700 mb-4">출석 통계</h2>
              {totalClasses === 0 ? (
                <p className="text-slate-400 text-sm">출석 기록이 없습니다</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: '총 수업', value: totalClasses, color: 'text-slate-800' },
                    { label: '출석',    value: totalPresent,  color: 'text-green-600' },
                    { label: '지각',    value: totalLate,     color: 'text-yellow-600' },
                    { label: '결석',    value: totalAbsent,   color: 'text-red-600' },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl">
                      <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 수강 이력 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-700 mb-4">수강 이력</h2>
              {studentEnrollments.length === 0 ? (
                <p className="text-slate-400 text-sm">수강 이력이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {studentEnrollments.map((e) => {
                    const cls = classes.find((c) => c.id === e.classId);
                    if (!cls) return null;
                    const badge = { active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-red-100 text-red-600' } as const;
                    const label = { active: '수강 중', paused: '일시 중단', cancelled: '취소' } as const;
                    return (
                      <div key={e.id} className="flex items-center justify-between py-3 px-4 border border-slate-100 rounded-xl hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }} />
                          <Link href={`/classes/${cls.id}`} className="font-medium text-blue-700 hover:underline">{cls.name}</Link>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-400 text-xs">{e.enrollDate} 등록</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge[e.status]}`}>{label[e.status]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 메시지 탭 ── */}
        {tab === 'messages' && (
          <div className="max-w-2xl space-y-4">
            {/* 메시지 작성 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">
                {student.name} 학생에게 메시지 보내기
              </h3>
              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none h-28 bg-slate-50 focus:bg-white transition-colors"
                placeholder={`${student.name} 학생에게 전달할 내용을 입력하세요...`}
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
                }}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">Ctrl+Enter로 전송</span>
                <button
                  onClick={handleSend}
                  disabled={!msgText.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  전송 ↑
                </button>
              </div>
            </div>

            {/* 전송 이력 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 text-sm">전송 내역</h3>
                <span className="text-xs text-slate-400">총 {myMessages.length}건</span>
              </div>

              {myMessages.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-sm">전송된 메시지가 없습니다</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myMessages.map((m) => (
                    <div key={m.id} className="px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* 읽음 상태 표시 */}
                        <div className="mt-1.5 shrink-0">
                          {m.read
                            ? <span className="text-slate-300 text-xs">✓✓</span>
                            : <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" title="미읽음" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.content}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-slate-400">
                              {new Date(m.createdAt).toLocaleDateString('ko-KR', {
                                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            <span className={`text-xs font-medium ${m.read ? 'text-slate-400' : 'text-blue-500'}`}>
                              {m.read ? '읽음' : '미읽음'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => { if (confirm('메시지를 삭제할까요?')) deleteMessage(m.id); }}
                        className="shrink-0 text-xs text-slate-300 hover:text-red-400 transition-colors p-1"
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
