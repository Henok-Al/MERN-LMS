import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import CoursesPage from "./pages/courses";
import CourseDetailPage from "./pages/courses/course-detail";
import DashboardPage from "./pages/dashboard";
import CourseViewPage from "./pages/dashboard/course-view";
import InstructorDashboard from "./pages/instructor";
import CreateCoursePage from "./pages/instructor/create-course";
import AdminDashboard from "./pages/admin";
import AdminCoursesPage from "./pages/admin/courses";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:slug" element={<CourseDetailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/course/:courseId" element={<CourseViewPage />} />
      <Route path="/instructor" element={<InstructorDashboard />} />
      <Route path="/instructor/create" element={<CreateCoursePage />} />
      <Route path="/instructor/edit/:id" element={<CreateCoursePage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route path="/admin/courses/create" element={<CreateCoursePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;