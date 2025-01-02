import React, { useState, useRef, useEffect } from 'react';
import { Book, TrendingUp, Search, BarChartIcon as ChartBar, FileText } from 'lucide-react';
import RightPanel from './RightPanel';
import { Reference } from '@/types/chat';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import dynamic from 'next/dynamic';
import { useArchiveStore } from '@/lib/store/archiveStore';
import Archive from './Archive';
import InvestmentStyleTest from './InvestmentStyleTest';

const defaultCurrentStep = {
  id: 1,
  title: "증권계좌 개설 단계",
  description: "ETF 투자를 위해서는 먼저 증권계좌를 개설해야 합니다.",
  progress: 0,
  subTasks: [
    {
      id: "1-1",
      title: "증권사 비교 및 선택",
      description: "다양한 증권사를 비교하고 자신에게 맞는 증권사를 선택하세요.",
      completed: false,
      weight: 25
    },
    {
      id: "1-2",
      title: "앱 설치",
      description: "선택한 증권사의 모바일 거래 앱(MTS)을 스마트폰에 설치하세요.",
      completed: false,
      weight: 25
    },
    {
      id: "1-3",
      title: "신분증 준비",
      description: "신분증을 준비하고 스마트폰으로 촬영해 두세요.",
      completed: false,
      weight: 25
    },
    {
      id: "1-4",
      title: "계좌 개설 완료",
      description: "모든 준비가 끝나면 증권사에서 계좌 개설을 완료하세요.",
      completed: false,
      weight: 25
    }
  ]
};

interface SubTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number;
}

interface CurrentStep {
  id: number;
  title: string;
  description: string;
  progress: number;
  subTasks: SubTask[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
  references?: Reference[];
  relatedTopics?: string[];
  nextCards?: any[];
  currentStep?: CurrentStep;
  selectedSectors?: SectorRank[];
}

interface SectorRank {
  id: string;
  name: string;
  change: number;
  checked: boolean;
  etfs: {
    name: string;
    code: string;
    change: number;
  }[];
}

interface MyETF {
  name: string;
  code: string;
  purchasePrice: number;
  currentPrice: number;
  change: number;
  amount: number;
}

// 컨텍스트별 호버링 스타일 정의
const cardStyles = {
  '기초공부하기': {
    hover: 'hover:bg-[#FFE082] hover:text-gray-800',
    icon: '📚',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #FFE082, #FFB74D)',
    dotColor: '#FFE082'
  },
  '투자시작하기': {
    hover: 'hover:bg-[#81C784] hover:text-gray-800',
    icon: '🎯',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #81C784, #4CAF50)',
    dotColor: '#81C784'
  },
  '살펴보기': {
    hover: 'hover:bg-[#64B5F6] hover:text-gray-800',
    icon: '🔍',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #64B5F6, #2196F3)',
    dotColor: '#64B5F6'
  },
  '분석하기': {
    hover: 'hover:bg-[#F48FB1] hover:text-gray-800',
    icon: '📊',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #F9A8D4, #EC4899)',
    dotColor: '#F9A8D4'
  },
  '보고서 생성': {
    hover: 'hover:bg-[#9C27B0] hover:text-gray-800',
    icon: '📋',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #9C27B0, #673AB7)',
    dotColor: '#9C27B0'
  }
};

interface MainContentProps {
  isSidebarOpen: boolean;
  activeSession: string;
  setActiveSession: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardCard = ({ 
  title, 
  content, 
  icon, 
  style, 
  onClick, 
  onMouseEnter, 
  onMouseLeave 
}: { 
  title: string; 
  content: React.ReactNode; 
  icon: React.ReactNode; 
  style: any; 
  onClick: () => void; 
  onMouseEnter: () => void; 
  onMouseLeave: () => void; 
}) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`
      group rounded-lg bg-[#242424] text-gray-200 
      transition-all duration-300 ease-in-out hover:scale-104 
      h-[200px] w-full flex flex-col p-3 ${style?.hover || ''}
    `}
  >
    <div className="flex items-center gap-2 mb-2 h-8">
      {icon}
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <div className="bg-[#2f2f2f] rounded-lg flex-1 w-[280px]">
      {content}
    </div>
  </button>
);

