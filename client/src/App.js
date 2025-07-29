import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ProctorDocuments from './pages/ProctorDocuments';
import StudentDocuments from './pages/StudentDocuments';
import StudentQuizzes from './pages/StudentQuizzes';
import ProctorQuizzes from './pages/ProctorQuizzes';
import TakeQuizPage from './pages/TakeQuizPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizResultsProctorView from './pages/QuizResultsProctorView';
import StudentProjects from './pages/StudentProjects';
import ProctorProjects from './pages/ProctorProjects';
import StudentAnalytics from './pages/StudentAnalytics';
import ProctorAnalytics from './pages/ProctorAnalytics';
import ProctorStudentAnalyticsDetail from './pages/ProctorStudentAnalyticsDetail';
import ProctorResources from './pages/ProctorResources';
import StudentResources from './pages/StudentResources';
import StudentChat from './pages/StudentChat';
import ProctorChat from './pages/ProctorChat';
import ProfilePage from './pages/ProfilePage';
import ProctorAttemptDetail from './pages/ProctorAttemptDetail';
// ... import other pages as you create them

function App() {
  return (
    <Router>
      <AuthProvider>
         <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute roles={['student']} />}>
            {/* Routes with Dashboard Layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/student/documents" element={<StudentDocuments />} />
              <Route path="/student/quizzes" element={<StudentQuizzes />} />
              <Route path="/student/projects" element={<StudentProjects />} />
              <Route path="/student/analytics" element={<StudentAnalytics />} /> 
              <Route path="/student/resources" element={<StudentResources />} />
              <Route path="/student/quiz/result/:attemptId" element={<QuizResultPage />} /> 
              <Route path="/student/chat" element={<StudentChat />} />
              <Route path="/student/profile" element={<ProfilePage />} />
              {/* Add other student routes here */}
            </Route>

            {/* Route WITHOUT Dashboard Layout (for taking the quiz) */}
            <Route path="/student/quiz/:quizId" element={<TakeQuizPage />} />
          </Route>

          {/* Proctor Routes */}
          <Route element={<ProtectedRoute roles={['proctor']} />}>
            <Route element={<DashboardLayout />}>
              {/* Add proctor routes here */}
              {/* e.g., <Route path="/proctor/documents" element={<ProctorDocuments />} /> */}
              <Route path="/proctor/documents" element={<ProctorDocuments />} /> 
              <Route path="/proctor/quizzes" element={<ProctorQuizzes />} />
              <Route path="/proctor/projects" element={<ProctorProjects />} />
              <Route path="/proctor/analytics" element={<ProctorAnalytics />} /> 
              <Route path="/proctor/analytics/:studentId" element={<ProctorStudentAnalyticsDetail />} />
              <Route path="/proctor/resources" element={<ProctorResources />} />
              <Route path="/proctor/chat" element={<ProctorChat />} />
              <Route path="/proctor/quiz/results/:quizId" element={<QuizResultsProctorView />} />
              <Route path="/proctor/quiz/attempt/:attemptId" element={<ProctorAttemptDetail />} />
              <Route path="/proctor/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Redirect any other path to a default page */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;