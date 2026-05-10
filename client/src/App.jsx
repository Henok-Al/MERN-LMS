import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import AuthPage from "./pages/auth";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import HomePage from "./pages/home";
import CoursesPage from "./pages/courses";
import CourseDetailPage from "./pages/courses/course-detail";
import DashboardPage from "./pages/dashboard";
import CourseViewPage from "./pages/dashboard/course-view";
import InstructorDashboard from "./pages/instructor";
import InstructorCourses from "./pages/instructor/courses";
import InstructorAnalytics from "./pages/instructor/analytics";
import InstructorProjects from "./pages/instructor/projects";
import InstructorTeam from "./pages/instructor/team";
import CreateCoursePage from "./pages/instructor/create-course";
import ProfilePage from "./pages/profile";
import AdminDashboard from "./pages/admin";
import AdminCoursesPage from "./pages/admin/courses";
import AdminUsersPage from "./pages/admin/users";
import AdminCourseDetailPage from "./pages/admin/course-detail";
import PaymentSuccessPage from "./pages/payment/success";
import PaymentCancelPage from "./pages/payment/cancel";
import NotAdminPage from "./pages/not-admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:slug" element={<CourseDetailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/course/:courseId" element={<CourseViewPage />} />
      <Route path="/instructor" element={<InstructorDashboard />} />
      <Route path="/instructor/courses" element={<InstructorCourses />} />
      <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
      <Route path="/instructor/projects" element={<InstructorProjects />} />
      <Route path="/instructor/team" element={<InstructorTeam />} />
      <Route path="/instructor/create" element={<CreateCoursePage />} />
      <Route path="/instructor/edit/:id" element={<CreateCoursePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route path="/admin/courses/create" element={<CreateCoursePage />} />
      <Route path="/admin/courses/:courseId" element={<AdminCourseDetailPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/cancel" element={<PaymentCancelPage />} />
      <Route path="/not-admin" element={<NotAdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;