const SimpleLineChart = () => (
  <div className="relative h-16 mt-4 z-10">
    <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
      <div className="w-1/4 h-8 bg-green-500/20 rounded-sm group-hover:animate-chart-line1"></div>
      <div className="w-1/4 h-6 bg-green-500/30 rounded-sm group-hover:animate-chart-line2"></div>
      <div className="w-1/4 h-10 bg-green-500/40 rounded-sm group-hover:animate-chart-line3"></div>
      <div className="w-1/4 h-12 bg-green-500/50 rounded-sm group-hover:animate-chart-line4"></div>
    </div>
  </div>
);

interface ChatMessagesProps {
  messages: ChatMessage[];
  handleSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  context: string;
  isLoading: boolean;
  onSubTaskComplete: (taskId: string, completed: boolean) => void;
  onAddSelectedText: (task: SubTask) => void;
}

const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

// UUID 생성 함수 추가
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen, activeSession, setActiveSession }) => {
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({
    '기초공부하기': [],
    '투자시작하기': [],
    '살펴보기': [],
    '분석하기': []
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentReferences, setCurrentReferences] = useState<Reference[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentStep, setCurrentStep] = useState<CurrentStep | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [selectedTexts, setSelectedTexts] = useState<SubTask[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<SectorRank[]>([]);
  const [allInvestmentSteps, setAllInvestmentSteps] = useState<Array<{
    id: number;
    title: string;
    description: string;
    progress: number;
    subTasks: Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
      weight: number;
    }>;
  }>>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [sectorRanks, setSectorRanks] = useState<SectorRank[]>([
    {
      id: '1',
      name: '반도체',
      change: 2.5,
      checked: false,
      etfs: [
        { name: 'KODEX 반도체', code: '305720', change: 2.8 },
        { name: 'TIGER 반도체', code: '139260', change: 2.3 }
      ]
    },
    {
      id: '2',
      name: '2차전지',
      change: 1.8,
      checked: false,
      etfs: [
        { name: 'KODEX 2차전지산업', code: '305540', change: 1.9 },
        { name: 'TIGER 2차전지테마', code: '305540', change: 1.7 }
      ]
    },
    {
      id: '3',
      name: '바이오',
      change: -0.5,
      checked: false,
      etfs: [
        { name: 'KODEX 바이오', code: '244580', change: -0.3 },
        { name: 'TIGER 헬스케어', code: '227910', change: -0.7 }
      ]
    }
  ]);
  const [myETFs] = useState<MyETF[]>([
    {
      name: 'KODEX 200',
      code: '069500',
      purchasePrice: 35750,
      currentPrice: 36800,
      change: 2.94,
      amount: 10
    },
    {
      name: 'TIGER 차이나전기차',
      code: '371460',
      purchasePrice: 12850,
      currentPrice: 12100,
      change: -5.84,
      amount: 20
    }
  ]);
  const [usedSessions, setUsedSessions] = useState<Record<string, boolean>>({
    '기초공부하기': false,
    '투자시작하기': false,
    '살펴보기': false,
    '분석하기': false
  });
  const [showExampleQuestions, setShowExampleQuestions] = useState(false);

  const exampleQuestions = [
    {
      id: '기초공부하기',
      question: "ETF 추적오차율이 무엇인가요?",
      color: "bg-amber-300"
    },
    {
      id: '투자시작하기',
      question: "증권사 계좌는 어떻게 개설하나요?",
      color: "bg-green-300"
    },
    {
      id: '살펴보기',
      question: "반도체 섹터 ETF 추천해주세요",
      color: "bg-blue-300"
    },
    {
      id: '분석하기',
      question: "KODEX 200 ETF 분석해주세요",
      color: "bg-pink-300"
    }
  ];

  // 서브태스크 완료 처리
  const handleSubTaskComplete = (taskId: string, completed: boolean) => {
    if (!currentStep || !allInvestmentSteps.length) return;

    // 현재 단계의 서브태스크 업데이트
    const updatedSubTasks = currentStep.subTasks.map(task =>
      task.id === taskId ? { ...task, completed } : task
    );

    // 진행률 계산
    const totalWeight = updatedSubTasks.reduce((sum, task) => sum + task.weight, 0);
    const completedWeight = updatedSubTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.weight, 0);

    const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

    // 현재 단계 업데이트
    const updatedCurrentStep = {
      ...currentStep,
      subTasks: updatedSubTasks,
      progress
    };

    // 모든 단계 업데이트
    const updatedSteps = allInvestmentSteps.map((step, index) =>
      index === currentStepIndex ? updatedCurrentStep : step
    );

    // 모든 서브태스크가 완료되었고, 다음 단계가 있다면 다음 단계로 이동
    if (progress === 100 && currentStepIndex < updatedSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setCurrentStep(updatedSteps[currentStepIndex + 1]);
    } else {
      setCurrentStep(updatedCurrentStep);
    }

    setAllInvestmentSteps(updatedSteps);
  };

  useEffect(() => {
    if (activeSession === 'home') {
      setCurrentReferences([]);
      setRelatedTopics([]);
    }
  }, [activeSession]);

  const cards = [
    { icon: <Book size={24} />, title: "기초공부하기", description: "ETF 투자의 기본 개념을 학습해요.", greeting: "반가워요! ETF 기초공부를 도와드릴 잇삐에요." },
    { icon: <TrendingUp size={24} />, title: "투자시작하기", description: "ETF 투자를 시작하는 방법을 알아봐요.", greeting: "안녕하세요! ETF 투자를 시작해볼까요?" },
    { icon: <Search size={24} />, title: "살펴보기", description: "시장동향을 같이 살펴봐요.", greeting: "환영합니다! 오늘은 무슨 이슈가 있을까요?" },
    { icon: <ChartBar size={24} />, title: "분석하기", description: "내 자산에서 ETF를 분석해요.", greeting: "안녕하세요! 같이 ETF를 살펴봐요." },
  ];

  const handleCardClick = (title: string) => {
    setActiveSession(title);
    if (!sessionMessages[title]?.length) {
      const greeting = cards.find(card => card.title === title)?.greeting || '안녕하세요!';
      const greetingMessage: ChatMessage = {
        role: 'assistant',
        content: greeting,
        context: title
      };
      setMessages([greetingMessage]);
      setSessionMessages(prev => ({
        ...prev,
        [title]: [greetingMessage]
      }));
    } else {
      setMessages(sessionMessages[title]);
    }
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (message: string, context: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);

    try {
      // 현재 컨텍스트를 사용한 것으로 표시
      setUsedSessions(prev => ({
        ...prev,
        [activeSession]: true
      }));

      // 현재 사용자 정보 가져오기
      const userData = sessionStorage.getItem('currentUser');
      const currentUser = userData ? JSON.parse(userData) : { id: 'guest' };

      // 컨텍스트 감지 수행
      const contextResponse = await fetch('/api/detectContext', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!contextResponse.ok) throw new Error('컨텍스트 감지 실패');
      
      const { context } = await contextResponse.json();
      const normalizedContext = context === '투자 시작하기' ? '투자시작하기' : context;
      
      // 홈화면이거나 다른 컨텍스트가 감지된 경우 세션 전환
      if (activeSession === 'home' || normalizedContext !== activeSession) {
        setActiveSession(normalizedContext);
      }

      // 컨텍스트별 체크된 정보 수집
      const contextInfo: any = {
        context: normalizedContext,
        message,
        messages,
      };

      // 기초공부하기 컨텍스트의 선택된 텍스트
      if (normalizedContext === '기초공부하기' && selectedTexts.length > 0) {
        contextInfo.selectedTexts = selectedTexts;
      }

      // 투자시작하기 컨텍스트의 진행 상황
      if (normalizedContext === '투자시작하기') {
        if (currentStep) {
          contextInfo.currentStep = currentStep;
          contextInfo.allSteps = allInvestmentSteps;
          contextInfo.currentStepIndex = currentStepIndex;
        } else {
          // LLM에게 새로운 단계 생성 요청
          const stepResponse = await fetch('/api/generateInvestmentStep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context: normalizedContext })
          });
          
          if (stepResponse.ok) {
            const { step, allSteps, currentStepIndex: newIndex } = await stepResponse.json();
            setCurrentStep(step);
            setAllInvestmentSteps(allSteps);
            setCurrentStepIndex(newIndex);
            contextInfo.currentStep = step;
            contextInfo.allSteps = allSteps;
            contextInfo.currentStepIndex = newIndex;
          }
        }
      }

      // 살펴보기 컨텍스트의 선택된 섹터
      if (normalizedContext === '살펴보기' && selectedSectors.length > 0) {
        contextInfo.selectedSectors = selectedSectors;
      }

      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        context: normalizedContext,
        ...contextInfo
      };

      // 기존 메시지에 새 메시지 추가
      setMessages(prev => [...prev, userMessage]);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextInfo),
      });

      if (!response.ok) throw new Error('API 응답 오류');

      const data = await response.json();

      if (normalizedContext === '투자시작하기' && data.currentStep) {
        setCurrentStep(data.currentStep);
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        references: data.references || [],
        relatedTopics: data.relatedTopics || [],
        nextCards: data.nextCards || [],
        context: normalizedContext,
        currentStep: data.currentStep
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentReferences(data.references || []);
      setRelatedTopics(data.relatedTopics || []);
      
      // 세션별 메시지 저장
      setSessionMessages(prev => ({
        ...prev,
        [normalizedContext]: [...(prev[normalizedContext] || []), userMessage, aiMessage]
      }));

    } catch (error) {
      console.error('에러 발생:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: '죄송합니다. 오류가 발생했습니다.',
        context: activeSession
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setSessionMessages(prev => ({
        ...prev,
        [activeSession]: [...(prev[activeSession] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 컨텍스트 변경 시 해당 세션 사용 여부 확인
  useEffect(() => {
    if (activeSession !== 'home' && activeSession !== 'admin') {
      setUsedSessions(prev => ({
        ...prev,
        [activeSession]: sessionMessages[activeSession]?.length > 0 || false
      }));
    }
  }, [activeSession, sessionMessages]);

  // 디버깅용 로그
  useEffect(() => {
    console.log('MainContent state:', {
      activeSession,
      activeSessionType: typeof activeSession,
      currentStep,
      context: messages[messages.length - 1]?.context,
      isInvestmentContext: activeSession === '투자시작하기',
      lastMessage: messages[messages.length - 1]
    });
  }, [activeSession, currentStep, messages]);

  const defaultGradient = `conic-gradient(
    from 90deg at 50% 50%,
    transparent 0deg,
    rgba(74, 144, 226, 1) 60deg,
    rgba(129, 199, 132, 1) 120deg,
    rgba(255, 224, 130, 1) 180deg,
    rgba(244, 143, 177, 1) 240deg,
    transparent 300deg,
    transparent 360deg
  )`;

  const blueGradient = `conic-gradient(
    from 90deg at 50% 50%,
    transparent 0deg,
    rgba(74, 144, 226, 1) 60deg,
    rgba(74, 144, 226, 0.9) 120deg,
    rgba(74, 144, 226, 0.8) 180deg,
    rgba(74, 144, 226, 0.7) 240deg,
    transparent 300deg,
    transparent 360deg
  )`;

  const greenGradient = `conic-gradient(
    from 90deg at 50% 50%,
    transparent 0deg,
    rgba(129, 199, 132, 1) 60deg,
    rgba(129, 199, 132, 0.9) 120deg,
    rgba(129, 199, 132, 0.8) 180deg,
    rgba(129, 199, 132, 0.7) 240deg,
    transparent 300deg,
    transparent 360deg
  )`;

  const yellowGradient = `conic-gradient(
    from 90deg at 50% 50%,
    transparent 0deg,
    rgba(255, 224, 130, 1) 60deg,
    rgba(255, 224, 130, 0.9) 120deg,
    rgba(255, 224, 130, 0.8) 180deg,
    rgba(255, 224, 130, 0.7) 240deg,
    transparent 300deg,
    transparent 360deg
  )`;

  const pinkGradient = `conic-gradient(
    from 90deg at 50% 50%,
    transparent 0deg,
    rgba(244, 143, 177, 1) 60deg,
    rgba(244, 143, 177, 0.9) 120deg,
    rgba(244, 143, 177, 0.8) 180deg,
    rgba(244, 143, 177, 0.7) 240deg,
    transparent 300deg,
    transparent 360deg
  )`;

  const handleAddSelectedText = (newTask: SubTask) => {
    setSelectedTexts(prev => {
      const exists = prev.find(item => item.id === newTask.id);
      if (exists) {
        return prev.map(item => 
          item.id === newTask.id ? { ...item, completed: !item.completed } : item
        );
      }
      return [...prev, newTask];
    });
  };

  const handleNextCards = (cards: Array<{ title: string; content: string }>, imageDescription?: string) => {
    // 이미지 분석 결과를 assistant 메시지로 추가
    const imageAnalysisMessage: ChatMessage = {
      role: 'assistant',
      content: imageDescription || '이미지를 분석하는데 문제가 발생했습니다.',
      nextCards: cards,
      context: activeSession
    };

    setMessages(prev => [...prev, imageAnalysisMessage]);
    
    // 세션별 메시지 저장
    setSessionMessages(prev => ({
      ...prev,
      [activeSession]: [...(prev[activeSession] || []), imageAnalysisMessage]
    }));
  };

  const handleSectorSelect = (sectors: SectorRank[]) => {
    setSelectedSectors(sectors);
  };

  const handleGenerateReport = async () => {
    const completedSessions = Object.values(sessionMessages).filter(messages => messages.length > 0).length;
    if (completedSessions === 0) {
      alert('먼저 하나 이상의 세션을 완료해주세요.');
      return;
    }

    // 확인 메시지 표시
    if (!window.confirm('지금까지의 대화 내용으로 보고서를 생성하시겠습니까?')) {
      return;
    }

    try {
      setIsGeneratingReport(true);
      // 현재 사용자 정보 가져오기
      const userData = sessionStorage.getItem('currentUser');
      const currentUser = userData ? JSON.parse(userData) : { id: 'guest' };

      // 세션 메시지를 배열로 변환
      const sessionArray = Object.entries(sessionMessages)
        .filter(([_, messages]) => messages.length > 0)
        .map(([context, messages]) => ({
          context,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            references: msg.references,
            relatedTopics: msg.relatedTopics
          }))
        }));

      console.log('보고서 생성 요청:', {
        sessions: sessionArray,
        userId: currentUser.id
      });

      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessions: sessionArray,
          userId: currentUser.id
        }),
      });

      const data = await response.json();
      console.log('API 응답 전체:', data);

      if (!response.ok) {
        throw new Error(data.error || '보고서 생성 중 오류가 발생했습니다.');
      }

      if (!data.report) {
        throw new Error('보고서 데이터를 받지 못했습니다.');
      }

      console.log('보고서 데이터:', data.report);

      const { addReport } = useArchiveStore.getState();
      const reportWithMetadata = {
        id: generateId(),
        userId: currentUser.id,
        title: data.report.title,
        content: JSON.stringify({
          context_recognition: data.report.context_recognition,
          summary: data.report.summary,
          sections: data.report.sections,
          conclusion: data.report.conclusion,
          disclaimer: data.report.disclaimer
        }),
        date: new Date().toISOString(),
        metadata: {
          createdAt: new Date().toISOString(),
          sessionCount: sessionArray.length,
          contexts: sessionArray.map(s => s.context)
        }
      };

      console.log('최종 보고서 데이터:', reportWithMetadata);
      
      addReport(reportWithMetadata);
      alert('보고서가 생성되었습니다.');
      setActiveSession('archive');
    } catch (error) {
      console.error('보고서 생성 오류:', error);
      alert(error instanceof Error ? error.message : '보고서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleReportClick = (report: Report) => {
    // 리포트 클릭 시 처리
    console.log('Selected report:', report);
  };

  const handleSectorCheck = (sectorId: string, checked: boolean) => {
    setSectorRanks(prev => prev.map(sector => 
      sector.id === sectorId ? { ...sector, checked } : sector
    ));
  };

  const handleBasicStudyCheck = (taskId: string, completed: boolean) => {
    setSelectedTexts(prev => 
      prev.map(text => 
        text.id === taskId ? { ...text, completed } : text
      )
    );
  };

  const renderContent = () => {
    if (activeSession === 'archive') {
      const userData = sessionStorage.getItem('currentUser');
      const currentUser = userData ? JSON.parse(userData) : { id: 'guest' };
      const { reports } = useArchiveStore.getState();
      
      return (
        <div className="flex-1 overflow-y-auto bg-[#1f1f1f] p-6">
          <Archive
            userId={currentUser.id}
            reports={reports}
            onReportClick={handleReportClick}
          />
        </div>
      );
    }

    if (activeSession === 'investmentStyle') {
      return (
        <div className="flex-1 overflow-y-auto bg-[#1f1f1f] p-6">
          <InvestmentStyleTest />
        </div>
      );
    }

    return (
      <div className="h-full overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeSession !== 'home' && activeSession !== 'admin' ? (
              <header className="flex-shrink-0 h-32 bg-[#1f1f1f] border-b border-[#2f2f2f]">
                <div className="h-full px-6 flex items-center">
                  <nav className="w-full grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <Book 
                          size={20} 
                          className={usedSessions['기초공부하기'] ? 'text-amber-300' : 'text-gray-500'} 
                        />
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {selectedTexts && selectedTexts.map((text) => (
                          <div 
                            key={text.id} 
                            className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#2f2f2f] cursor-pointer"
                            onClick={() => handleBasicStudyCheck(text.id, !text.completed)}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${text.completed ? 'bg-amber-300' : 'bg-amber-300/50'}`} />
                            <span className="text-xs text-gray-400 truncate max-w-[100px]">{text.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <Search 
                          size={20} 
                          className={usedSessions['살펴보기'] ? 'text-blue-300' : 'text-gray-500'} 
                        />
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {sectorRanks.map((sector) => (
                          <div 
                            key={sector.id} 
                            className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#2f2f2f] cursor-pointer"
                            onClick={() => handleSectorCheck(sector.id, !sector.checked)}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${sector.checked ? 'bg-blue-300' : 'bg-blue-300/50'}`} />
                            <span className="text-xs text-gray-400 truncate max-w-[100px]">{sector.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <TrendingUp 
                          size={20} 
                          className={usedSessions['투자시작하기'] ? 'text-green-300' : 'text-gray-500'} 
                        />
                      </div>
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        {currentStep?.subTasks.map((task, index) => (
                          <React.Fragment key={task.id}>
                            <div 
                              className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#2f2f2f] cursor-pointer"
                              onClick={() => handleSubTaskComplete(task.id, !task.completed)}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-green-300' : 'bg-green-300/50'}`} />
                              <span className="text-xs text-gray-400 truncate max-w-[100px]">{task.title}</span>
                            </div>
                            {index < currentStep.subTasks.length - 1 && (
                              <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                className="text-green-300/50"
                              >
                                <path 
                                  d="M5 12h14M13 5l7 7-7 7" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <ChartBar 
                          size={20} 
                          className={usedSessions['분석하기'] ? 'text-pink-300' : 'text-gray-500'} 
                        />
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {myETFs.map((etf) => (
                          <div 
                            key={etf.code} 
                            className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#2f2f2f]"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-300/50" />
                            <span className="text-xs text-gray-400 truncate max-w-[100px]">{etf.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>
              </header>
            ) : null}

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {activeSession === 'admin' ? (
                  <div className="flex-1 overflow-y-auto">
                    <AdminDashboard />
                  </div>
                ) : activeSession === 'home' ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 py-12 px-8 home-dashboard">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-200 mb-2">
                          당신의 ETF 투자 파트너
                        </h2>
                        <p className="text-gray-400">
                          무엇을 도와드릴까요?
                        </p>
                      </div>
                      <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 gap-6">
                          {/* 기초공부하기 섹션 */}
                          <div className="bg-[#242424] rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-amber-300/10 flex items-center justify-center">
                                <Book size={20} className="text-amber-300" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-200">기초공부하기</h3>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">학습 진행률</span>
                                <span className="text-sm text-amber-300">32%</span>
                              </div>
                              <div className="h-1.5 bg-[#2f2f2f] rounded-full overflow-hidden">
                                <div className="h-full bg-amber-300 rounded-full w-[32%]" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-[#2f2f2f] rounded-lg p-2">
                                  <div className="text-xs text-gray-400 mb-1">최근 학습</div>
                                  <div className="text-sm text-amber-300">ETF 추적오차율</div>
                                </div>
                                <div className="bg-[#2f2f2f] rounded-lg p-2">
                                  <div className="text-xs text-gray-400 mb-1">남은 학습</div>
                                  <div className="text-sm text-gray-300">5개 챕터</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 투자시작하기 섹션 */}
                          <div className="bg-[#242424] rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-green-300/10 flex items-center justify-center">
                                <TrendingUp size={20} className="text-green-300" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-200">투자시작하기</h3>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">투자 준비도</span>
                                <span className="text-sm text-green-300">45%</span>
                              </div>
                              <div className="h-1.5 bg-[#2f2f2f] rounded-full overflow-hidden">
                                <div className="h-full bg-green-300 rounded-full w-[45%]" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-[#2f2f2f] rounded-lg p-2">
                                  <div className="text-xs text-gray-400 mb-1">현재 단계</div>
                                  <div className="text-sm text-green-300">계좌 개설</div>
                                </div>
                                <div className="bg-[#2f2f2f] rounded-lg p-2">
                                  <div className="text-xs text-gray-400 mb-1">다음 단계</div>
                                  <div 
                                    className="text-sm text-gray-300 cursor-pointer hover:text-green-300 transition-colors"
                                    onClick={() => {
                                      console.log('투자성향테스트 클릭됨');
                                      setActiveSession('investmentStyle');
                                    }}
                                  >
                                    투자성향 분석
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 살펴보기 섹션 */}
                          <div className="bg-[#242424] rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-300/10 flex items-center justify-center">
                                <Search size={20} className="text-blue-300" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-200">살펴보기</h3>
                            </div>
                            <div className="space-y-4">
                              <div className="text-sm text-gray-400 mb-2">실시간 인기 섹터</div>
                              <div className="grid grid-cols-2 gap-2">
                                {sectorRanks.slice(0, 4).map((sector) => (
                                  <div key={sector.id} className="bg-[#2f2f2f] rounded-lg p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-gray-400">{sector.name}</span>
                                      <span className={`text-xs ${sector.change >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                        {sector.change > 0 ? '+' : ''}{sector.change}%
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">{sector.etfs[0].name}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 분석하기 섹션 */}
                          <div className="bg-[#242424] rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-pink-300/10 flex items-center justify-center">
                                <ChartBar size={20} className="text-pink-300" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-200">분석하기</h3>
                            </div>
                            <div className="space-y-4">
                              <div className="text-sm text-gray-400 mb-2">보유 ETF 현황</div>
                              <div className="grid grid-cols-2 gap-2">
                                {myETFs.map((etf) => (
                                  <div key={etf.code} className="bg-[#2f2f2f] rounded-lg p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-gray-400">{etf.name}</span>
                                      <span className={`text-xs ${etf.change >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                        {etf.change > 0 ? '+' : ''}{etf.change}%
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      {etf.amount}주 / {etf.currentPrice.toLocaleString()}원
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 채팅 입력창 추가 */}
                    <div className="flex-shrink-0 p-6 relative">
                      <div className="max-w-3xl mx-auto">
                        <div className="p-0.5 rounded-2xl bg-white/10">
                          <ChatInput 
                            onSendMessage={handleSendMessage}
                            placeholder="ETFy가 도와드릴게요."
                            disabled={isLoading}
                            context={activeSession}
                            onNextCards={handleNextCards}
                            onFocus={() => setShowExampleQuestions(true)}
                            onBlur={() => setTimeout(() => setShowExampleQuestions(false), 200)}
                          />
                        </div>
                        
                        {/* 예시 질문 팝업 */}
                        <div 
                          className={`absolute bottom-full left-0 right-0 mb-2 px-6 transform transition-all duration-200 ease-out ${
                            showExampleQuestions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                          }`}
                        >
                          <div className="max-w-3xl mx-auto">
                            <div className="grid grid-cols-4 gap-2 recommendation-questions">
                              {exampleQuestions.map((example) => (
                                <button
                                  key={example.id}
                                  className={`p-2.5 rounded-2xl ${example.color} 
                                    transition-all duration-200 ease-out text-left
                                    hover:scale-[1.02] hover:brightness-110`}
                                  onClick={() => {
                                    handleSendMessage(example.question, example.id);
                                    setShowExampleQuestions(false);
                                  }}
                                >
                                  <p className="text-sm text-[#1f1f1f] font-medium">
                                    {example.question}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden bg-[#1f1f1f]">
                    <div className="flex-1 overflow-y-auto px-6 chat-messages-container">
                      <ChatMessages 
                        messages={messages} 
                        handleSendMessage={handleSendMessage} 
                        messagesEndRef={messagesEndRef}
                        context={activeSession}
                        isLoading={isLoading}
                        onSubTaskComplete={handleSubTaskComplete}
                        onAddSelectedText={handleAddSelectedText}
                      />
                    </div>
                    <div className="flex-shrink-0 p-4 bg-[#1f1f1f] border-t border-[#2f2f2f]">
                      <div className="max-w-3xl mx-auto">
                        <div className="p-0.5 rounded-2xl bg-white/10">
                          <ChatInput 
                            onSendMessage={handleSendMessage}
                            placeholder="메시지를 입력하세요..."
                            disabled={isLoading}
                            context={activeSession}
                            onNextCards={handleNextCards}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RightPanel 부분 */}
              <div className="w-80 flex-shrink-0 bg-[#242424] border-l border-[#2f2f2f] overflow-hidden">
                <div className="h-full">
                  <RightPanel 
                    activeSession={activeSession}
                    currentReferences={currentReferences}
                    relatedTopics={relatedTopics}
                    onTopicClick={setActiveSession}
                    currentStep={currentStep}
                    onSubTaskComplete={handleSubTaskComplete}
                    selectedTexts={selectedTexts}
                    onSectorSelect={handleSectorSelect}
                    allSteps={allInvestmentSteps}
                    currentStepIndex={currentStepIndex}
                    handleGenerateReport={handleGenerateReport}
                    sessionMessages={sessionMessages}
                    sectorRanks={sectorRanks}
                    myETFs={myETFs}
                    onSectorCheck={handleSectorCheck}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  };

  return renderContent();
};

export default MainContent;

