'use client';

import { useEffect } from 'react';
import { useAcademyStore } from '@/lib/store';

interface Props { studentId: string; }

export default function StudentMessagesTab({ studentId }: Props) {
  const { messages, markMessageRead } = useAcademyStore();

  const myMessages = messages
    .filter((m) => m.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // 탭 진입 시 전부 읽음 처리
  useEffect(() => {
    myMessages.filter((m) => !m.read).forEach((m) => markMessageRead(m.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = myMessages.filter((m) => !m.read).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-700 text-sm">
          받은 메시지
          {unread > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unread} 새 메시지</span>
          )}
        </h2>
        <span className="text-xs text-slate-400">총 {myMessages.length}건</span>
      </div>

      {myMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center">
          <div className="text-4xl mb-3">💬</div>
          <div className="text-slate-400 text-sm">받은 메시지가 없습니다</div>
        </div>
      ) : (
        myMessages.map((m) => (
          <div
            key={m.id}
            className={`bg-white rounded-2xl border p-5 transition-all ${
              m.read ? 'border-slate-200' : 'border-blue-300 shadow-md shadow-blue-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* 아바타 */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                선
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-800">임미란 선생님</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {!m.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString('ko-KR', {
                        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
