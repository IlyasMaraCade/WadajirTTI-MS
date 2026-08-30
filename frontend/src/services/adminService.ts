import apiClient from './api';

// --- Admin ---
export const getDashboardStats = () => apiClient.get('/admin/dashboard-stats').then(r => r.data.data);

// --- Users ---
export const getUsers = () => apiClient.get('/users').then(r => r.data.data);
export const getUser = (id: string) => apiClient.get(`/users/${id}`).then(r => r.data.data);
export const createUser = (data: any) => apiClient.post('/users', data).then(r => r.data.data);
export const updateUser = (id: string, data: any) => apiClient.put(`/users/${id}`, data).then(r => r.data.data);
export const deactivateUser = (id: string) => apiClient.patch(`/users/${id}/deactivate`).then(r => r.data.data);

// --- Students ---
export const getStudents = (params?: Record<string, string>) => apiClient.get('/students', { params }).then(r => r.data);
export const getStudent = (id: string) => apiClient.get(`/students/${id}`).then(r => r.data.data);
export const createStudent = (data: any) => apiClient.post('/students', data).then(r => r.data.data);
export const updateStudent = (id: string, data: any) => apiClient.put(`/students/${id}`, data).then(r => r.data.data);
export const toggleStudentStatus = (id: string) => apiClient.patch(`/students/${id}/toggle-status`).then(r => r.data.data);

// --- Enrollments ---
export const getEnrollments = (params?: Record<string, string>) => apiClient.get('/students/enrollments/all', { params }).then(r => r.data.data);
export const createEnrollment = (data: any) => apiClient.post('/students/enrollments', data).then(r => r.data.data);
export const updateEnrollment = (id: string, data: any) => apiClient.put(`/students/enrollments/${id}`, data).then(r => r.data.data);

// --- Teachers ---
export const getTeachers = (params?: Record<string, string>) => apiClient.get('/teachers', { params }).then(r => r.data);
export const getTeacher = (id: string) => apiClient.get(`/teachers/${id}`).then(r => r.data.data);
export const createTeacher = (data: any) => apiClient.post('/teachers', data).then(r => r.data.data);
export const updateTeacher = (id: string, data: any) => apiClient.put(`/teachers/${id}`, data).then(r => r.data.data);

// --- Teacher Assignments ---
export const getAssignments = (params?: Record<string, string>) => apiClient.get('/teachers/assignments/all', { params }).then(r => r.data.data);
export const createAssignment = (data: any) => apiClient.post('/teachers/assignments', data).then(r => r.data.data);

// --- Timetable ---
export const getTimetable = (params?: Record<string, string>) => apiClient.get('/teachers/timetable/all', { params }).then(r => r.data.data);
export const createTimetableEntry = (data: any) => apiClient.post('/teachers/timetable', data).then(r => r.data.data);
export const updateTimetableEntry = (id: string, data: any) => apiClient.put(`/teachers/timetable/${id}`, data).then(r => r.data.data);
export const deleteTimetableEntry = (id: string) => apiClient.delete(`/teachers/timetable/${id}`);

// --- Academics ---
export const getAcademicYears = () => apiClient.get('/academics/academicYears').then(r => r.data.data);
export const createAcademicYear = (data: any) => apiClient.post('/academics/academicYears', data).then(r => r.data.data);
export const updateAcademicYear = (id: string, data: any) => apiClient.put(`/academics/academicYears/${id}`, data).then(r => r.data.data);

export const getTerms = () => apiClient.get('/academics/terms').then(r => r.data.data);
export const createTerm = (data: any) => apiClient.post('/academics/terms', data).then(r => r.data.data);
export const updateTerm = (id: string, data: any) => apiClient.put(`/academics/terms/${id}`, data).then(r => r.data.data);

export const getClasses = () => apiClient.get('/academics/classs').then(r => r.data.data);
export const createClass = (data: any) => apiClient.post('/academics/classs', data).then(r => r.data.data);
export const updateClass = (id: string, data: any) => apiClient.put(`/academics/classs/${id}`, data).then(r => r.data.data);

export const getSections = () => apiClient.get('/academics/sections').then(r => r.data.data);
export const createSection = (data: any) => apiClient.post('/academics/sections', data).then(r => r.data.data);
export const updateSection = (id: string, data: any) => apiClient.put(`/academics/sections/${id}`, data).then(r => r.data.data);

export const getSubjects = () => apiClient.get('/academics/subjects').then(r => r.data.data);
export const createSubject = (data: any) => apiClient.post('/academics/subjects', data).then(r => r.data.data);
export const updateSubject = (id: string, data: any) => apiClient.put(`/academics/subjects/${id}`, data).then(r => r.data.data);

