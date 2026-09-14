import LandingPage from './pages/public/LandingPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import Unauthorized from './pages/errors/Unauthorized';
import UserProfile from './pages/common/UserProfile';

import { useAuthStore } from './store/authStore';
import { ROLE_PORTAL_PATHS } from './utils/constants';

// Super Admin Pages
import AdminDashboard from './pages/super-admin/AdminDashboard';
import UserList from './pages/super-admin/users/UserList';
import StudentList from './pages/super-admin/students/StudentList';
import StudentProfile from './pages/super-admin/students/StudentProfile';
import TeacherList from './pages/super-admin/teachers/TeacherList';
import AcademicYearList from './pages/super-admin/academic-years/AcademicYearList';
import TermList from './pages/super-admin/terms/TermList';
import ClassList from './pages/super-admin/classes/ClassList';
import SubjectList from './pages/super-admin/subjects/SubjectList';
import AttendanceView from './pages/super-admin/attendance/AttendanceView';
import ExamMarksView from './pages/super-admin/marks/ExamMarksView';
import FinanceReports from './pages/super-admin/reports/FinanceReports';
import PerformanceReports from './pages/super-admin/reports/PerformanceReports';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherExams from './pages/teacher/TeacherExams';

// Principal Pages
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import PrincipalMessages from './pages/principal/PrincipalMessages';
import PrincipalExams from './pages/principal/PrincipalExams';
import EnterMarksPage from './pages/principal/EnterMarksPage';
import MarkAttendancePage from './pages/registration/MarkAttendancePage';
import StudentExams from './pages/principal/StudentExams';

// Finance Pages
import Invoices from './pages/finance/Invoices';
import Payments from './pages/finance/Payments';
import Expenses from './pages/finance/Expenses';
import RegistrationDashboard from './pages/registration/RegistrationDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper component to redirect root to correct dashboard or login

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const portalPath = ROLE_PORTAL_PATHS[user.role as keyof typeof ROLE_PORTAL_PATHS] || '/login';
  return <Navigate to={portalPath} replace />;
};

