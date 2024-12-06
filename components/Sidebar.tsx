import React, { useRef, useState } from 'react';
import { Home, ChevronLeft, ChevronRight, BookOpen, BrainCircuit, HelpCircle, Archive } from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  setActiveSession: (session: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, setActiveSession }) => {
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

      if (!response.ok) {
        throw new Error('임베딩 실패');
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      alert('문서 임베딩 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} transition-width duration-300 ease-in-out`}>
      <nav className="h-full bg-[#242424] border-r border-[#2f2f2f] p-4">
        <div className="flex items-center mb-8">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded hover:bg-[#2f2f2f] text-gray-400"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <button 
            onClick={handleLogoClick}
            className="flex items-center justify-start pl-2 cursor-pointer text-gray-200"
            disabled={isUploading}
          >
            {isOpen && (
              <Image
                src="/images/etfytypo2.png"
                alt="ETFY 로고"
                width={100}
                height={30}
                priority
              />
            )}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.md"
        />
        
        <nav>
          <ul className="space-y-2">
            <li>
              <button onClick={() => setActiveSession('home')} 
                      className="flex items-center space-x-2 p-2 rounded hover:bg-[#2f2f2f] w-full text-left text-gray-300">
                <Home size={20} />
                {isOpen && <span>홈</span>}
              </button>
            </li>
            <li><hr className="border-[#2f2f2f] my-2" /></li>
            <li>
              <button onClick={() => setActiveSession('investmentStyle')} className="flex items-center space-x-2 p-2 rounded hover:bg-[#2f2f2f] w-full text-left text-gray-300">
                <BrainCircuit size={20} />
                {isOpen && <span>투자성향 테스트</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSession('investmentKnowledge')} className="flex items-center space-x-2 p-2 rounded hover:bg-[#2f2f2f] w-full text-left text-gray-300">
                <BookOpen size={20} />
                {isOpen && <span>투자지식 테스트</span>}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSession('etfQuiz')} className="flex items-center space-x-2 p-2 rounded hover:bg-[#2f2f2f] w-full text-left text-gray-300">
                <HelpCircle size={20} />
                {isOpen && <span>ETF 퀴즈</span>}
              </button>
            </li>
            <li><hr className="border-[#2f2f2f] my-2" /></li>
            <li>
              <button onClick={() => setActiveSession('archive')} className="flex items-center space-x-2 p-2 rounded hover:bg-[#2f2f2f] w-full text-left text-gray-300">
                <Archive size={20} />
                {isOpen && <span>아카이브</span>}
              </button>
            </li>
          </ul>
        </nav>
      </nav>
    </div>
  );
};

export default Sidebar;

