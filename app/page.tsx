'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window === 'undefined') return;
        
        const userData = sessionStorage.getItem('currentUser');
        const isAuthenticated = userData ? JSON.parse(userData)?.id : false;
        
        if (isAuthenticated) {
          router.replace('/main');
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);

  return <div>Loading...</div>;
}