import { ScrollToTop } from './components/common/ScrollToTop';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes inside AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* SUPER ADMIN PORTAL */}
            <Route path="/admin">
              <Route index element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><AdminDashboard /></RoleRoute>} />
              <Route path="users" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><UserList /></RoleRoute>} />
              <Route path="students" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><StudentList /></RoleRoute>} />
              <Route path="students/:id" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><StudentProfile /></RoleRoute>} />
              <Route path="teachers" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><TeacherList /></RoleRoute>} />
              <Route path="attendance" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><AttendanceView /></RoleRoute>} />
              <Route path="marks" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><ExamMarksView /></RoleRoute>} />
              <Route path="academic-years" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><AcademicYearList /></RoleRoute>} />
              <Route path="terms" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><TermList /></RoleRoute>} />
              <Route path="classes" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><ClassList /></RoleRoute>} />
              <Route path="subjects" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><SubjectList /></RoleRoute>} />
              <Route path="invoices" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><Invoices /></RoleRoute>} />
              <Route path="payments" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><Payments /></RoleRoute>} />
              <Route path="expenses" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><Expenses /></RoleRoute>} />
              <Route path="finance-reports" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><FinanceReports /></RoleRoute>} />
              <Route path="performance-reports" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><PerformanceReports /></RoleRoute>} />
              <Route path="profile" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><UserProfile /></RoleRoute>} />
            </Route>

            {/* PRINCIPAL PORTAL */}
            <Route path="/principal">
              <Route index element={<RoleRoute allowedRoles={['PRINCIPAL']}><PrincipalDashboard /></RoleRoute>} />
              <Route path="students" element={<RoleRoute allowedRoles={['PRINCIPAL']}><StudentList /></RoleRoute>} />
              <Route path="alumni" element={<RoleRoute allowedRoles={['PRINCIPAL']}><StudentList isAlumniView={true} /></RoleRoute>} />
              <Route path="teachers" element={<RoleRoute allowedRoles={['PRINCIPAL']}><TeacherList /></RoleRoute>} />
              <Route path="classes" element={<RoleRoute allowedRoles={['PRINCIPAL']}><ClassList /></RoleRoute>} />
              <Route path="exams" element={<RoleRoute allowedRoles={['PRINCIPAL']}><PrincipalExams /></RoleRoute>} />
                <Route path="exams/:examId/marks" element={<RoleRoute allowedRoles={['PRINCIPAL']}><EnterMarksPage /></RoleRoute>} />
              <Route path="student-exams" element={<RoleRoute allowedRoles={['PRINCIPAL']}><StudentExams /></RoleRoute>} />
              <Route path="attendance" element={<RoleRoute allowedRoles={['PRINCIPAL']}><AttendanceView /></RoleRoute>} />
              <Route path="messages" element={<RoleRoute allowedRoles={['PRINCIPAL']}><PrincipalMessages /></RoleRoute>} />
              <Route path="finance-reports" element={<RoleRoute allowedRoles={['PRINCIPAL']}><FinanceReports /></RoleRoute>} />
              <Route path="performance" element={<RoleRoute allowedRoles={['PRINCIPAL']}><PerformanceReports /></RoleRoute>} />
              <Route path="profile" element={<RoleRoute allowedRoles={['PRINCIPAL']}><UserProfile /></RoleRoute>} />
              <Route path="invoices" element={<RoleRoute allowedRoles={['PRINCIPAL']}><Invoices /></RoleRoute>} />
              <Route path="payments" element={<RoleRoute allowedRoles={['PRINCIPAL']}><Payments /></RoleRoute>} />
              <Route path="expenses" element={<RoleRoute allowedRoles={['PRINCIPAL']}><Expenses /></RoleRoute>} />
            </Route>

            {/* REGISTRATION PORTAL */}
            <Route path="/register">
              <Route index element={<RoleRoute allowedRoles={['REGISTRATION']}><RegistrationDashboard /></RoleRoute>} />
              <Route path="students" element={<RoleRoute allowedRoles={['REGISTRATION']}><StudentList /></RoleRoute>} />
                <Route path="exams" element={<RoleRoute allowedRoles={['REGISTRATION']}><PrincipalExams /></RoleRoute>} />
                <Route path="exams/:examId/marks" element={<RoleRoute allowedRoles={['REGISTRATION']}><EnterMarksPage /></RoleRoute>} />
                <Route path="marks" element={<RoleRoute allowedRoles={['REGISTRATION']}><StudentExams /></RoleRoute>} />
                <Route path="attendance" element={<RoleRoute allowedRoles={['REGISTRATION']}><AttendanceView /></RoleRoute>} />
                <Route path="mark-attendance" element={<RoleRoute allowedRoles={['REGISTRATION']}><MarkAttendancePage /></RoleRoute>} />
              <Route path="profile" element={<RoleRoute allowedRoles={['REGISTRATION']}><UserProfile /></RoleRoute>} />
            </Route>

            {/* TEACHER PORTAL */}
            <Route path="/teacher">
              <Route index element={<RoleRoute allowedRoles={['TEACHER']}><TeacherDashboard /></RoleRoute>} />
              <Route path="classes" element={<RoleRoute allowedRoles={['TEACHER']}><TeacherStudents /></RoleRoute>} />
              <Route path="attendance" element={<RoleRoute allowedRoles={['TEACHER']}><TeacherAttendance /></RoleRoute>} />
              <Route path="exams" element={<RoleRoute allowedRoles={['TEACHER']}><TeacherExams /></RoleRoute>} />
              <Route path="profile" element={<RoleRoute allowedRoles={['TEACHER']}><UserProfile /></RoleRoute>} />
            </Route>
          </Route>

          {/* Root Redirect & Catch-all */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;





