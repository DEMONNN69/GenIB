import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import Home from './pages/Home';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Onboarding from './pages/Onboarding.tsx';
import QuestionBank from './pages/QuestionBank.tsx';
import PastPapers from './pages/PastPapers.tsx';
import ExamBuilder from './pages/ExamBuilder.tsx';
import Favorites from './pages/Favorites.tsx';
import Profile from './pages/Profile.tsx';
import Bundles from './pages/Bundles.tsx';
import BundleDetail from './pages/BundleDetail.tsx';
import QuestionDetail from './components/QuestionDetail.tsx';
import PaperDetail from './components/PaperDetail.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './guards/RouteGuards';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Hide navbar and sidebar on auth pages and onboarding
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/onboarding';
  
  // Show sidebar on all pages except auth pages
  const hideSidebar = isAuthPage;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && <Navbar toggleSidebar={toggleSidebar} />}
      
      <div className="flex">
        {!hideSidebar && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
        
        <main className={`flex-1 ${!hideSidebar ? '' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions" 
              element={
                <ProtectedRoute>
                  <QuestionBank />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions/:id" 
              element={
                <ProtectedRoute>
                  <QuestionDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/papers" 
              element={
                <ProtectedRoute>
                  <PastPapers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/papers/:id" 
              element={
                <ProtectedRoute>
                  <PaperDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bundles" 
              element={
                <ProtectedRoute>
                  <Bundles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bundles/:id" 
              element={
                <ProtectedRoute>
                  <BundleDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exam-builder" 
              element={
                <ProtectedRoute>
                  <ExamBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;