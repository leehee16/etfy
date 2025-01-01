'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Home, BookOpen, BrainCircuit, HelpCircle, Archive, Settings, ChevronDown, FileText } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LogoutButton = dynamic(() => import('./LogoutButton'), {
  ssr: false
});

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  setActiveSession: (session: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, setActiveSession }) => {
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/embed', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('임베딩 실패');
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      alert('문서 임베딩 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`fixed top-0 left-0 h-full transition-[width] duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <nav className="relative h-full bg-[#242424] border-r border-[#2f2f2f] p-4">
        <div className="flex items-center h-12 mb-6">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-[#2f2f2f] text-gray-400 transition-colors"
          >
            <span className="block">
              {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          <div className={`ml-3 overflow-hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <button
              onClick={handleLogoClick}
              className="flex items-center justify-start cursor-pointer text-gray-200"
              disabled={isUploading}
            >
              <Image
                src="/images/etfytypo2.png"
                alt="ETFY 로고"
                width={100}
                height={30}
                priority
              />
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.md"
        />
        
        <nav className="flex flex-col h-[calc(100vh-160px)]">
          <ul className="space-y-2 flex-grow">
            <li>
              <button 
                onClick={() => setActiveSession('home')} 
                className="flex items-center w-full p-2 rounded hover:bg-[#2f2f2f] text-gray-300"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <Home className="w-4 h-4" />
                </div>
                <div className={`ml-2 overflow-hidden whitespace-nowrap transition-all duration-200 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  홈
                </div>
              </button>
            </li>
            <li><hr className="border-[#2f2f2f] my-2" /></li>
            <li>
              <button 
                onClick={() => setActiveSession('investmentStyle')} 
                className="flex items-center w-full p-2 rounded hover:bg-[#2f2f2f] text-gray-300"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className={`ml-2 overflow-hidden whitespace-nowrap transition-all duration-200 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  <div className="flex items-center gap-2">
                    <span>투자성향 테스트</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">미완료</span>
                  </div>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSession('investmentKnowledge')} 
                className="flex items-center w-full p-2 rounded hover:bg-[#2f2f2f] text-gray-300"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className={`ml-2 overflow-hidden whitespace-nowrap transition-all duration-200 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  <div className="flex items-center gap-2">
                    <span>투자지식 테스트</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">미완료</span>
                  </div>
                </div>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSession('etfQuiz')} 
                className="flex items-center w-full p-2 rounded hover:bg-[#2f2f2f] text-gray-300"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className={`ml-2 overflow-hidden whitespace-nowrap transition-all duration-200 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  <div className="flex items-center gap-2">
                    <span>ETF 퀴즈</span>
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full">생성중</span>
                  </div>
                </div>
              </button>
            </li>
            <li><hr className="border-[#2f2f2f] my-2" /></li>
            <li>
              <button 
                onClick={() => setActiveSession('archive')}
                className="flex items-center w-full p-2 rounded hover:bg-[#2f2f2f] text-gray-300"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <Archive className="w-4 h-4" />
                </div>
                <div className={`ml-2 overflow-hidden whitespace-nowrap transition-all duration-200 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  아카이브
                </div>
              </button>
            </li>
          </ul>

          <div className="mt-auto space-y-2">
            <LogoutButton isOpen={isOpen} />
            <hr className="border-[#2f2f2f] my-2" />
            <button 
              onClick={() => setActiveSession('admin')} 
              className="flex items-center w-full p-2 rounded hover:bg-[#2f2f2f] text-gray-300"
              aria-label="관리자 페이지"
            >
              <div className="flex items-center justify-center w-5 h-5">
                <Settings className="w-4 h-4" />
              </div>
              <div className={`ml-2 overflow-hidden whitespace-nowrap transition-all duration-200 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                관리자 페이지
              </div>
            </button>
          </div>
        </nav>
      </nav>
    </div>
  );
};

export default Sidebar;

