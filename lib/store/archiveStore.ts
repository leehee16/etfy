import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Report {
  id: string;
  title: string;
  content: string;
  date: string;
  userId: string;
  metadata?: {
    createdAt: string;
    sessionCount: number;
    contexts: string[];
  };
}

interface ArchiveStore {
  reports: {
    [userId: string]: Report[];
  };
  addReport: (report: Report) => void;
  removeReport: (userId: string, reportId: string) => void;
}

export const useArchiveStore = create<ArchiveStore>()(
  persist(
    (set) => ({
      reports: {},
      addReport: (report) => set((state) => {
        const userReports = state.reports[report.userId] || [];
        return {
          reports: {
            ...state.reports,
            [report.userId]: [...userReports, report]
          }
        };
      }),
      removeReport: (userId, reportId) => set((state) => ({
        reports: {
          ...state.reports,
          [userId]: state.reports[userId]?.filter(report => report.id !== reportId) || []
        }
      })),
    }),
    {
      name: 'archive-storage',
    }
  )
); 