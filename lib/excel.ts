'use client';

import * as XLSX from 'xlsx';
import type {
  Student, ClassSession, Enrollment,
  AttendanceRecord, ClassContent, Instructor,
} from './types';

// ── 엑셀 컬럼 너비 설정 헬퍼 ─────────────────────────────────────
function colWidths(sizes: number[]) {
  return sizes.map((w) => ({ wch: w }));
}

// ─────────────────────────────────────────────────────────────────
//  EXPORT: 현재 데이터 → 엑셀 다운로드
// ─────────────────────────────────────────────────────────────────
export function exportToExcel(data: {
  students: Student[];
  classes: ClassSession[];
  enrollments: Enrollment[];
  attendances: AttendanceRecord[];
  contents: ClassContent[];
  instructors: Instructor[];
}) {
  const wb = XLSX.utils.book_new();

  const STATUS_KO: Record<string, string> = {
    active: '수강중', paused: '일시중단', cancelled: '취소',
    present: '출석', late: '지각', absent: '결석', excused: '공결',
  };

  /* ── 시트1: 학생목록 ── */
  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['이름*', '연락처', '이메일', '등록일(YYYY-MM-DD)', '메모'],
      data.students.map((s) => [s.name, s.phone, s.email, s.joinDate, s.memo]),
      colWidths([14, 16, 24, 18, 30]),
    ),
    '학생목록',
  );

  /* ── 시트2: 수업목록 ── */
  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['수업명*', '레벨', '강사명', '요일(쉼표구분)*', '시작시간*', '종료시간*', '수강료', '최대인원', '설명', '색상코드'],
      data.classes.map((c) => {
        const instr = data.instructors.find((i) => i.id === c.instructorId);
        return [c.name, c.level, instr?.name ?? '', c.days.join(','), c.startTime, c.endTime, c.fee, c.maxStudents, c.description, c.color];
      }),
      colWidths([18, 8, 12, 16, 10, 10, 10, 10, 30, 12]),
    ),
    '수업목록',
  );

  /* ── 시트3: 수강등록 ── */
  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['학생이름*', '수업명*', '등록일(YYYY-MM-DD)', '상태(수강중/일시중단/취소)'],
      data.enrollments.map((e) => {
        const s = data.students.find((x) => x.id === e.studentId);
        const c = data.classes.find((x) => x.id === e.classId);
        return [s?.name ?? '', c?.name ?? '', e.enrollDate, STATUS_KO[e.status] ?? e.status];
      }),
      colWidths([14, 18, 18, 22]),
    ),
    '수강등록',
  );

  /* ── 시트4: 출석기록 ── */
  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['학생이름*', '수업명*', '날짜(YYYY-MM-DD)*', '상태(출석/지각/결석/공결)*'],
      data.attendances.map((a) => {
        const s = data.students.find((x) => x.id === a.studentId);
        const c = data.classes.find((x) => x.id === a.classId);
        return [s?.name ?? '', c?.name ?? '', a.date, STATUS_KO[a.status] ?? a.status];
      }),
      colWidths([14, 18, 18, 22]),
    ),
    '출석기록',
  );

  /* ── 시트5: 수업내용 ── */
  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['수업명*', '날짜(YYYY-MM-DD)*', '제목*', '수업내용', '숙제'],
      data.contents.map((c) => {
        const cls = data.classes.find((x) => x.id === c.classId);
        return [cls?.name ?? '', c.date, c.title, c.content, c.homework];
      }),
      colWidths([18, 18, 20, 40, 30]),
    ),
    '수업내용',
  );

  /* ── 시트6: 안내(읽기전용) ── */
  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['항목', '설명'],
      [
        ['*표시', '필수 입력 항목입니다'],
        ['요일 형식', '월,화,수 처럼 쉼표로 구분'],
        ['시간 형식', '09:00 처럼 HH:MM 형식'],
        ['레벨 값', '입문 / 초급 / 중급 / 고급 / 원어민'],
        ['출석 상태', '출석 / 지각 / 결석 / 공결'],
        ['수강 상태', '수강중 / 일시중단 / 취소'],
        ['색상코드', '#f9a8d4 형식의 HEX 코드'],
        ['가져오기 방법', '학생→수업→수강등록→출석→수업내용 순으로 처리됩니다'],
        ['중복 처리', '이름이 같은 학생/수업은 업데이트됩니다'],
      ],
      colWidths([16, 50]),
    ),
    '📋 사용안내',
  );

  XLSX.writeFile(wb, 'MR_Russian_마스터_데이터.xlsx');
}

