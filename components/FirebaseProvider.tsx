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
      if (ready.has(col)) return;
      ready.add(col);
      if (ready.size === COLLECTIONS.length) {
        useAcademyStore.setState({ loading: false });
      }
    }

    // 리스너 즉시 등록 — 시드 완료를 기다리지 않음
    const unsubs = [
      onSnapshot(
        collection(db, 'instructors'),
        (snap) => {
          useAcademyStore.setState({ instructors: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Instructor)) });
          markReady('instructors');
        },
        () => markReady('instructors'), // 오류 시에도 ready 처리
      ),
      onSnapshot(
        collection(db, 'classes'),
        (snap) => {
          useAcademyStore.setState({ classes: snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassSession)) });
          markReady('classes');
        },
        () => markReady('classes'),
      ),
      onSnapshot(
        collection(db, 'students'),
        (snap) => {
          useAcademyStore.setState({ students: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)) });
          markReady('students');
        },
        () => markReady('students'),
      ),
      onSnapshot(
        collection(db, 'enrollments'),
        (snap) => {
          useAcademyStore.setState({ enrollments: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Enrollment)) });
          markReady('enrollments');
        },
        () => markReady('enrollments'),
      ),
      onSnapshot(
        collection(db, 'attendances'),
        (snap) => {
          useAcademyStore.setState({ attendances: snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord)) });
          markReady('attendances');
        },
        () => markReady('attendances'),
      ),
      onSnapshot(
        collection(db, 'contents'),
        (snap) => {
          useAcademyStore.setState({ contents: snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassContent)) });
          markReady('contents');
        },
        () => markReady('contents'),
      ),
      onSnapshot(
        collection(db, 'notices'),
        (snap) => {
          useAcademyStore.setState({ notices: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notice)) });
          markReady('notices');
        },
        () => markReady('notices'),
      ),
      onSnapshot(
        collection(db, 'messages'),
        (snap) => {
          useAcademyStore.setState({ messages: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)) });
          markReady('messages');
        },
        () => markReady('messages'),
      ),
    ];

    // 시드는 병렬로 실행 (리스너와 무관)
    seedIfNeeded().catch(console.error);

    // 10초 안에 로드 안 되면 강제 해제
    const timeout = setTimeout(() => {
      useAcademyStore.setState({ loading: false });
    }, 10000);

    return () => {
      unsubs.forEach((u) => u());
      clearTimeout(timeout);
    };
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
