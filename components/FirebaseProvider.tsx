'use client';

import { useEffect } from 'react';
import {
  collection, doc, getDoc, onSnapshot, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAcademyStore } from '@/lib/store';
import {
  ClassSession, Student, Enrollment, AttendanceRecord,
  ClassContent, Notice, Instructor, Message,
} from '@/lib/types';
import {
  defaultInstructors, defaultClasses, defaultStudents,
  defaultEnrollments, defaultNotices,
} from '@/lib/defaultData';

const COLLECTIONS = [
  'instructors', 'classes', 'students', 'enrollments',
  'attendances', 'contents', 'notices', 'messages',
] as const;

/** 최초 실행 시 Firestore에 기본 데이터를 넣는다 */
async function seedIfNeeded() {
  const metaRef = doc(db, 'meta', 'seeded');
  const snap = await getDoc(metaRef);
  if (snap.exists()) return;

  const batch = writeBatch(db);
  defaultInstructors.forEach((i) => batch.set(doc(db, 'instructors', i.id), i));
  defaultClasses.forEach((c) => batch.set(doc(db, 'classes', c.id), c));
  defaultStudents.forEach((s) => batch.set(doc(db, 'students', s.id), s));
  defaultEnrollments.forEach((e) => batch.set(doc(db, 'enrollments', e.id), e));
  defaultNotices.forEach((n) => batch.set(doc(db, 'notices', n.id), n));
  batch.set(metaRef, { seeded: true });
  await batch.commit();
}

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const loading = useAcademyStore((s) => s.loading);

  useEffect(() => {
    const ready = new Set<string>();

    function markReady(col: string) {
      ready.add(col);
      if (ready.size === COLLECTIONS.length) {
        useAcademyStore.setState({ loading: false });
      }
    }

    // 시드 후 리스너 등록
    seedIfNeeded().then(() => {
      const unsubs = [
        onSnapshot(collection(db, 'instructors'), (snap) => {
          useAcademyStore.setState({
            instructors: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Instructor)),
          });
          markReady('instructors');
        }),

        onSnapshot(collection(db, 'classes'), (snap) => {
          useAcademyStore.setState({
            classes: snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassSession)),
          });
          markReady('classes');
        }),

        onSnapshot(collection(db, 'students'), (snap) => {
          useAcademyStore.setState({
            students: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)),
          });
          markReady('students');
        }),

        onSnapshot(collection(db, 'enrollments'), (snap) => {
          useAcademyStore.setState({
            enrollments: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Enrollment)),
          });
          markReady('enrollments');
        }),

        onSnapshot(collection(db, 'attendances'), (snap) => {
          useAcademyStore.setState({
            attendances: snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord)),
          });
          markReady('attendances');
        }),

        onSnapshot(collection(db, 'contents'), (snap) => {
          useAcademyStore.setState({
            contents: snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassContent)),
          });
          markReady('contents');
        }),

        onSnapshot(collection(db, 'notices'), (snap) => {
          useAcademyStore.setState({
            notices: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notice)),
          });
          markReady('notices');
        }),

        onSnapshot(collection(db, 'messages'), (snap) => {
          useAcademyStore.setState({
            messages: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)),
          });
          markReady('messages');
        }),
      ];

      // 언마운트 시 리스너 해제
      return () => unsubs.forEach((u) => u());
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">데이터 불러오는 중…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
