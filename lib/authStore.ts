'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ADMIN_MASTER = '008285';
const STUDENT_MASTER = '8285';

interface AuthStore {
  adminLoggedIn: boolean;
  loggedInStudentId: string | null;

  adminLogin: (pw: string) => boolean;
  adminLogout: () => void;

  studentLogin: (studentId: string, phone: string, input: string) => boolean;
  studentLogout: () => void;
}

/** 핸드폰 번호에서 마지막 4자리 숫자 추출 */
export function phoneLast4(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-4);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      adminLoggedIn: false,
      loggedInStudentId: null,

      adminLogin: (pw) => {
        if (pw === ADMIN_MASTER) {
          set({ adminLoggedIn: true });
          return true;
        }
        return false;
      },

      adminLogout: () => set({ adminLoggedIn: false, loggedInStudentId: null }),

      studentLogin: (studentId, phone, input) => {
        const correct = phoneLast4(phone);
        if (input === STUDENT_MASTER || input === correct) {
          set({ loggedInStudentId: studentId });
          return true;
        }
        return false;
      },

      studentLogout: () => set({ loggedInStudentId: null }),
    }),
    { name: 'mr-russian-auth' },
  ),
);
