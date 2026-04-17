'use client';

import { useRouter } from 'next/navigation';
import { useAcademyStore } from '@/lib/store';
import { ClassSession, Day } from '@/lib/types';

const DAYS: Day[] = ['월', '화', '수', '목', '금', '토', '일'];

const SLOTS: string[] = [];
for (let h = 9; h <= 21; h++) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}
SLOTS.push('22:00');

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function slotIndex(time: string) {
  return (timeToMinutes(time) - 9 * 60) / 30;
}

interface PlacedCard {
  cls: ClassSession;
  day: Day;
  startSlot: number;
  span: number;
}

export default function Timetable() {
  const router = useRouter();
  const classes = useAcademyStore((s) => s.classes);
  const instructors = useAcademyStore((s) => s.instructors);
  const deleteClass = useAcademyStore((s) => s.deleteClass);

  const cards: PlacedCard[] = [];
  for (const cls of classes) {
    for (const day of cls.days) {
      const startSlot = slotIndex(cls.startTime);
      const endSlot = slotIndex(cls.endTime);
      cards.push({ cls, day, startSlot, span: endSlot - startSlot });
    }
  }

  function getInstructor(id: string) {
    return instructors.find((i) => i.id === id);
  }

  function handleDelete(e: React.MouseEvent, cls: ClassSession) {
    e.stopPropagation();
    if (confirm(`"${cls.name}" 수업을 삭제할까요?\n삭제하면 관련 수강생 등록 정보도 함께 삭제됩니다.`)) {
      deleteClass(cls.id);
    }
  }

  // ── 모바일: 요일별 카드 리스트 ──────────────────────────────────────
  const mobileDays = DAYS.filter((day) => cards.some((c) => c.day === day));

  return (
    <>
      {/* 모바일 뷰 (md 미만) */}
      <div className="md:hidden">
        {classes.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            수업이 없습니다. 수업을 추가해보세요.
          </div>
        ) : (
          <div className="space-y-5 p-4">
            {mobileDays.map((day) => {
              const dayCards = cards
                .filter((c) => c.day === day)
                .sort((a, b) => a.startSlot - b.startSlot);
              return (
                <div key={day}>
                  <div className={`text-xs font-bold mb-2 px-1 ${
                    day === '토' ? 'text-blue-600' : day === '일' ? 'text-red-500' : 'text-slate-500'
                  }`}>
                    {day}요일
                  </div>
                  <div className="space-y-2">
                    {dayCards.map((card) => {
                      const instr = getInstructor(card.cls.instructorId);
                      return (
                        <div
                          key={card.cls.id + day}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
                          style={{
                            backgroundColor: card.cls.color,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
                          }}
                          onClick={() => router.push(`/classes/${card.cls.id}`)}
                        >
                          <div className="text-center shrink-0">
                            <div className="text-[11px] font-bold text-slate-700">{card.cls.startTime}</div>
                            <div className="text-[10px] text-slate-500">–</div>
                            <div className="text-[11px] font-bold text-slate-700">{card.cls.endTime}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-800 text-sm leading-snug">{card.cls.name}</div>
                            <div className="text-xs text-slate-600 mt-0.5">{instr?.name}</div>
                          </div>
                          <div className="text-xs text-slate-500 shrink-0 text-right">
                            <div className="font-semibold text-slate-700">{card.cls.level}</div>
                            <div>{card.cls.fee.toLocaleString()}원</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 데스크탑 뷰 (md 이상) */}
      <div className="hidden md:block overflow-auto">
        <table className="border-collapse text-xs min-w-max w-full table-fixed">
          <colgroup>
            <col style={{ width: '72px' }} />
            {DAYS.map((d) => <col key={d} style={{ width: '120px' }} />)}
          </colgroup>
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-slate-200 px-2 py-2.5 text-center font-bold text-slate-600 text-xs">
                시간
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className={`border border-slate-200 px-2 py-2.5 text-center font-bold text-xs ${
                    d === '토' ? 'text-blue-600' : d === '일' ? 'text-red-500' : 'text-slate-700'
                  }`}
                >
                  {d}요일
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, slotIdx) => {
              const isHour = slot.endsWith(':00');
              return (
                <tr key={slot} className={isHour ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="border border-slate-200 px-2 py-0 h-8 text-center align-middle">
                    {isHour
                      ? <span className="text-slate-500 font-medium text-[11px]">{slot}</span>
                      : <span className="text-slate-300 text-[10px]">· · ·</span>
                    }
                  </td>
                  {DAYS.map((day) => {
                    const card = cards.find((c) => c.day === day && c.startSlot === slotIdx);
                    const covered = cards.some(
                      (c) => c.day === day && c.startSlot < slotIdx && c.startSlot + c.span > slotIdx
                    );

                    if (covered) return null;

                    if (card) {
                      const instr = getInstructor(card.cls.instructorId);
                      const tall = card.span >= 4;
                      return (
                        <td
                          key={day}
                          rowSpan={card.span}
                          className="border border-slate-200 p-0 align-top"
                        >
                          <div
                            className="class-card group relative h-full mx-0.5 my-0.5 rounded-lg px-2.5 py-2 flex flex-col"
                            style={{
                              backgroundColor: card.cls.color,
                              minHeight: `${card.span * 32 - 4}px`,
                              border: `1.5px solid ${card.cls.color}`,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
                            }}
                            onClick={() => router.push(`/classes/${card.cls.id}`)}
                          >
                            <button
                              onClick={(e) => handleDelete(e, card.cls)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/15 hover:bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                              title="수업 삭제"
                            >
                              ✕
                            </button>
                            <div className="flex-1 min-h-0">
                              <div className="font-bold text-slate-800 text-[12px] leading-snug pr-4">{card.cls.name}</div>
                              {tall && (
                                <div className="text-slate-600 text-[11px] mt-0.5 font-medium">{instr?.name}</div>
                              )}
                            </div>
                            <div className="text-slate-600 text-[10px] mt-1 space-y-0.5">
                              <div className="font-semibold">{card.cls.startTime}–{card.cls.endTime}</div>
                              {tall && <div>{card.cls.fee.toLocaleString()}원</div>}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return <td key={day} className="border border-slate-200 h-8" />;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
