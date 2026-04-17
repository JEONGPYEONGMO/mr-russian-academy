'use client';

import { useRef, useState, useEffect } from 'react';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAcademyStore } from '@/lib/store';
import { exportToExcel, getExcelBase64, downloadTemplate, parseExcelFile, ImportResult } from '@/lib/excel';
import type {
  ClassSession, Student, Enrollment, AttendanceRecord,
  ClassContent, Instructor, Notice, Message,
} from '@/lib/types';

type Step = 'idle' | 'preview' | 'done';

// localStorage에 저장된 이전 데이터 구조
interface LocalStoreState {
  classes: ClassSession[];
  students: Student[];
  enrollments: Enrollment[];
  attendances: AttendanceRecord[];
  contents: ClassContent[];
  instructors: Instructor[];
  notices: Notice[];
  messages: Message[];
}

function readLocalStore(): LocalStoreState | null {
  try {
    const raw = localStorage.getItem('mr-russian-store');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state: LocalStoreState };
    const s = parsed?.state;
    if (!s) return null;
    const hasData =
      (s.students?.length ?? 0) > 0 ||
      (s.classes?.length ?? 0) > 0 ||
      (s.attendances?.length ?? 0) > 0;
    return hasData ? s : null;
  } catch {
    return null;
  }
}

