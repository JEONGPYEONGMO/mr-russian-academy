'use client';

import { useRef, useState } from 'react';
import { useAcademyStore } from '@/lib/store';
import { exportToExcel, downloadTemplate, parseExcelFile, ImportResult } from '@/lib/excel';
import type { ClassSession, Student, Enrollment, AttendanceRecord, ClassContent } from '@/lib/types';

type Step = 'idle' | 'preview' | 'done';

export default function ImportPage() {
  const store = useAcademyStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>('idle');
  const [parsed, setParsed] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<Record<string, number>>({});

  /* ── 파일 처리 ── */
  async function processFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('xlsx 또는 xls 파일만 업로드할 수 있습니다.');
      return;
    }
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    const result = parseExcelFile(buf);
    setParsed(result);
    setStep('preview');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  /* ── 실제 가져오기 ── */
  function handleImport() {
    if (!parsed) return;
    setImporting(true);

    const summary: Record<string, number> = {
      students: 0, classes: 0, enrollments: 0, attendances: 0, contents: 0,
    };

    // 1. 학생 처리 (이름 기준 upsert)
    for (const row of parsed.students) {
      const existing = store.students.find((s) => s.name === row.name);
      if (existing) {
        store.updateStudent({ ...existing, ...row });
      } else {
        const newStudent: Student = {
          id: 's' + Date.now() + Math.random(),
          enrolledClassIds: [],
          ...row,
        };
        store.addStudent(newStudent);
        summary.students++;
      }
    }

    // 최신 스토어 참조를 위해 getState 활용
    const getStudents = () => useAcademyStore.getState().students;
    const getClasses  = () => useAcademyStore.getState().classes;

    // 2. 수업 처리 (수업명 기준 upsert)
    for (const row of parsed.classes) {
      // 강사는 첫번째 강사로 기본 설정 (엑셀에 강사명이 없으면)
      const instructorId = store.instructors[0]?.id ?? 'i1';
      const existing = getClasses().find((c) => c.name === row.name);
      if (existing) {
        store.updateClass({ ...existing, ...row, instructorId });
      } else {
        const newClass: ClassSession = {
          id: 'c' + Date.now() + Math.random(),
          instructorId,
          ...row,
        };
        store.addClass(newClass);
        summary.classes++;
      }
    }

    // 3. 수강등록
    for (const row of parsed.enrollments) {
      const student = getStudents().find((s) => s.name === row.studentName);
      const cls     = getClasses().find((c)  => c.name === row.className);
      if (!student || !cls) continue;
      const existing = useAcademyStore.getState().enrollments.find(
        (e) => e.studentId === student.id && e.classId === cls.id,
      );
      if (existing) {
        store.updateEnrollment({ ...existing, status: row.status, enrollDate: row.enrollDate });
      } else {
        store.addEnrollment({
          id: 'e' + Date.now() + Math.random(),
          studentId: student.id,
          classId:   cls.id,
          enrollDate: row.enrollDate,
          status:    row.status,
        });
        summary.enrollments++;
      }
    }

    // 4. 출석기록
    for (const row of parsed.attendances) {
      const student = getStudents().find((s) => s.name === row.studentName);
      const cls     = getClasses().find((c)  => c.name === row.className);
      if (!student || !cls) continue;
      const rec: AttendanceRecord = {
        id: `att-${cls.id}-${student.id}-${row.date}`,
        classId: cls.id, studentId: student.id,
        date: row.date, status: row.status,
      };
      store.upsertAttendance(rec);
      summary.attendances++;
    }

    // 5. 수업내용
    for (const row of parsed.contents) {
      const cls = getClasses().find((c) => c.name === row.className);
      if (!cls) continue;
      const existing = useAcademyStore.getState().contents.find(
        (c) => c.classId === cls.id && c.date === row.date && c.title === row.title,
      );
      if (!existing) {
        const newContent: ClassContent = {
          id: 'cont' + Date.now() + Math.random(),
          classId: cls.id,
          date: row.date, title: row.title,
          content: row.content, homework: row.homework,
        };
        store.addContent(newContent);
        summary.contents++;
      }
    }

    setImportSummary(summary);
    setImporting(false);
    setStep('done');
  }

  /* ── 렌더 ── */
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">데이터 관리</h1>
        <p className="text-xs text-slate-400 mt-0.5">엑셀 파일로 학생·수업·출석 데이터를 일괄 가져오거나 내보낼 수 있습니다</p>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── 내보내기 섹션 ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1">📤 내보내기 (Export)</h2>
            <p className="text-sm text-slate-500 mb-5">현재 시스템의 모든 데이터를 엑셀 파일로 저장합니다.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => exportToExcel({
                  students: store.students,
                  classes: store.classes,
                  enrollments: store.enrollments,
                  attendances: store.attendances,
                  contents: store.contents,
                  instructors: store.instructors,
                })}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                <span>⬇</span> 전체 데이터 내보내기
              </button>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span>📋</span> 빈 입력 양식 다운로드
              </button>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              현재 데이터 현황:
              <span className="ml-3 font-semibold text-slate-700">학생 {store.students.length}명</span>
              <span className="ml-2 font-semibold text-slate-700">수업 {store.classes.length}개</span>
              <span className="ml-2 font-semibold text-slate-700">수강등록 {store.enrollments.length}건</span>
              <span className="ml-2 font-semibold text-slate-700">출석 {store.attendances.length}건</span>
            </div>
          </div>

          {/* ── 가져오기 섹션 ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1">📥 가져오기 (Import)</h2>
            <p className="text-sm text-slate-500 mb-5">
              작성한 엑셀 파일을 업로드하면 데이터가 자동으로 반영됩니다.
              <span className="ml-1 text-amber-600 font-semibold">이름이 같은 항목은 업데이트, 새 항목은 추가됩니다.</span>
            </p>

            {step === 'idle' && (
              <div
                ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <div className="text-5xl mb-3">📂</div>
                <p className="font-bold text-slate-700 text-base">파일을 여기에 끌어다 놓거나 클릭하세요</p>
                <p className="text-sm text-slate-400 mt-1">.xlsx / .xls 파일 지원</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* ── 미리보기 ── */}
            {step === 'preview' && parsed && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">{fileName}</div>
                    <div className="text-xs text-slate-500">파싱 완료 — 아래 내용을 확인 후 가져오기를 실행하세요</div>
                  </div>
                </div>

                {/* 파싱 결과 요약 */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: '학생', count: parsed.students.length, color: 'bg-purple-100 text-purple-700' },
                    { label: '수업', count: parsed.classes.length, color: 'bg-blue-100 text-blue-700' },
                    { label: '수강등록', count: parsed.enrollments.length, color: 'bg-green-100 text-green-700' },
                    { label: '출석기록', count: parsed.attendances.length, color: 'bg-yellow-100 text-yellow-700' },
                    { label: '수업내용', count: parsed.contents.length, color: 'bg-pink-100 text-pink-700' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                      <div className="text-2xl font-extrabold">{item.count}</div>
                      <div className="text-xs font-semibold mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* 오류 */}
                {parsed.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="font-semibold text-red-700 text-sm mb-2">⚠ 파싱 경고 ({parsed.errors.length}건)</div>
                    <ul className="space-y-1">
                      {parsed.errors.map((e, i) => (
                        <li key={i} className="text-xs text-red-600">· {e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 데이터 미리보기 테이블 */}
                {parsed.students.length > 0 && (
                  <PreviewTable
                    title="학생목록 미리보기"
                    headers={['이름', '연락처', '이메일', '등록일']}
                    rows={parsed.students.slice(0, 5).map((s) => [s.name, s.phone, s.email, s.joinDate])}
                    total={parsed.students.length}
                  />
                )}
                {parsed.classes.length > 0 && (
                  <PreviewTable
                    title="수업목록 미리보기"
                    headers={['수업명', '레벨', '요일', '시간']}
                    rows={parsed.classes.slice(0, 5).map((c) => [c.name, c.level, c.days.join(','), `${c.startTime}–${c.endTime}`])}
                    total={parsed.classes.length}
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setStep('idle'); setParsed(null); setFileName(''); }}
                    className="px-5 py-2.5 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {importing ? '처리 중...' : '✓ 가져오기 실행'}
                  </button>
                </div>
              </div>
            )}

            {/* ── 완료 ── */}
            {step === 'done' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-bold text-green-800 text-lg mb-1">가져오기 완료!</div>
                  <div className="text-sm text-green-700">
                    학생 {importSummary.students}명, 수업 {importSummary.classes}개,
                    수강등록 {importSummary.enrollments}건, 출석 {importSummary.attendances}건,
                    수업내용 {importSummary.contents}건이 추가되었습니다.
                  </div>
                </div>
                <button
                  onClick={() => { setStep('idle'); setParsed(null); setFileName(''); }}
                  className="w-full py-2.5 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  새 파일 가져오기
                </button>
              </div>
            )}
          </div>

          {/* ── 사용 안내 ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
            <div className="font-bold mb-2">📌 사용 안내</div>
            <ol className="space-y-1.5 list-decimal list-inside text-amber-700">
              <li><span className="font-semibold">빈 입력 양식</span>을 다운로드해서 데이터를 입력하세요</li>
              <li>학생목록 → 수업목록 → 수강등록 → 출석기록 → 수업내용 순으로 입력하면 정확합니다</li>
              <li>파일 업로드 후 <span className="font-semibold">미리보기</span>에서 데이터를 확인하세요</li>
              <li>같은 이름의 학생/수업은 <span className="font-semibold">덮어쓰기(업데이트)</span>됩니다</li>
              <li>시트 이름은 변경하지 마세요 (학생목록, 수업목록, 수강등록, 출석기록, 수업내용)</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── 미리보기 테이블 컴포넌트 ── */
function PreviewTable({
  title, headers, rows, total,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  total: number;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <span className="font-semibold text-slate-700 text-sm">{title}</span>
        <span className="text-xs text-slate-400">총 {total}행{total > 5 ? ` (5행만 표시)` : ''}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {headers.map((h) => (
                <th key={h} className="text-left px-3 py-2 text-slate-500 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 text-slate-700">{cell || '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
