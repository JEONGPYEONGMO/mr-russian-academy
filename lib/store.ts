'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ClassSession, Student, Enrollment, AttendanceRecord,
  ClassContent, Notice, Instructor, Message
} from './types';

// ── 초기 시드 데이터 (시간표 이미지 기반) ─────────────────────────
const defaultInstructors: Instructor[] = [
  { id: 'i1', name: '임미란', type: '한국인 강사', phone: '010-0000-0001', email: 'miran@mr-russian.com' },
  { id: 'i2', name: '원어민 강사', type: '원어민 강사', phone: '010-0000-0002', email: 'native@mr-russian.com' },
];

const defaultClasses: ClassSession[] = [
  {
    id: 'c1',
    name: '임미란 초급반',
    level: '초급',
    instructorId: 'i1',
    days: ['화', '목'],
    startTime: '13:00',
    endTime: '15:00',
    fee: 250000,
    maxStudents: 8,
    description: '러시아어 기초 문법과 회화',
    color: '#f9a8d4', // pink-300
  },
  {
    id: 'c2',
    name: '원어민 중급반',
    level: '중급',
    instructorId: 'i2',
    days: ['수', '금'],
    startTime: '19:30',
    endTime: '21:30',
    fee: 250000,
    maxStudents: 8,
    description: '원어민과 함께하는 중급 회화',
    color: '#fdba74', // orange-300
  },
  {
    id: 'c3',
    name: '임미란 고급반',
    level: '고급',
    instructorId: 'i1',
    days: ['일'],
    startTime: '18:00',
    endTime: '21:00',
    fee: 250000,
    maxStudents: 6,
    description: '고급 문법 및 작문, 독해',
    color: '#86efac', // green-300
  },
];

const defaultStudents: Student[] = [
  { id: 's1', name: '김민지', phone: '010-1111-0001', email: 'minji@example.com', enrolledClassIds: ['c1'], joinDate: '2024-03-01', memo: '' },
  { id: 's2', name: '이서준', phone: '010-1111-0002', email: 'seojun@example.com', enrolledClassIds: ['c1', 'c2'], joinDate: '2024-03-01', memo: '수요일 늦을 수 있음' },
  { id: 's3', name: '박지원', phone: '010-1111-0003', email: 'jiwon@example.com', enrolledClassIds: ['c2'], joinDate: '2024-04-01', memo: '' },
  { id: 's4', name: '최수아', phone: '010-1111-0004', email: 'sua@example.com', enrolledClassIds: ['c3'], joinDate: '2024-02-01', memo: '고급 전 중급 이수 완료' },
  { id: 's5', name: '정태양', phone: '010-1111-0005', email: 'taeyang@example.com', enrolledClassIds: ['c1'], joinDate: '2024-05-01', memo: '' },
];

const defaultEnrollments: Enrollment[] = [
  { id: 'e1', studentId: 's1', classId: 'c1', enrollDate: '2024-03-01', status: 'active' },
  { id: 'e2', studentId: 's2', classId: 'c1', enrollDate: '2024-03-01', status: 'active' },
  { id: 'e3', studentId: 's2', classId: 'c2', enrollDate: '2024-03-01', status: 'active' },
  { id: 'e4', studentId: 's3', classId: 'c2', enrollDate: '2024-04-01', status: 'active' },
  { id: 'e5', studentId: 's4', classId: 'c3', enrollDate: '2024-02-01', status: 'active' },
  { id: 'e6', studentId: 's5', classId: 'c1', enrollDate: '2024-05-01', status: 'active' },
];

// ── Store 타입 ─────────────────────────────────────────────────────
interface AcademyStore {
  instructors: Instructor[];
  classes: ClassSession[];
  students: Student[];
  enrollments: Enrollment[];
  attendances: AttendanceRecord[];
  contents: ClassContent[];
  notices: Notice[];

  // Classes
  addClass: (c: ClassSession) => void;
  updateClass: (c: ClassSession) => void;
  deleteClass: (id: string) => void;