// ─────────────────────────────────────────────────────────────────
//  TEMPLATE: 빈 양식만 (샘플 1행 포함)
// ─────────────────────────────────────────────────────────────────
export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['이름*', '연락처', '이메일', '등록일(YYYY-MM-DD)', '메모'],
      [['홍길동', '010-0000-0001', 'hong@example.com', '2025-01-01', '']],
      colWidths([14, 16, 24, 18, 30]),
    ),
    '학생목록',
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['수업명*', '레벨', '강사명', '요일(쉼표구분)*', '시작시간*', '종료시간*', '수강료', '최대인원', '설명', '색상코드'],
      [['초급 회화반', '초급', '임미란', '월,수', '10:00', '12:00', 250000, 8, '기초 회화', '#f9a8d4']],
      colWidths([18, 8, 12, 16, 10, 10, 10, 10, 30, 12]),
    ),
    '수업목록',
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['학생이름*', '수업명*', '등록일(YYYY-MM-DD)', '상태(수강중/일시중단/취소)'],
      [['홍길동', '초급 회화반', '2025-01-01', '수강중']],
      colWidths([14, 18, 18, 22]),
    ),
    '수강등록',
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['학생이름*', '수업명*', '날짜(YYYY-MM-DD)*', '상태(출석/지각/결석/공결)*'],
      [['홍길동', '초급 회화반', '2025-04-15', '출석']],
      colWidths([14, 18, 18, 22]),
    ),
    '출석기록',
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['수업명*', '날짜(YYYY-MM-DD)*', '제목*', '수업내용', '숙제'],
      [['초급 회화반', '2025-04-15', '1과 인사하기', '안녕하세요 학습', '교재 1~5쪽 복습']],
      colWidths([18, 18, 20, 40, 30]),
    ),
    '수업내용',
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFrom(
      ['항목', '설명'],
      [
        ['*표시', '필수 입력 항목'],
        ['요일 형식', '월,화,수 (쉼표 구분)'],
        ['시간 형식', 'HH:MM (예: 09:00)'],
        ['레벨 값', '입문 / 초급 / 중급 / 고급 / 원어민'],
        ['출석 상태', '출석 / 지각 / 결석 / 공결'],
        ['수강 상태', '수강중 / 일시중단 / 취소'],
        ['색상코드', '#f9a8d4 형식'],
      ],
      colWidths([16, 50]),
    ),
    '📋 사용안내',
  );

  XLSX.writeFile(wb, 'MR_Russian_입력_양식.xlsx');
}

// ─────────────────────────────────────────────────────────────────
//  IMPORT: 업로드된 엑셀 파싱
// ─────────────────────────────────────────────────────────────────
export interface ImportResult {
  students:    Omit<Student, 'id' | 'enrolledClassIds'>[];
  classes:     Omit<ClassSession, 'id' | 'instructorId'>[];
  enrollments: { studentName: string; className: string; enrollDate: string; status: Enrollment['status'] }[];
  attendances: { studentName: string; className: string; date: string; status: AttendanceRecord['status'] }[];
  contents:    { className: string; date: string; title: string; content: string; homework: string }[];
  errors:      string[];
}

