import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import Home from './pages/Home';
import QuestionBank from './pages/QuestionBank.tsx';
import PastPapers from './pages/PastPapers.tsx';
import ExamBuilder from './pages/ExamBuilder.tsx';
import Favorites from './pages/Favorites.tsx';
import Profile from './pages/Profile.tsx';
import QuestionDetail from './components/QuestionDetail.tsx';
import PaperDetail from './components/PaperDetail.tsx';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Hide main sidebar on Home page and Past Papers page since they have their own layouts
  const hideSidebar = location.pathname === '/' || 
                     location.pathname === '/papers' || 
                     location.pathname.startsWith('/papers/');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex">
        {!hideSidebar && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
        
        <main className={`flex-1 ${!hideSidebar ? '' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/questions" element={<QuestionBank />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/papers" element={<PastPapers />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/exam-builder" element={<ExamBuilder />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;