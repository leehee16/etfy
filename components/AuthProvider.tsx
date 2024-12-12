'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// 인증이 필요한 페이지 목록
const protectedRoutes = ['/main'];
// 인증된 사용자가 접근하면 리다이렉트할 페이지 목록
const authRoutes = ['/login', '/signup'];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window === 'undefined') return;
        
        const userData = sessionStorage.getItem('currentUser');
        const isAuthenticated = userData ? JSON.parse(userData)?.id : false;

        // 현재 경로가 보호된 경로인지 확인
        const isProtectedRoute = protectedRoutes.some(route => 
          pathname.startsWith(route)
        );

        // 현재 경로가 인증 관련 경로인지 확인
        const isAuthRoute = authRoutes.includes(pathname);

        if (isProtectedRoute && !isAuthenticated) {
          // 인증되지 않은 사용자가 보호된 경로에 접근
          router.replace('/login');
        } else if (isAuthRoute && isAuthenticated) {
          // 인증된 사용자가 로그인/회원가입 페이지에 접근
          router.replace('/main');
        } else if (!isAuthRoute && !isProtectedRoute && !isAuthenticated) {
          // 인증되지 않은 사용자가 루트 경로에 접근
          router.replace('/login');
        }
      } catch {
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          router.replace('/login');
        }
      }
    };

    checkAuth();

    // storage 이벤트 리스너 추가
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router]);

  return children;
} 