export function parseExcelFile(buffer: ArrayBuffer): ImportResult {
  const wb = XLSX.read(buffer, { type: 'array' });
  const result: ImportResult = {
    students: [], classes: [], enrollments: [],
    attendances: [], contents: [], errors: [],
  };

  const STATUS_MAP: Record<string, Enrollment['status']> = {
    '수강중': 'active', '수강 중': 'active', 'active': 'active',
    '일시중단': 'paused', '일시 중단': 'paused', 'paused': 'paused',
    '취소': 'cancelled', 'cancelled': 'cancelled',
  };

  const ATT_MAP: Record<string, AttendanceRecord['status']> = {
    '출석': 'present', 'present': 'present',
    '지각': 'late',    'late': 'late',
    '결석': 'absent',  'absent': 'absent',
    '공결': 'excused', 'excused': 'excused',
  };

  // 학생목록
  const ws1 = wb.Sheets['학생목록'];
  if (ws1) {
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws1, { defval: '' });
    for (const r of rows) {
      const name = str(r['이름*'] ?? r['이름']);
      if (!name) continue;
      result.students.push({
        name,
        phone:    str(r['연락처']),
        email:    str(r['이메일']),
        joinDate: str(r['등록일(YYYY-MM-DD)'] ?? r['등록일']),
        memo:     str(r['메모']),
      });
    }
  }

  // 수업목록
  const ws2 = wb.Sheets['수업목록'];
  if (ws2) {
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws2, { defval: '' });
    for (const r of rows) {
      const name = str(r['수업명*'] ?? r['수업명']);
      if (!name) continue;
      const daysRaw = str(r['요일(쉼표구분)*'] ?? r['요일']);
      const days = daysRaw.split(/[,，、\s]+/).map((d) => d.trim()).filter(Boolean) as ClassSession['days'];
      result.classes.push({
        name,
        level:       (str(r['레벨']) || '초급') as ClassSession['level'],
        days,
        startTime:   str(r['시작시간*'] ?? r['시작시간']),
        endTime:     str(r['종료시간*'] ?? r['종료시간']),
        fee:         Number(r['수강료']) || 0,
        maxStudents: Number(r['최대인원']) || 8,
        description: str(r['설명']),
        color:       str(r['색상코드']) || '#93c5fd',
      });
    }
  }

  // 수강등록
  const ws3 = wb.Sheets['수강등록'];
  if (ws3) {
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws3, { defval: '' });
    for (const r of rows) {
      const sn = str(r['학생이름*'] ?? r['학생이름']);
      const cn = str(r['수업명*'] ?? r['수업명']);
      if (!sn || !cn) continue;
      const rawStatus = str(r['상태(수강중/일시중단/취소)'] ?? r['상태']);
      result.enrollments.push({
        studentName: sn,
        className:   cn,
        enrollDate:  str(r['등록일(YYYY-MM-DD)'] ?? r['등록일']) || new Date().toISOString().slice(0, 10),
        status:      STATUS_MAP[rawStatus] ?? 'active',
      });
    }
  }

  // 출석기록
  const ws4 = wb.Sheets['출석기록'];
  if (ws4) {
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws4, { defval: '' });
    for (const r of rows) {
      const sn = str(r['학생이름*'] ?? r['학생이름']);
      const cn = str(r['수업명*'] ?? r['수업명']);
      const date = str(r['날짜(YYYY-MM-DD)*'] ?? r['날짜']);
      const rawAtt = str(r['상태(출석/지각/결석/공결)*'] ?? r['상태']);
      if (!sn || !cn || !date) continue;
      const status = ATT_MAP[rawAtt];
      if (!status) {
        result.errors.push(`출석기록: "${rawAtt}"은 알 수 없는 상태입니다 (행: ${sn}, ${date})`);
        continue;
      }
      result.attendances.push({ studentName: sn, className: cn, date, status });
    }
  }

  // 수업내용
  const ws5 = wb.Sheets['수업내용'];
  if (ws5) {
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws5, { defval: '' });
    for (const r of rows) {
      const cn = str(r['수업명*'] ?? r['수업명']);
      const date = str(r['날짜(YYYY-MM-DD)*'] ?? r['날짜']);
      const title = str(r['제목*'] ?? r['제목']);
      if (!cn || !date || !title) continue;
      result.contents.push({
        className: cn,
        date,
        title,
        content:  str(r['수업내용']),
        homework: str(r['숙제']),
      });
    }
  }

  return result;
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────
function str(v: unknown): string {
  if (v == null) return '';
  return String(v).trim();
}

function sheetFrom(
  headers: string[],
  rows: (string | number)[][][0][],  // any[][]
  cols?: { wch: number }[],
): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...(rows as (string|number)[][])]);
  if (cols) ws['!cols'] = cols;
  return ws;
}