// 날짜 파일명 생성 (YYYY-MM-DD_HH-MM-SS)
function backupFilename() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `MR_Russian_백업_${date}_${time}.xlsx`;
}

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

  // ── Firebase 이전 상태 ──
  const [localData, setLocalData] = useState<LocalStoreState | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [migrateError, setMigrateError] = useState('');

  // ── 백업 상태 ──
  const [backingUp, setBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // 마운트 시 localStorage 데이터 확인
  useEffect(() => {
    setLocalData(readLocalStore());
  }, []);

  /* ── Firebase 이전 ── */
  async function handleMigrate() {
    if (!localData) return;
    setMigrating(true);
    setMigrateError('');

    try {
      const BATCH_SIZE = 400;

      async function batchWrite(colName: string, items: { id: string }[]) {
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const chunk = items.slice(i, i + BATCH_SIZE);
          const batch = writeBatch(db);
          chunk.forEach((item) => batch.set(doc(db, colName, item.id), item));
          await batch.commit();
        }
      }

      if (localData.instructors?.length) await batchWrite('instructors', localData.instructors);
      if (localData.classes?.length)     await batchWrite('classes',     localData.classes);
      if (localData.students?.length)    await batchWrite('students',    localData.students);
      if (localData.enrollments?.length) await batchWrite('enrollments', localData.enrollments);
      if (localData.attendances?.length) await batchWrite('attendances', localData.attendances);
      if (localData.contents?.length)    await batchWrite('contents',    localData.contents);
      if (localData.notices?.length)     await batchWrite('notices',     localData.notices);
      if (localData.messages?.length)    await batchWrite('messages',    localData.messages);

      // meta/seeded 표시 (중복 시드 방지)
      await setDoc(doc(db, 'meta', 'seeded'), { seeded: true });

      setMigrated(true);
    } catch (e) {
      setMigrateError(String(e));
    } finally {
      setMigrating(false);
    }
  }

  function clearLocalStorage() {
    localStorage.removeItem('mr-russian-store');
    setLocalData(null);
  }

  /* ── 백업 ── */
  async function handleBackup() {
    setBackingUp(true);
    setBackupResult(null);
    try {
      const data = {
        students:    store.students,
        classes:     store.classes,
        enrollments: store.enrollments,
        attendances: store.attendances,
        contents:    store.contents,
        instructors: store.instructors,
        notices:     store.notices,
        messages:    store.messages,
      };
      const base64 = getExcelBase64(data);
      const filename = backupFilename();

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, filename }),
      });
      const json = await res.json() as { success: boolean; filename?: string };

      if (json.success) {
        setBackupResult({ ok: true, msg: `backups/${json.filename}` });
      } else {
        setBackupResult({ ok: false, msg: '저장 실패 — 서버 오류' });
      }
    } catch (e) {
      setBackupResult({ ok: false, msg: String(e) });
    } finally {
      setBackingUp(false);
    }
  }

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

  /* ── 가져오기 실행 ── */
  function handleImport() {
    if (!parsed) return;
    setImporting(true);
    const summary: Record<string, number> = {
      students: 0, classes: 0, enrollments: 0, attendances: 0, contents: 0,
    };

    for (const row of parsed.students) {
      const existing = store.students.find((s) => s.name === row.name);
      if (existing) {
        store.updateStudent({ ...existing, ...row });
      } else {
        store.addStudent({ id: 's' + Date.now() + Math.random(), enrolledClassIds: [], ...row });
        summary.students++;
      }
    }

    const getStudents = () => useAcademyStore.getState().students;
    const getClasses  = () => useAcademyStore.getState().classes;

    for (const row of parsed.classes) {
      const instructorId = store.instructors[0]?.id ?? 'i1';
      const existing = getClasses().find((c) => c.name === row.name);
      if (existing) {
        store.updateClass({ ...existing, ...row, instructorId });
      } else {
        store.addClass({ id: 'c' + Date.now() + Math.random(), instructorId, ...row });
        summary.classes++;
      }
    }

    for (const row of parsed.enrollments) {
      const student = getStudents().find((s) => s.name === row.studentName);
      const cls     = getClasses().find((c) => c.name === row.className);
      if (!student || !cls) continue;
      const existing = useAcademyStore.getState().enrollments.find(
        (e) => e.studentId === student.id && e.classId === cls.id,
      );
      if (existing) {
        store.updateEnrollment({ ...existing, status: row.status, enrollDate: row.enrollDate });
      } else {
        store.addEnrollment({ id: 'e' + Date.now() + Math.random(), studentId: student.id, classId: cls.id, enrollDate: row.enrollDate, status: row.status });
        summary.enrollments++;
      }
    }

    for (const row of parsed.attendances) {
      const student = getStudents().find((s) => s.name === row.studentName);
      const cls     = getClasses().find((c) => c.name === row.className);
      if (!student || !cls) continue;
      store.upsertAttendance({ id: `att-${cls.id}-${student.id}-${row.date}`, classId: cls.id, studentId: student.id, date: row.date, status: row.status });
      summary.attendances++;
    }

    for (const row of parsed.contents) {
      const cls = getClasses().find((c) => c.name === row.className);
      if (!cls) continue;
      const existing = useAcademyStore.getState().contents.find(
        (c) => c.classId === cls.id && c.date === row.date && c.title === row.title,
      );
      if (!existing) {
        store.addContent({ id: 'cont' + Date.now() + Math.random(), classId: cls.id, date: row.date, title: row.title, content: row.content, homework: row.homework });
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
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">데이터 관리</h1>
        <p className="text-xs text-slate-400 mt-0.5">엑셀 파일로 학생·수업·출석 데이터를 일괄 가져오거나 내보낼 수 있습니다</p>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* ── ☁️ Firebase 데이터 이전 ── */}
          {(localData || migrated) && (
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${migrated ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                <span>☁️</span> Firebase 데이터 이전
              </h2>

              {migrated ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-semibold">✅ Firebase 업로드 완료! 모든 기기에서 데이터를 사용할 수 있습니다.</p>
                  <button
                    onClick={clearLocalStorage}
                    className="text-xs px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-white transition-colors"
                  >
                    이 PC의 로컬 데이터 삭제 (정리)
                  </button>
                </div>
              ) : localData ? (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    이 PC에 저장된 기존 데이터를 감지했습니다. Firebase에 업로드하면 모든 기기에서 공유됩니다.
                  </p>

                  {/* 감지된 데이터 요약 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { label: '학생',     count: localData.students?.length ?? 0,    color: 'bg-purple-100 text-purple-700' },
                      { label: '수업',     count: localData.classes?.length ?? 0,     color: 'bg-blue-100 text-blue-700' },
                      { label: '수강등록', count: localData.enrollments?.length ?? 0, color: 'bg-green-100 text-green-700' },
                      { label: '출석기록', count: localData.attendances?.length ?? 0, color: 'bg-yellow-100 text-yellow-700' },
                    ].map((item) => (
                      <div key={item.label} className={`${item.color} rounded-xl p-2.5 text-center`}>
                        <div className="text-xl font-extrabold">{item.count}</div>
                        <div className="text-xs font-semibold mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {migrateError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      오류: {migrateError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleMigrate}
                      disabled={migrating}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {migrating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          업로드 중...
                        </>
                      ) : (
                        <>☁️ Firebase에 업로드</>
                      )}
                    </button>
                    <button
                      onClick={clearLocalStorage}
                      className="px-4 py-2.5 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-white transition-colors"
                    >
                      무시하고 삭제
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* ── 백업 섹션 ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1">💾 백업</h2>
            <p className="text-sm text-slate-500 mb-4">Firebase 데이터를 엑셀 파일로 저장합니다.</p>

            <div className="flex flex-wrap gap-3">
              {/* 폴더에 저장 */}
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {backingUp ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>📁 backups 폴더에 저장</>
                )}
              </button>

              {/* 브라우저 다운로드 */}
              <button
                onClick={() => exportToExcel({
                  students: store.students,
                  classes: store.classes,
                  enrollments: store.enrollments,
                  attendances: store.attendances,
                  contents: store.contents,
                  instructors: store.instructors,
                  notices: store.notices,
                  messages: store.messages,
                })}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                <span>⬇</span> 파일로 다운로드
              </button>
            </div>

            {/* 백업 결과 */}
            {backupResult && (
              <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${backupResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {backupResult.ok ? (
                  <>✅ 저장 완료: <span className="font-mono text-xs">{backupResult.msg}</span></>
                ) : (
                  <>❌ {backupResult.msg}</>
                )}
              </div>
            )}

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
              <span>현재 데이터:</span>
              <span className="font-semibold text-slate-700">학생 {store.students.length}명</span>
              <span className="font-semibold text-slate-700">수업 {store.classes.length}개</span>
              <span className="font-semibold text-slate-700">수강등록 {store.enrollments.length}건</span>
              <span className="font-semibold text-slate-700">출석 {store.attendances.length}건</span>
            </div>
          </div>

          {/* ── 내보내기 (빈 양식) ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1">📋 입력 양식</h2>
            <p className="text-sm text-slate-500 mb-4">엑셀로 데이터를 일괄 입력할 때 사용하는 빈 양식입니다.</p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span>📋</span> 빈 입력 양식 다운로드
            </button>
          </div>

          {/* ── 가져오기 섹션 ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1">📥 가져오기 (Import)</h2>
            <p className="text-sm text-slate-500 mb-4">
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
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <div className="text-4xl sm:text-5xl mb-3">📂</div>
                <p className="font-bold text-slate-700 text-sm sm:text-base">파일을 여기에 끌어다 놓거나 클릭하세요</p>
                <p className="text-sm text-slate-400 mt-1">.xlsx / .xls 파일 지원</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
              </div>
            )}

            {step === 'preview' && parsed && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">{fileName}</div>
                    <div className="text-xs text-slate-500">파싱 완료 — 아래 내용을 확인 후 가져오기를 실행하세요</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: '학생',    count: parsed.students.length,    color: 'bg-purple-100 text-purple-700' },
                    { label: '수업',    count: parsed.classes.length,     color: 'bg-blue-100 text-blue-700' },
                    { label: '수강등록', count: parsed.enrollments.length, color: 'bg-green-100 text-green-700' },
                    { label: '출석기록', count: parsed.attendances.length, color: 'bg-yellow-100 text-yellow-700' },
                    { label: '수업내용', count: parsed.contents.length,   color: 'bg-pink-100 text-pink-700' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                      <div className="text-2xl font-extrabold">{item.count}</div>
                      <div className="text-xs font-semibold mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>

                {parsed.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="font-semibold text-red-700 text-sm mb-2">⚠ 파싱 경고 ({parsed.errors.length}건)</div>
                    <ul className="space-y-1">
                      {parsed.errors.map((e, i) => <li key={i} className="text-xs text-red-600">· {e}</li>)}
                    </ul>
                  </div>
                )}

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
                  <button onClick={() => { setStep('idle'); setParsed(null); setFileName(''); }} className="px-5 py-2.5 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50">취소</button>
                  <button onClick={handleImport} disabled={importing} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm">
                    {importing ? '처리 중...' : '✓ 가져오기 실행'}
                  </button>
                </div>
              </div>
            )}

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
                <button onClick={() => { setStep('idle'); setParsed(null); setFileName(''); }} className="w-full py-2.5 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50">
                  새 파일 가져오기
                </button>
              </div>
            )}
          </div>

          {/* ── 사용 안내 ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-sm text-amber-800">
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

function PreviewTable({ title, headers, rows, total }: {
  title: string; headers: string[]; rows: string[][]; total: number;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <span className="font-semibold text-slate-700 text-sm">{title}</span>
        <span className="text-xs text-slate-400">총 {total}행{total > 5 ? ' (5행만 표시)' : ''}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>{headers.map((h) => <th key={h} className="text-left px-3 py-2 text-slate-500 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                {row.map((cell, j) => <td key={j} className="px-3 py-2 text-slate-700">{cell || '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
