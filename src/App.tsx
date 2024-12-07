import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MainContent from './components/MainContent';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/auth.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState('home');

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainContent 
                isSidebarOpen={isSidebarOpen}
                activeSession={activeSession}
                setActiveSession={setActiveSession}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 