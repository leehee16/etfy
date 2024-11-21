"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSession, setActiveSession] = useState('home');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-offset dark:from-backgroundDark dark:to-offsetDark">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        setActiveSession={setActiveSession}
      />
      <div className="flex-1">
        <MainContent 
          isSidebarOpen={isSidebarOpen}
          activeSession={activeSession}
          setActiveSession={setActiveSession}
        />
      </div>
    </div>
  );
};

export default Layout;

