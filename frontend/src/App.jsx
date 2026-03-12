import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Chatbot from "./components/common/Chatbot";
import InterviewRoom from "./pages/InterviewRoom";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student
import StudentDashboard from "./pages/student/Dashboard";
import StudentApplications from "./pages/student/Applications";
import StudentInterviews from "./pages/student/Interviews";

// Staff
import StaffDashboard from "./pages/staff/Dashboard";
import StaffInterviews from "./pages/staff/Interviews";

// HR
import HrDashboard from "./pages/hr/Dashboard";
import HrInterviews from "./pages/hr/Interviews";
import HrJobs from "./pages/hr/Jobs";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

// Settings
import Settings from "./pages/settings/Settings";

export default function App() {
  return (
    <Router>
      <Chatbot />
      <Routes>
        {/* Default route now goes to Login page */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* INTERVIEW ROOM (VIDEO CONFERENCE) */}
        <Route
          path="/interview-room/:roomId"
          element={
            <ProtectedRoute role={["student", "hr"]}>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />

        {/* STUDENT ROUTES */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute role="student">
              <StudentApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/interviews"
          element={
            <ProtectedRoute role="student">
              <StudentInterviews />
            </ProtectedRoute>
          }
        />

        {/* STAFF ROUTES */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/interviews"
          element={
            <ProtectedRoute role="staff">
              <StaffInterviews />
            </ProtectedRoute>
          }
        />

        {/* HR ROUTES */}
        <Route
          path="/hr"
          element={
            <ProtectedRoute role="hr">
              <HrDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interviews"
          element={
            <ProtectedRoute role="hr">
              <HrInterviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs"
          element={
            <ProtectedRoute role="hr">
              <HrJobs />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
