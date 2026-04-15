'use client';

import { ClassSession, Day } from '@/lib/types';
import { useAcademyStore } from '@/lib/store';

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
function slotIndex(t: string) {
  return (timeToMinutes(t) - 9 * 60) / 30;
}

interface Props {
  studentId: string;
  myClasses: ClassSession[];
}

export default function StudentScheduleTab({ myClasses }: Props) {
  const instructors = useAcademyStore((s) => s.instructors);

  const cards = myClasses.flatMap((cls) =>
    cls.days.map((day) => ({
      cls,
      day,
      startSlot: slotIndex(cls.startTime),
      span: slotIndex(cls.endTime) - slotIndex(cls.startTime),
    }))
  );

  return (
    <div className="space-y-4">
      {/* 수업 요약 카드 */}
      {myClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          수강 중인 수업이 없습니다
        </div>
      ) : (
        <div className="grid gap-3">
          {myClasses.map((cls) => {
            const instr = instructors.find((i) => i.id === cls.instructorId);
            return (
              <div key={cls.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl font-extrabold text-slate-700"
                  style={{ backgroundColor: cls.color }}
                >
                  {cls.level[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800">{cls.name}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{instr?.name} · {cls.level}</div>
                </div>
                <div className="text-right text-sm shrink-0">
                  <div className="font-semibold text-slate-700">{cls.days.join(', ')}요일</div>
                  <div className="text-slate-500 text-xs mt-0.5">{cls.startTime} – {cls.endTime}</div>
                  <div className="text-blue-600 font-bold text-xs mt-0.5">{cls.fee.toLocaleString()}원</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 주간 시간표 (월~일 전체) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm">주간 시간표</h3>
          <div className="flex gap-2">
            {myClasses.map((c) => (
              <span key={c.id} className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="border-collapse text-xs min-w-max w-full table-fixed">
            <colgroup>
              <col style={{ width: '56px' }} />
              {DAYS.map((d) => <col key={d} style={{ width: '100px' }} />)}
            </colgroup>
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-slate-100 px-1 py-2.5 text-slate-400 text-[11px] font-semibold">시간</th>
                {DAYS.map((d) => (
                  <th
                    key={d}
                    className={`border border-slate-100 py-2.5 font-bold text-[12px] text-center ${
                      d === '토' ? 'text-blue-600' : d === '일' ? 'text-red-500' : 'text-slate-700'
                    }`}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot, slotIdx) => {
                const isHour = slot.endsWith(':00');
                return (
                  <tr key={slot} className={isHour ? 'bg-white' : 'bg-slate-50/50'}>
                    {/* 시간 열 */}
                    <td className="border border-slate-100 text-center align-middle h-8">
                      {isHour
                        ? <span className="text-[11px] text-slate-400 font-medium">{slot}</span>
                        : <span className="text-[10px] text-slate-200">·</span>
                      }
                    </td>

                    {/* 요일 셀 */}
                    {DAYS.map((day) => {
                      const card = cards.find((c) => c.day === day && c.startSlot === slotIdx);
                      const covered = cards.some(
                        (c) => c.day === day && c.startSlot < slotIdx && c.startSlot + c.span > slotIdx
                      );
                      if (covered) return null;
                      if (card) {
                        return (
                          <td
                            key={day}
                            rowSpan={card.span}
                            className="border border-slate-100 p-0 align-top"
                          >
                            <div
                              className="mx-0.5 my-0.5 rounded-lg px-2 py-1.5 flex flex-col justify-between h-full"
                              style={{
                                backgroundColor: card.cls.color,
                                minHeight: `${card.span * 32 - 4}px`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                              }}
                            >
                              <div className="font-bold text-slate-800 text-[11px] leading-snug">{card.cls.name}</div>
                              <div className="text-slate-600 text-[10px] font-semibold mt-1">
                                {card.cls.startTime}–{card.cls.endTime}
                              </div>
                            </div>
                          </td>
                        );
                      }
                      return <td key={day} className="border border-slate-100 h-8" />;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
