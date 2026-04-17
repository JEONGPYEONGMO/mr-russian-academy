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
    setDoc(doc(db, 'classes', c.id), c);
  },
  updateClass: (c) => {
    set((s) => ({ classes: s.classes.map((x) => (x.id === c.id ? c : x)) }));
    setDoc(doc(db, 'classes', c.id), c);
  },
  deleteClass: (id) => {
    set((s) => ({ classes: s.classes.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'classes', id));
  },

  // ── Students ───────────────────────────────────────────────────
  addStudent: (st) => {
    set((s) => ({ students: [...s.students, st] }));
    setDoc(doc(db, 'students', st.id), st);
  },
  updateStudent: (st) => {
    set((s) => ({ students: s.students.map((x) => (x.id === st.id ? st : x)) }));
    setDoc(doc(db, 'students', st.id), st);
  },
  deleteStudent: (id) => {
    set((s) => ({ students: s.students.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'students', id));
  },

  // ── Enrollments ────────────────────────────────────────────────
  addEnrollment: (e) => {
    set((s) => ({ enrollments: [...s.enrollments, e] }));
    setDoc(doc(db, 'enrollments', e.id), e);
  },
  updateEnrollment: (e) => {
    set((s) => ({ enrollments: s.enrollments.map((x) => (x.id === e.id ? e : x)) }));
    setDoc(doc(db, 'enrollments', e.id), e);
  },
  removeEnrollment: (id) => {
    set((s) => ({ enrollments: s.enrollments.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'enrollments', id));
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
    setDoc(doc(db, 'attendances', a.id), a);
  },

  // ── Content ────────────────────────────────────────────────────
  addContent: (c) => {
    set((s) => ({ contents: [...s.contents, c] }));
    setDoc(doc(db, 'contents', c.id), c);
  },
  updateContent: (c) => {
    set((s) => ({ contents: s.contents.map((x) => (x.id === c.id ? c : x)) }));
    setDoc(doc(db, 'contents', c.id), c);
  },
  deleteContent: (id) => {
    set((s) => ({ contents: s.contents.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'contents', id));
  },

  // ── Notices ────────────────────────────────────────────────────
  addNotice: (n) => {
    set((s) => ({ notices: [n, ...s.notices] }));
    setDoc(doc(db, 'notices', n.id), n);
  },
  deleteNotice: (id) => {
    set((s) => ({ notices: s.notices.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'notices', id));
  },

  // ── Instructors ────────────────────────────────────────────────
  addInstructor: (i) => {
    set((s) => ({ instructors: [...s.instructors, i] }));
    setDoc(doc(db, 'instructors', i.id), i);
  },
  updateInstructor: (i) => {
    set((s) => ({ instructors: s.instructors.map((x) => (x.id === i.id ? i : x)) }));
    setDoc(doc(db, 'instructors', i.id), i);
  },

  // ── Messages ───────────────────────────────────────────────────
  sendMessage: (m) => {
    set((s) => ({ messages: [m, ...s.messages] }));
    setDoc(doc(db, 'messages', m.id), m);
  },
  deleteMessage: (id) => {
    set((s) => ({ messages: s.messages.filter((x) => x.id !== id) }));
    deleteDoc(doc(db, 'messages', id));
  },
  markMessageRead: (id) => {
    set((s) => ({
      messages: s.messages.map((x) => (x.id === id ? { ...x, read: true } : x)),
    }));
    setDoc(doc(db, 'messages', id), { read: true }, { merge: true });
  },
}));
