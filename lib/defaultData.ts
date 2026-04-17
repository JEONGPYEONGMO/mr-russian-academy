import { Instructor, ClassSession, Student, Enrollment, Notice } from './types';

export const defaultInstructors: Instructor[] = [
  { id: 'i1', name: '임미란', type: '한국인 강사', phone: '010-0000-0001', email: 'miran@mr-russian.com' },
  { id: 'i2', name: '원어민 강사', type: '원어민 강사', phone: '010-0000-0002', email: 'native@mr-russian.com' },
];

export const defaultClasses: ClassSession[] = [
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
    color: '#f9a8d4',
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
    color: '#fdba74',
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
    color: '#86efac',
  },
];

export const defaultStudents: Student[] = [
  { id: 's1', name: '김민지', phone: '010-1111-0001', email: 'minji@example.com', enrolledClassIds: ['c1'], joinDate: '2024-03-01', memo: '' },
  { id: 's2', name: '이서준', phone: '010-1111-0002', email: 'seojun@example.com', enrolledClassIds: ['c1', 'c2'], joinDate: '2024-03-01', memo: '수요일 늦을 수 있음' },
  { id: 's3', name: '박지원', phone: '010-1111-0003', email: 'jiwon@example.com', enrolledClassIds: ['c2'], joinDate: '2024-04-01', memo: '' },
  { id: 's4', name: '최수아', phone: '010-1111-0004', email: 'sua@example.com', enrolledClassIds: ['c3'], joinDate: '2024-02-01', memo: '고급 전 중급 이수 완료' },
  { id: 's5', name: '정태양', phone: '010-1111-0005', email: 'taeyang@example.com', enrolledClassIds: ['c1'], joinDate: '2024-05-01', memo: '' },
];

export const defaultEnrollments: Enrollment[] = [
  { id: 'e1', studentId: 's1', classId: 'c1', enrollDate: '2024-03-01', status: 'active' },
  { id: 'e2', studentId: 's2', classId: 'c1', enrollDate: '2024-03-01', status: 'active' },
  { id: 'e3', studentId: 's2', classId: 'c2', enrollDate: '2024-03-01', status: 'active' },
  { id: 'e4', studentId: 's3', classId: 'c2', enrollDate: '2024-04-01', status: 'active' },
  { id: 'e5', studentId: 's4', classId: 'c3', enrollDate: '2024-02-01', status: 'active' },
  { id: 'e6', studentId: 's5', classId: 'c1', enrollDate: '2024-05-01', status: 'active' },
];

export const defaultNotices: Notice[] = [
  {
    id: 'n1',
    classId: null,
    title: '🎉 MR Russian 어학원 오픈 안내',
    body: '안녕하세요. MR Russian 어학원에 오신 것을 환영합니다!\n수강 문의는 각 강사에게 직접 연락 주시기 바랍니다.',
    createdAt: new Date().toISOString(),
  },
];
