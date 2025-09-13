import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import QuestionBank from './pages/QuestionBank';
import PastPapers from './pages/PastPapers';
import ExamBuilder from './pages/ExamBuilder';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import QuestionDetail from './components/QuestionDetail';
import PaperDetail from './components/PaperDetail';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 lg:ml-64">
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
    </Router>
  );
}

export default App;