import React, { useState, useRef, useEffect } from 'react';
import { Book, TrendingUp, Search, BarChartIcon as ChartBar, FileText } from 'lucide-react';
import RightPanel from './RightPanel';
import { Reference } from '@/types/chat';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import dynamic from 'next/dynamic';
import { useArchiveStore } from '@/lib/store/archiveStore';
import Archive from './Archive';

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);

    try {
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
    setSelectedTexts(prev => [...prev, newTask]);
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
        id: crypto.randomUUID(),
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

    return (
      <div className="h-full overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex-shrink-0 h-16 bg-[#1f1f1f] border-b border-[#2f2f2f]">
              <div className="h-full px-6 flex items-center">
                {activeSession !== 'home' && activeSession !== 'admin' && (
                  <nav className="flex items-center space-x-1">
                    {[
                      { id: '기초공부하기', icon: <Book size={16} /> },
                      { id: '투자시작하기', icon: <TrendingUp size={16} /> },
                      { id: '살펴보기', icon: <Search size={16} /> },
                      { id: '분석하기', icon: <ChartBar size={16} /> },
                      { 
                        id: '보고서 생성', 
                        icon: (
                          <div className="relative">
                            <FileText size={16} />
                            {isGeneratingReport && (
                              <div className="absolute -top-1 -right-1 w-2 h-2">
                                <div className="absolute w-full h-full rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                              </div>
                            )}
                          </div>
                        )
                      }
                    ].map((item) => (
                      <div key={item.id} className="relative">
                        <button
                          onClick={() => {
                            if (item.id === '보고서 생성') {
                              handleGenerateReport();
                            } else {
                              setActiveSession(item.id);
                            }
                          }}
                          className={`
                            group relative px-4 py-2 rounded-lg transition-all duration-300 w-full
                            ${item.id === '보고서 생성'
                              ? 'text-gray-400 hover:text-gray-300'
                              : activeSession === item.id 
                                ? 'bg-[#2f2f2f] text-gray-200' 
                                : 'text-gray-400 hover:text-gray-300'
                            }
                          `}
                        >
                          {item.id === '보고서 생성' && (
                            <>
                              <div className="absolute inset-0 rounded-lg overflow-hidden">
                                <div 
                                  className="w-[150%] h-[150%] absolute top-[-25%] left-[-25%] animate-rotate-border"
                                  style={{
                                    background: Object.values(sessionMessages).some(messages => messages.length > 0)
                                      ? `conic-gradient(
                                          from 0deg at 50% 50%,
                                          transparent 0%,
                                          ${(() => {
                                            const allMessages = Object.entries(sessionMessages)
                                              .flatMap(([context, messages]) => 
                                                messages.map(() => ({
                                                  context,
                                                  color: cardStyles[context as keyof typeof cardStyles]?.dotColor
                                                }))
                                              );
                                            
                                            const totalMessages = allMessages.length;
                                            const totalLength = totalMessages >= 4 ? 100 : 20 + (totalMessages * 10);
                                            const segmentLength = totalLength / totalMessages;

                                            return allMessages
                                              .map((msg, index) => {
                                                const startPercent = index * segmentLength;
                                                const endPercent = (index + 1) * segmentLength;
                                                return `${msg.color} ${startPercent}%, ${msg.color} ${endPercent}%`;
                                              })
                                              .join(', ');
                                          })()},
                                          transparent ${
                                            Object.values(sessionMessages)
                                              .reduce((sum, messages) => sum + messages.length, 0) >= 4 
                                                ? '100' 
                                                : 20 + (Object.values(sessionMessages)
                                                    .reduce((sum, messages) => sum + messages.length, 0) * 10)
                                          }%,
                                          transparent 100%
                                        )`
                                      : 'transparent',
                                    filter: `blur(${Math.min(15 + (Object.values(sessionMessages)
                                      .reduce((sum, messages) => sum + messages.length, 0) * 5), 30)}px)`,
                                    opacity: Math.min(0.7 + (Object.values(sessionMessages)
                                      .reduce((sum, messages) => sum + messages.length, 0) * 0.1), 1)
                                  }}
                                />
                              </div>
                              <div 
                                className="absolute inset-[1px] bg-[#242424] rounded-lg"
                                style={{
                                  background: 'linear-gradient(180deg, rgba(36,36,36,0.9) 0%, rgba(36,36,36,1) 100%)'
                                }}
                              />
                            </>
                          )}
                          <div className="relative flex items-center space-x-2">
                            {item.id !== '보고서 생성' && sessionMessages[item.id]?.length > 0 && (
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cardStyles[item.id as keyof typeof cardStyles]?.dotColor }}
                              />
                            )}
                            {item.icon}
                            <span className="text-sm font-medium">{item.id}</span>
                          </div>
                        </button>
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {activeSession === 'admin' ? (
                  <div className="flex-1 overflow-y-auto">
                    <AdminDashboard />
                  </div>
                ) : activeSession === 'home' ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 py-6 px-6">
                      <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-200 mb-2">
                          당신의 ETF 투자 파트너
                        </h2>
                        <p className="text-gray-400">
                          무엇을 도와드릴까요?
                        </p>
                      </div>
                      <div className="max-w-xl mx-auto mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-lg overflow-hidden">
                            <div 
                              className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%]"
                              style={{
                                background: hoverColor || defaultGradient,
                                filter: 'blur(8px)',
                                opacity: 0.8,
                                animation: 'spin 8s linear infinite'
                              }}
                            />
                          </div>
                          <div 
                            className="absolute inset-[1px] rounded-lg"
                            style={{
                              background: 'linear-gradient(180deg, rgba(36,36,36,0.7) 0%, rgba(36,36,36,0.8) 100%)'
                            }}
                          />
                          <div className="relative p-[1px]">
                            <ChatInput 
                              onSendMessage={handleSendMessage}
                              placeholder="ETFy가 도와드릴게요."
                              disabled={isLoading}
                              context={activeSession}
                              onNextCards={handleNextCards}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 카드 섹션 */}
                      <div className="grid grid-cols-2 gap-6">
                        <DashboardCard
                          title="기초공부하기"
                          content={
                            <div className="flex flex-col h-full p-3 w-full">
                              <div className="flex items-center justify-between text-amber-300 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">📖</span>
                                  <p className="text-xs whitespace-nowrap">최근 학습한 용어</p>
                                </div>
                              </div>
                              <div className="min-h-[40px] relative">
                                <p className="text-gray-300 text-sm group-hover:hidden absolute">ETF 추적오차율</p>
                                <p className="text-gray-300 text-xs leading-relaxed hidden group-hover:block absolute">
                                  목표와 실제 성적이 얼마나 다른지 알려주는 숫자
                                </p>
                              </div>
                              <div className="flex gap-2 mt-auto w-full">
                                <span className="flex-1 text-center truncate px-2 py-1.5 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help">레버리지</span>
                                <span className="flex-1 text-center truncate px-2 py-1.5 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help">인버스</span>
                                <span className="flex-1 text-center truncate px-2 py-1.5 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help">시총가중</span>
                              </div>
                            </div>
                          }
                          icon={<Book size={20} />}
                          style={cardStyles['기초공부하기']}
                          onClick={() => handleCardClick('기초공부하기')}
                          onMouseEnter={() => setHoverColor(yellowGradient)}
                          onMouseLeave={() => setHoverColor(null)}
                        />

                        <DashboardCard
                          title="투자시작하기"
                          content={
                            <div className="flex flex-col h-full p-3 w-full">
                              <div className="flex items-center justify-between text-green-300 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">💡</span>
                                  <p className="text-xs whitespace-nowrap">새로운 투자 방법</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">ISA 계좌로 ETF 투자하기</p>
                              <div className="flex gap-2 mt-auto w-full">
                                <span className="flex-1 text-center truncate px-2 py-1.5 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help">계좌개설</span>
                                <span className="flex-1 text-center truncate px-2 py-1.5 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help">투자성향</span>
                                <span className="flex-1 text-center truncate px-2 py-1.5 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help">매매하기</span>
                              </div>
                            </div>
                          }
                          icon={<TrendingUp size={20} />}
                          style={cardStyles['투자시작하기']}
                          onClick={() => handleCardClick('투자시작하기')}
                          onMouseEnter={() => setHoverColor(greenGradient)}
                          onMouseLeave={() => setHoverColor(null)}
                        />

                        <DashboardCard
                          title="살펴보기"
                          content={
                            <div className="flex flex-col h-full p-3 w-full">
                              <div className="flex items-center justify-between text-blue-300 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🔥</span>
                                  <p className="text-xs whitespace-nowrap">실간 HOT</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm">AI 테마 ETF 급등 원인 분석</p>
                            </div>
                          }
                          icon={<Search size={20} />}
                          style={cardStyles['살펴보기']}
                          onClick={() => handleCardClick('살펴보기')}
                          onMouseEnter={() => setHoverColor(blueGradient)}
                          onMouseLeave={() => setHoverColor(null)}
                        />

                        <DashboardCard
                          title="분석하기"
                          content={
                            <div className="flex flex-col h-full p-3 w-full">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-300">KODEX 200</span>
                                <span className="text-xs text-green-400">+2.0%</span>
                              </div>
                              <div className="flex-1">
                                <SimpleLineChart />
                              </div>
                            </div>
                          }
                          icon={<ChartBar size={20} />}
                          style={cardStyles['분석하기']}
                          onClick={() => handleCardClick('분석하기')}
                          onMouseEnter={() => setHoverColor(pinkGradient)}
                          onMouseLeave={() => setHoverColor(null)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden bg-[#1f1f1f]">
                    <div className="flex-1 overflow-y-auto px-6">
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
                )}
              </div>

              {/* RightPanel 부분 */}
              <div className="w-80 flex-shrink-0 bg-[#242424] border-l border-[#2f2f2f] flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <RightPanel 
                      activeSession={activeSession}
                      currentReferences={currentReferences}
                      relatedTopics={relatedTopics}
                      onTopicClick={handleSendMessage}
                      currentStep={currentStep}
                      onSubTaskComplete={handleSubTaskComplete}
                      selectedTexts={selectedTexts}
                      onSectorSelect={handleSectorSelect}
                      allSteps={allInvestmentSteps}
                      currentStepIndex={currentStepIndex}
                    />
                  </div>
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

