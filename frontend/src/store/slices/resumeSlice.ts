/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StateCreator } from 'zustand';
import { type RootState } from '../index';
import { mockittAPI } from '../../services/api';

export interface Resume {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  analysisScore?: number;
  atsScore?: number;
  skillsFound: string[];
  skillsGaps: string[];
  strengths: string[];
  improvements: string[];
  suggestions: {
    formatting: string[];
    content: string[];
    keywords: string[];
  };
  isAnalyzed: boolean;
  analyzedAt?: string;
  createdAt: string;
  updatedAt: string;
  provider?: string;
  version: number;
  previousVersionId?: string;
  isCurrentVersion: boolean;
}

export interface AnalysisResult {
  id: string;
  analysisScore: number;
  atsScore: number;
  skillsFound: string[];
  skillsGaps: string[];
  strengths: string[];
  improvements: string[];
  suggestions: {
    formatting: string[];
    content: string[];
    keywords: string[];
  };
  analyzedAt: string;
  provider: string;
}

export interface ResumeSlice {
  // State
  resumes: Resume[];
  currentResume: Resume | null;
  analysisResults: Record<string, AnalysisResult>;
  resumeLoading: boolean;
  resumeError: string | null;
  uploadProgress: Record<string, number>;

  // Actions
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  removeResume: (id: string) => void;
  setCurrentResume: (resume: Resume | null) => void;
  setAnalysisResult: (resumeId: string, result: AnalysisResult) => void;
  setResumeLoading: (loading: boolean) => void;
  setResumeError: (error: string | null) => void;
  setUploadProgress: (fileId: string, progress: number) => void;

  // Async actions
  fetchResumes: () => Promise<void>;
  uploadResume: (file: File, autoAnalyze?: boolean) => Promise<Resume>;
  analyzeResume: (resumeId: string) => Promise<AnalysisResult>;
  deleteResume: (resumeId: string) => Promise<void>;
}

export const resumeSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  ResumeSlice
> = (set, get) => ({
  // Initial state
  resumes: [],
  currentResume: null,
  analysisResults: {},
  resumeLoading: false,
  resumeError: null,
  uploadProgress: {},

  // Sync actions
  setResumes: (resumes: Resume[]) => {
    set((state) => {
      state.resumes = resumes;
    });
  },

  addResume: (resume: Resume) => {
    set((state) => {
      state.resumes.unshift(resume);
    });
  },

  updateResume: (id: string, updates: Partial<Resume>) => {
    set((state) => {
      const index = state.resumes.findIndex((r) => r.id === id);
      if (index !== -1) {
        state.resumes[index] = { ...state.resumes[index], ...updates };
      }
      if (state.currentResume?.id === id) {
        state.currentResume = { ...state.currentResume, ...updates };
      }
    });
  },

  removeResume: (id: string) => {
    set((state) => {
      state.resumes = state.resumes.filter((r) => r.id !== id);
      if (state.currentResume?.id === id) {
        state.currentResume = null;
      }
      delete state.analysisResults[id];
    });
  },

  setCurrentResume: (resume: Resume | null) => {
    set((state) => {
      state.currentResume = resume;
    });
  },

  setAnalysisResult: (resumeId: string, result: AnalysisResult) => {
    set((state) => {
      state.analysisResults[resumeId] = result;
    });
  },

  setResumeLoading: (loading: boolean) => {
    set((state) => {
      state.resumeLoading = loading;
    });
  },

  setResumeError: (error: string | null) => {
    set((state) => {
      state.resumeError = error;
    });
  },

  setUploadProgress: (fileId: string, progress: number) => {
    set((state) => {
      state.uploadProgress[fileId] = progress;
    });
  },

  // Async actions
  fetchResumes: async () => {
    set((state) => {
      state.resumeLoading = true;
      state.resumeError = null;
    });

    try {
      const resumes = await mockittAPI.resumes.getAll();
      
      set((state) => {
        state.resumes = resumes;
        state.resumeLoading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.resumeError = error.response?.data?.message || error.message;
        state.resumeLoading = false;
      });
      get().handleApiError(error, 'fetchResumes');
    }
  },

  uploadResume: async (file: File, autoAnalyze = true): Promise<Resume> => {
    set((state) => {
      state.resumeLoading = true;
    });

    try {
      const resumeData = await mockittAPI.resumes.upload(file, autoAnalyze);
      
      const newResume: Resume = {
        id: resumeData.id,
        originalName: resumeData.originalName,
        fileSize: resumeData.fileSize,
        mimeType: resumeData.mimeType,
        skillsFound: resumeData.skillsFound || [],
        skillsGaps: resumeData.skillsGaps || [],
        strengths: resumeData.strengths || [],
        improvements: resumeData.improvements || [],
        suggestions: resumeData.suggestions || {
          formatting: [],
          content: [],
          keywords: [],
        },
        isAnalyzed: resumeData.autoAnalyzed || false,
        analyzedAt: resumeData.analyzedAt,
        createdAt: resumeData.uploadedAt,
        updatedAt: resumeData.uploadedAt,
        analysisScore: resumeData.analysisScore,
        atsScore: resumeData.atsScore,
        provider: resumeData.provider,
        version: resumeData.version || 1,
        isCurrentVersion: true,
      };

      set((state) => {
        state.resumes.unshift(newResume);
        state.resumeLoading = false;
      });

      return newResume;
    } catch (error: any) {
      set((state) => {
        state.resumeLoading = false;
      });
      get().handleApiError(error, 'uploadResume');
      throw error;
    }
  },

  analyzeResume: async (resumeId: string): Promise<AnalysisResult> => {
    try {
      const result = await mockittAPI.resumes.analyze(resumeId);
      
      const analysisResult: AnalysisResult = {
        id: result.id,
        analysisScore: result.analysisScore,
        atsScore: result.atsScore,
        skillsFound: result.skillsFound,
        skillsGaps: result.skillsGaps,
        strengths: result.strengths,
        improvements: result.improvements,
        suggestions: result.suggestions,
        analyzedAt: result.analyzedAt,
        provider: result.provider,
      };

      // Update resume with analysis results
      get().updateResume(resumeId, {
        isAnalyzed: true,
        analysisScore: result.analysisScore,
        atsScore: result.atsScore,
        analyzedAt: result.analyzedAt,
      });

      set((state) => {
        state.analysisResults[resumeId] = analysisResult;
      });

      return analysisResult;
    } catch (error: any) {
      get().handleApiError(error, 'analyzeResume');
      throw error;
    }
  },

  deleteResume: async (resumeId: string): Promise<void> => {
    try {
      await mockittAPI.resumes.delete(resumeId);
      
      set((state) => {
        state.resumes = state.resumes.filter((r) => r.id !== resumeId);
        if (state.currentResume?.id === resumeId) {
          state.currentResume = null;
        }
        delete state.analysisResults[resumeId];
      });
    } catch (error: any) {
      get().handleApiError(error, 'deleteResume');
      throw error;
    }
  },
});
