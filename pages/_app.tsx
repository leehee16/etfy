import type { AppProps } from 'next/app';
import { useState } from 'react';
import '@/styles/auth.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState('home');

  return (
    <Component 
      {...pageProps} 
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      activeSession={activeSession}
      setActiveSession={setActiveSession}
    />
  );
}

export default MyApp; 