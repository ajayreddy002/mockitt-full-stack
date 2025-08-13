import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const courseApi = axios.create({
  baseURL: `${API_BASE_URL}/courses`,
});

// Add auth token to requests
courseApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const courseApiService = {
  getAllCourses: async (filters = {}) => {
    const response = await courseApi.get('', { params: filters });
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await courseApi.get(`/${id}`);
    return response.data;
  },

  getEnrolledCourses: async () => {
    const response = await courseApi.get('/my-courses');
    return response.data;
  },

  enrollInCourse: async (courseId: string, enrollmentData = {}) => {
    const response = await courseApi.post(`/${courseId}/enroll`, enrollmentData);
    return response.data;
  },

  getCourseProgress: async (courseId: string) => {
    const response = await courseApi.get(`/${courseId}/progress`);
    return response.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateLessonProgress: async (lessonId: string, progressData: any) => {
    const response = await courseApi.patch(`/lessons/${lessonId}/progress`, progressData);
    return response.data;
  },

  getCourseModules: async (courseId: string) => {
    const response = await courseApi.get(`/${courseId}/modules`);
    return response.data;
  },
};
