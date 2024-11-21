import React from 'react';
import { Home, ChevronLeft, ChevronRight, BookOpen, BrainCircuit, HelpCircle, Archive } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  setActiveSession: (session: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, setActiveSession }) => {
  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-offset dark:bg-offsetDark text-textMain dark:text-textMainDark p-4 fixed top-0 left-0 h-full`}>
      <div className="flex justify-between items-center mb-8">
        {isOpen && <h1 className="text-2xl font-bold">deepblend</h1>}
        <button onClick={toggleSidebar} className="p-2 rounded hover:bg-offsetPlus dark:hover:bg-offsetPlusDark">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <button onClick={() => setActiveSession('home')} className="flex items-center space-x-2 p-2 rounded hover:bg-offsetPlus dark:hover:bg-offsetPlusDark w-full text-left">
              <Home size={20} />
              {isOpen && <span>홈</span>}
            </button>
          </li>
          <li><hr className="border-borderMain dark:border-borderMainDark my-2" /></li>
          <li>
            <button onClick={() => setActiveSession('investmentStyle')} className="flex items-center space-x-2 p-2 rounded hover:bg-offsetPlus dark:hover:bg-offsetPlusDark w-full text-left">
              <BrainCircuit size={20} />
              {isOpen && <span>투자성향 테스트</span>}
            </button>
          </li>
          <li>
            <button onClick={() => setActiveSession('investmentKnowledge')} className="flex items-center space-x-2 p-2 rounded hover:bg-offsetPlus dark:hover:bg-offsetPlusDark w-full text-left">
              <BookOpen size={20} />
              {isOpen && <span>투자지식 테스트</span>}
            </button>
          </li>
          <li>
            <button onClick={() => setActiveSession('etfQuiz')} className="flex items-center space-x-2 p-2 rounded hover:bg-offsetPlus dark:hover:bg-offsetPlusDark w-full text-left">
              <HelpCircle size={20} />
              {isOpen && <span>ETF 퀴즈</span>}
            </button>
          </li>
          <li><hr className="border-borderMain dark:border-borderMainDark my-2" /></li>
          <li>
            <button onClick={() => setActiveSession('archive')} className="flex items-center space-x-2 p-2 rounded hover:bg-offsetPlus dark:hover:bg-offsetPlusDark w-full text-left">
              <Archive size={20} />
              {isOpen && <span>아카이브</span>}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

