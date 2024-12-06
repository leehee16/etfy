import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  isOpen: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ isOpen }) => {
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
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