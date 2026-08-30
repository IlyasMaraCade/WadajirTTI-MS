import apiClient from './api';

// --- Teacher Portal API ---
export const getTeacherDashboard = () => apiClient.get('/teacher/dashboard').then(r => r.data.data);
export const getMyStudents = (params?: Record<string, string>) => apiClient.get('/teacher/students', { params }).then(r => r.data.data);
export const markAttendance = (data: any) => apiClient.post('/teacher/attendance', data).then(r => r.data.data);
export const getAttendance = (params?: Record<string, string>) => apiClient.get('/teacher/attendance', { params }).then(r => r.data.data);
export const getMyExams = () => apiClient.get('/teacher/exams').then(r => r.data.data);
export const createExam = (data: any) => apiClient.post('/teacher/exams', data).then(r => r.data.data);
export const enterMarks = (data: any) => apiClient.post('/teacher/marks', data).then(r => r.data.data);
export const getMyAssignments = () => apiClient.get('/teacher/assignments').then(r => r.data.data);
export const createAssignment = (data: any) => apiClient.post('/teacher/assignments', data).then(r => r.data.data);

// --- Principal Portal API ---
export const getPrincipalDashboard = () => apiClient.get('/principal/dashboard').then(r => r.data.data);
export const getPrincipalAttendance = (params?: Record<string, string>) => apiClient.get('/principal/attendance-monitoring', { params }).then(r => r.data.data);
export const getPrincipalPerformance = () => apiClient.get('/principal/academic-performance').then(r => r.data.data);

