"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSession, setActiveSession] = useState('home');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#1f1f1f] overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        setActiveSession={setActiveSession}
        activeSession={activeSession}
      />
      <main className={`fixed top-0 right-0 bottom-0 transition-all duration-300 ${isSidebarOpen ? 'left-64' : 'left-20'}`}>
        {children || (
          <MainContent 
            isSidebarOpen={isSidebarOpen}
            activeSession={activeSession}
            setActiveSession={setActiveSession}
          />
        )}
      </main>
    </div>
  );
};

export default Layout;

