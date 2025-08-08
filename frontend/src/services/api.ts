/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ API Service Methods for Your Mockitt Platform
export const mockittAPI = {
  // Authentication endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    register: async (userData: any) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    logout: async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    },
    getProfile: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  },

  // Resume endpoints
  resumes: {
    getAll: async () => {
      const response = await api.get('/resumes');
      return response.data;
    },
    upload: async (file: File, autoAnalyze = true) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('autoAnalyze', autoAnalyze.toString());

      const response = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    analyze: async (resumeId: string) => {
      const response = await api.post(`/resumes/${resumeId}/analyze`);
      return response.data;
    },
    getAnalysis: async (resumeId: string) => {
      const response = await api.get(`/resumes/${resumeId}/analysis`);
      return response.data;
    },
    delete: async (resumeId: string) => {
      const response = await api.delete(`/resumes/${resumeId}`);
      return response.data;
    },
  },

  // Interview endpoints
  interviews: {
    getSessions: async () => {
      const response = await api.get('/interviews/sessions');
      return response.data;
    },
    createSession: async (sessionData: any) => {
      const response = await api.post('/interviews/sessions', sessionData);
      return response.data;
    },
    getSession: async (sessionId: string) => {
      const response = await api.get(`/interviews/sessions/${sessionId}`);
      return response.data;
    },
    updateSession: async (sessionId: string, updates: any) => {
      const response = await api.put(`/interviews/sessions/${sessionId}`, updates);
      return response.data;
    },
    deleteSession: async (sessionId: string) => {
      const response = await api.delete(`/interviews/sessions/${sessionId}`);
      return response.data;
    },
    startSession: async (sessionId: string) => {
      const response = await api.post(`/interviews/sessions/${sessionId}/start`);
      return response.data;
    },
    endSession: async (sessionId: string) => {
      const response = await api.post(`/interviews/sessions/${sessionId}/end`);
      return response.data;
    },
    generateQuestions: async (context: any) => {
      const response = await api.post('/interviews/questions/generate', context);
      return response.data;
    },
    saveResponse: async (responseData: any) => {
      const response = await api.post('/interviews/responses', responseData);
      return response.data;
    },
    getResults: async (sessionId: string) => {
      const response = await api.get(`/interviews/sessions/${sessionId}/results`);
      return response.data;
    },
  },

  // AI services
  ai: {
    analyzeResume: async (resumeData: any) => {
      const response = await api.post('/ai/analyze/resume', resumeData);
      return response.data;
    },
    analyzeRealTime: async (analysisData: {
      spokenText: string;
      currentQuestion: string;
      targetRole: string;
      industry: string;
    }) => {
      const response = await api.post('/ai/analyze/real-time', analysisData);
      return response.data;
    },

    getInstantTips: async (coachingData: {
      currentResponse: string;
      context: {
        targetRole?: string;
        industry?: string;
        currentQuestion?: string;
      };
    }) => {
      const response = await api.post('/ai/coaching/instant-tips', coachingData);
      return response.data;
    },

    generateFollowUp: async (followUpData: {
      originalQuestion: string;
      userResponse: string;
      context: {
        targetRole?: string;
        industry?: string;
      };
    }) => {
      const response = await api.post('/ai/questions/follow-up', followUpData);
      return response.data;
    },

    generateQuestions: async (questionData: {
      targetRole: string;
      targetIndustry: string;
      difficulty: string;
      questionTypes: string[];
      count: number;
    }) => {
      const response = await api.post('/ai/questions/generate', questionData);
      return response.data;
    },

    analyzeSpeech: async (speechData: {
      transcription: string;
      duration: number;
      audioUrl?: string;
    }) => {
      const response = await api.post('/ai/speech/analyze', speechData);
      return response.data;
    },
  },
};

export default api;
