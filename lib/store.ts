'use client';

import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  ClassSession, Student, Enrollment, AttendanceRecord,
  ClassContent, Notice, Instructor, Message
} from './types';

// ── Store 타입 ─────────────────────────────────────────────────────
interface AcademyStore {
  loading: boolean;

  instructors: Instructor[];
  classes: ClassSession[];
  students: Student[];
  enrollments: Enrollment[];
  attendances: AttendanceRecord[];
  contents: ClassContent[];
  notices: Notice[];
  messages: Message[];

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
  sendMessage: (m: Message) => void;
  deleteMessage: (id: string) => void;
  markMessageRead: (id: string) => void;
}

export const useAcademyStore = create<AcademyStore>()((set) => ({
  loading: true,

  instructors: [],
  classes: [],
  students: [],
  enrollments: [],
  attendances: [],
  contents: [],
  notices: [],
  messages: [],

  // ── Classes ────────────────────────────────────────────────────
  addClass: (c) => {
    set((s) => ({ classes: [...s.classes, c] }));
    setDoc(doc(db, 'classes', c.id), c).catch((e) => console.error('[FB] addClass:', e));
  },
  updateClass: (c) => {
    set((s) => ({ classes: s.classes.map((x) => (x.id === c.id ? c : x)) }));
    setDoc(doc(db, 'classes', c.id), c).catch((e) => console.error('[FB] updateClass:', e));
  },
  deleteClass: (id) => {
    set((s) => ({ classes: s.classes.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'classes', id)).catch((e) => console.error('[FB] deleteClass:', e));
  },

  // ── Students ───────────────────────────────────────────────────
  addStudent: (st) => {
    set((s) => ({ students: [...s.students, st] }));
    setDoc(doc(db, 'students', st.id), st).catch((e) => console.error('[FB] addStudent:', e));
  },
  updateStudent: (st) => {
    set((s) => ({ students: s.students.map((x) => (x.id === st.id ? st : x)) }));
    setDoc(doc(db, 'students', st.id), st).catch((e) => console.error('[FB] updateStudent:', e));
  },
  deleteStudent: (id) => {
    set((s) => ({ students: s.students.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'students', id)).catch((e) => console.error('[FB] deleteStudent:', e));
  },

  // ── Enrollments ────────────────────────────────────────────────
  addEnrollment: (e) => {
    set((s) => ({ enrollments: [...s.enrollments, e] }));
    setDoc(doc(db, 'enrollments', e.id), e).catch((e2) => console.error('[FB] addEnrollment:', e2));
  },
  updateEnrollment: (e) => {
    set((s) => ({ enrollments: s.enrollments.map((x) => (x.id === e.id ? e : x)) }));
    setDoc(doc(db, 'enrollments', e.id), e).catch((e2) => console.error('[FB] updateEnrollment:', e2));
  },
  removeEnrollment: (id) => {
    set((s) => ({ enrollments: s.enrollments.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'enrollments', id)).catch((e) => console.error('[FB] removeEnrollment:', e));
  },

  // ── Attendance ─────────────────────────────────────────────────
  upsertAttendance: (a) => {
    set((s) => {
      const idx = s.attendances.findIndex(
        (x) => x.classId === a.classId && x.studentId === a.studentId && x.date === a.date,
      );
      if (idx >= 0) {
        const updated = [...s.attendances];
        updated[idx] = a;
        return { attendances: updated };
      }
      return { attendances: [...s.attendances, a] };
    });
    setDoc(doc(db, 'attendances', a.id), a).catch((e) => console.error('[FB] upsertAttendance:', e));
  },

  // ── Content ────────────────────────────────────────────────────
  addContent: (c) => {
    set((s) => ({ contents: [...s.contents, c] }));
    setDoc(doc(db, 'contents', c.id), c).catch((e) => console.error('[FB] addContent:', e));
  },
  updateContent: (c) => {
    set((s) => ({ contents: s.contents.map((x) => (x.id === c.id ? c : x)) }));
    setDoc(doc(db, 'contents', c.id), c).catch((e) => console.error('[FB] updateContent:', e));
  },
  deleteContent: (id) => {
    set((s) => ({ contents: s.contents.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'contents', id)).catch((e) => console.error('[FB] deleteContent:', e));
  },

  // ── Notices ────────────────────────────────────────────────────
  addNotice: (n) => {
    set((s) => ({ notices: [n, ...s.notices] }));
    setDoc(doc(db, 'notices', n.id), n).catch((e) => console.error('[FB] addNotice:', e));
  },
  deleteNotice: (id) => {
    set((s) => ({ notices: s.notices.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'notices', id)).catch((e) => console.error('[FB] deleteNotice:', e));
  },

  // ── Instructors ────────────────────────────────────────────────
  addInstructor: (i) => {
    set((s) => ({ instructors: [...s.instructors, i] }));
    setDoc(doc(db, 'instructors', i.id), i).catch((e) => console.error('[FB] addInstructor:', e));
  },
  updateInstructor: (i) => {
    set((s) => ({ instructors: s.instructors.map((x) => (x.id === i.id ? i : x)) }));
    setDoc(doc(db, 'instructors', i.id), i).catch((e) => console.error('[FB] updateInstructor:', e));
  },

  // ── Messages ───────────────────────────────────────────────────
  sendMessage: (m) => {
    set((s) => ({ messages: [m, ...s.messages] }));
    setDoc(doc(db, 'messages', m.id), m).catch((e) => console.error('[FB] sendMessage:', e));
  },
  deleteMessage: (id) => {
    set((s) => ({ messages: s.messages.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'messages', id)).catch((e) => console.error('[FB] deleteMessage:', e));
  },
  markMessageRead: (id) => {
    set((s) => ({
      messages: s.messages.map((x) => (x.id === id ? { ...x, read: true } : x)),
    }));
    setDoc(doc(db, 'messages', id), { read: true }, { merge: true }).catch((e) => console.error('[FB] markMessageRead:', e));
  },
}));
