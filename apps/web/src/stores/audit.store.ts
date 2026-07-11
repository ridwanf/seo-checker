import { create } from 'zustand';
import type { AuditReport } from "@seo-checker/shared-types";

interface AuditState {
  report: AuditReport | null;
  isLoading: boolean;
  error: string | null;
  analyzedUrl: string;
  message: string | null;

  setReport: (report: AuditReport) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setMessage: (message: string | null) => void;
  setAnalyzedUrl: (url: string) => void;
  reset: () => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  report: null,
  isLoading: false,
  error: null,
  message: null,
  analyzedUrl: '',

  setReport: (report) => set({ report, error: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setMessage: (message) => set({ message, isLoading: false }),
  setAnalyzedUrl: (analyzedUrl) => set({ analyzedUrl }),
  reset: () => set({ report: null, error: null, isLoading: false, analyzedUrl: '' }),

}))