  // Students
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;

  // Enrollments
  addEnrollment: (e: Enrollment) => void;
  updateEnrollment: (e: Enrollment) => void;
  removeEnrollment: (id: string) => void;

  // Attendance
  upsertAttendance: (a: AttendanceRecord) => void;

  // Content
  addContent: (c: ClassContent) => void;
  updateContent: (c: ClassContent) => void;
  deleteContent: (id: string) => void;

  // Notices
  addNotice: (n: Notice) => void;
  deleteNotice: (id: string) => void;

  // Instructors
  addInstructor: (i: Instructor) => void;
  updateInstructor: (i: Instructor) => void;

  // Messages
  messages: Message[];
  sendMessage: (m: Message) => void;
  deleteMessage: (id: string) => void;
  markMessageRead: (id: string) => void;
}

export const useAcademyStore = create<AcademyStore>()(
  persist(
    (set) => ({
      instructors: defaultInstructors,
      classes: defaultClasses,
      students: defaultStudents,
      enrollments: defaultEnrollments,
      attendances: [],
      contents: [],
      notices: [
        {
          id: 'n1',
          classId: null,
          title: '🎉 MR Russian 어학원 오픈 안내',
          body: '안녕하세요. MR Russian 어학원에 오신 것을 환영합니다!\n수강 문의는 각 강사에게 직접 연락 주시기 바랍니다.',
          createdAt: new Date().toISOString(),
        },
      ],

      addClass: (c) => set((s) => ({ classes: [...s.classes, c] })),
      updateClass: (c) => set((s) => ({ classes: s.classes.map((x) => x.id === c.id ? c : x) })),
      deleteClass: (id) => set((s) => ({ classes: s.classes.filter((x) => x.id !== id) })),

      addStudent: (st) => set((s) => ({ students: [...s.students, st] })),
      updateStudent: (st) => set((s) => ({ students: s.students.map((x) => x.id === st.id ? st : x) })),
      deleteStudent: (id) => set((s) => ({ students: s.students.filter((x) => x.id !== id) })),

      addEnrollment: (e) => set((s) => ({ enrollments: [...s.enrollments, e] })),
      updateEnrollment: (e) => set((s) => ({ enrollments: s.enrollments.map((x) => x.id === e.id ? e : x) })),
      removeEnrollment: (id) => set((s) => ({ enrollments: s.enrollments.filter((x) => x.id !== id) })),

      upsertAttendance: (a) =>
        set((s) => {
          const idx = s.attendances.findIndex((x) => x.classId === a.classId && x.studentId === a.studentId && x.date === a.date);
          if (idx >= 0) {
            const updated = [...s.attendances];
            updated[idx] = a;
            return { attendances: updated };
          }
          return { attendances: [...s.attendances, a] };
        }),

      addContent: (c) => set((s) => ({ contents: [...s.contents, c] })),
      updateContent: (c) => set((s) => ({ contents: s.contents.map((x) => x.id === c.id ? c : x) })),
      deleteContent: (id) => set((s) => ({ contents: s.contents.filter((x) => x.id !== id) })),

      addNotice: (n) => set((s) => ({ notices: [n, ...s.notices] })),
      deleteNotice: (id) => set((s) => ({ notices: s.notices.filter((x) => x.id !== id) })),

      addInstructor: (i) => set((s) => ({ instructors: [...s.instructors, i] })),
      updateInstructor: (i) => set((s) => ({ instructors: s.instructors.map((x) => x.id === i.id ? i : x) })),

      messages: [],
      sendMessage: (m) => set((s) => ({ messages: [m, ...s.messages] })),
      deleteMessage: (id) => set((s) => ({ messages: s.messages.filter((x) => x.id !== id) })),
      markMessageRead: (id) => set((s) => ({
        messages: s.messages.map((x) => x.id === id ? { ...x, read: true } : x),
      })),
    }),
    { name: 'mr-russian-store' }
  )
);
