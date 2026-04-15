export type Day = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export type Level = '입문' | '초급' | '중급' | '고급' | '원어민';

export type InstructorType = '한국인 강사' | '원어민 강사';

export interface Instructor {
  id: string;
  name: string;
  type: InstructorType;
  phone: string;
  email: string;
}

export interface ClassSession {
  id: string;
  name: string;
  level: Level;
  instructorId: string;
  days: Day[];
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  fee: number;
  maxStudents: number;
  description: string;
  color: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  enrolledClassIds: string[];
  joinDate: string; // ISO date
  memo: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  enrollDate: string;
  status: 'active' | 'paused' | 'cancelled';
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface ClassContent {
  id: string;
  classId: string;
  date: string;
  title: string;
  content: string;
  homework: string;
}

export interface Notice {
  id: string;
  classId: string | null; // null = 전체 공지
  title: string;
  body: string;
  createdAt: string;
}

export interface Message {
  id: string;
  studentId: string;  // 수신 학생
  content: string;
  createdAt: string;
  read: boolean;      // 학생이 읽었는지
}
