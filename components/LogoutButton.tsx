import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  isOpen: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ isOpen }) => {
  const handleLogout = () => {
    // 세션 스토리지에서 사용자 정보 제거
    sessionStorage.removeItem('currentUser');
    
    // 세션 스토리지 변경 이벤트를 수동으로 발생시킴
    window.dispatchEvent(new Event('storage'));
    
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  };

  return (
    <div className="mt-auto pt-4 border-t border-[#2f2f2f]">
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 p-2 rounded hover:bg-[#2f2f2f] w-full text-left text-gray-300"
      >
        <LogOut size={20} />
        {isOpen && <span>로그아웃</span>}
      </button>
    </div>
  );
};

export default LogoutButton; 