import React, { useEffect, useState } from 'react';
import { Reference } from '@/types/chat';
import FadeIn from './FadeIn';
import Image from 'next/image';
import InvestmentProgress from './InvestmentProgress';
import { Checkbox } from './Checkbox';

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

interface RightPanelProps {
  activeSession: string;
  currentReferences: Reference[];
  relatedTopics: string[];
  onTopicClick: (topic: string) => void;
  currentStep?: CurrentStep;
  onSubTaskComplete?: (taskId: string, completed: boolean) => void;
  selectedTexts?: SubTask[];
  onSectorSelect?: (sectors: SectorRank[]) => void;
  allSteps?: Array<{
    id: number;
    title: string;
    description: string;
    progress: number;
    subTasks: SubTask[];
  }>;
  currentStepIndex?: number;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  activeSession, 
  currentReferences, 
  relatedTopics, 
  onTopicClick,
  currentStep,
  onSubTaskComplete,
  selectedTexts = [],
  onSectorSelect,
  allSteps,
  currentStepIndex
}) => {
  const [userName, setUserName] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
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

  useEffect(() => {
    const userStr = sessionStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || '');
    }
  }, []);

  // 디버깅용 로그
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('RightPanel State');
      console.log({
        activeSession,
        hasCurrentStep: !!currentStep,
        currentStepDetails: currentStep ? {
          id: currentStep.id,
          title: currentStep.title,
          progress: currentStep.progress,
          subTasksCount: currentStep.subTasks?.length
        } : null,
        shouldShowProgress: activeSession === '투자시작하기' && !!currentStep
      });
      console.groupEnd();
    }
  }, [activeSession, currentStep]);

  // currentStep이 변경될 때마다 체크
  useEffect(() => {
    if (activeSession === '투자시작하기' && currentStep) {
      console.log('Investment Progress will render with:', {
        stepId: currentStep.id,
        progress: currentStep.progress,
        subTasks: currentStep.subTasks
      });
    }
  }, [activeSession, currentStep]);

  // 섹터 체크박스 상태 변경 핸들러
  const handleSectorCheck = (sectorId: string, checked: boolean) => {
    const updatedSectors = sectorRanks.map(sector => 
      sector.id === sectorId ? { ...sector, checked } : sector
    );
    setSectorRanks(updatedSectors);
    onSectorSelect?.(updatedSectors);
  };

  if (activeSession === 'home') {
    return (
      <>
        <h3 className="text-2xl font-bold mb-4">
          <FadeIn 
            text={`${userName}님`}
            delay={300}
            className="bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text"
          />
        </h3>
        <ul className="space-y-2">
          <li>
            <FadeIn 
              text={"1월 4일 토요일\n\n"} 
              delay={800}
              className="text-gray-300 hover:text-gray-200 cursor-pointer font-bold text-lg whitespace-pre-line"
            />
          </li>
        </ul>
        <div className="border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f] transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">새로 나왔어요</span>
            <span className="text-gray-400 text-sm">2025.01</span>
          </div>
          <FadeIn delay={500}>
            <div className="relative">
              <Image 
                src="/images/valuechain2.png" 
                alt="SK하이닉스 밸류체인" 
                width={500}
                height={300}
                className="object-cover rounded-lg"
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"/>
            </div>
          </FadeIn>
          <div className="space-y-3 mt-4">
            <h3 className="text-lg font-bold text-gray-200">SK하이닉스밸류체인액티브</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300">#AI</span>
              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300">#반도체</span>
              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300">#밸류체인</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                인공지능(AI)과 관련된 반도체에 투자하는 새로운 ETF를 시장에 내놓았어요.
              </p>
              <p className="text-sm text-gray-400">
                이건 마치 로봇과 컴퓨터의 뇌를 만드는 회사들에 투자하는 것과 같아요.
              </p>
              <p className="text-sm text-gray-400">
                이렇게 새로운 ETF가 나오면, 사람들은 다양한 분야에 쉽게 투자할 수 있게 돼요.
              </p>
            </div>
            <button className="w-full mt-3 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors">
              자세히 알아보기
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* 기초공부하기 컨텍스트의 선택한 내용 */}
      {activeSession === '기초공부하기' && selectedTexts && selectedTexts.length > 0 && (
        <div className="border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f]/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold text-amber-300">또물어봥</h3>
          </div>
          <div className="space-y-3">
            {selectedTexts.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg bg-[#1f1f1f] hover:bg-[#2f2f2f] transition-all">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={(checked) => {
                    onSubTaskComplete?.(task.id, checked);
                  }}
                  className="mt-1 text-amber-300"
                />
                <div className="flex-1">
                  <label
                    htmlFor={task.id}
                    className={`text-sm font-medium cursor-pointer ${
                      task.completed ? 'text-amber-300' : 'text-gray-200'
                    }`}
                  >
                    {task.title}
                  </label>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 투자시작하기 컨텍스트의 진행상황 */}
      {activeSession === '투자시작하기' && currentStep && (
        <div className="border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f]/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold text-green-300">진행 절차에요</h3>
          </div>
          <InvestmentProgress
            currentStep={currentStep}
            onSubTaskComplete={onSubTaskComplete}
            allSteps={allSteps}
            currentStepIndex={currentStepIndex}
          />
        </div>
      )}

      {/* 살펴보기 컨텍스트의 섹터 순위 */}
      {activeSession === '살펴보기' && (
        <div className="border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f]/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold text-blue-300">오늘의 섹터는?</h3>
          </div>
          <div className="space-y-3">
            {sectorRanks.map((sector) => (
              <div key={sector.id}>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-[#1f1f1f] hover:bg-[#2f2f2f] transition-all cursor-pointer"
                     onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}>
                  <Checkbox
                    id={sector.id}
                    checked={sector.checked}
                    onCheckedChange={(checked) => handleSectorCheck(sector.id, checked)}
                    className="mt-1 text-blue-300"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-200">
                        {sector.name}
                      </span>
                      <span className={`text-sm font-medium ${
                        sector.change > 0 ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {sector.change > 0 ? '+' : ''}{sector.change}%
                      </span>
                    </div>
                  </div>
                </div>
                {selectedSector === sector.id && (
                  <div className="mt-2 ml-8 space-y-2">
                    {sector.etfs.map((etf, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-[#1f1f1f]/50">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-200">{etf.name}</span>
                          <span className="text-xs text-gray-400">{etf.code}</span>
                        </div>
                        <span className={`text-sm ${
                          etf.change > 0 ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {etf.change > 0 ? '+' : ''}{etf.change}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 분석하기 컨텍스트의 내 ETF 목록 */}
      {activeSession === '분석하기' && (
        <div className="border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f]/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold text-pink-300">내 ETF</h3>
          </div>
          <div className="space-y-3">
            {myETFs.map((etf, index) => (
              <div key={index} className="p-3 rounded-lg bg-[#1f1f1f] hover:bg-[#2f2f2f] transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200">{etf.name}</span>
                    <span className="text-xs text-gray-400">{etf.code}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    etf.change > 0 ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {etf.change > 0 ? '+' : ''}{etf.change}%
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-400">
                  <span>보유 {etf.amount}주</span>
                  <span>평균 {etf.purchasePrice.toLocaleString()}원</span>
                  <span>현재 {etf.currentPrice.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 참고자료 섹션 */}
      {currentReferences.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-200">참고했어요</h3>
          <div className="space-y-4">
            {currentReferences.map((ref, index) => (
              <div key={index} className="border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f] transition-colors">
                {ref.imageUrl && (
                  <img src={ref.imageUrl} alt={ref.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                )}
                <h4 className="font-medium text-gray-200 mb-2">{ref.title}</h4>
                <p className="text-sm text-gray-400">{ref.description}</p>
                {ref.url && (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-400 hover:text-blue-300 text-sm mt-2 block">
                    자세히 보기
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 주제 섹션 */}
      {relatedTopics.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-200">관련 주제</h3>
          <ul className="space-y-2">
            {relatedTopics.map((topic, index) => (
              <li 
                key={index}
                className="text-gray-300 hover:text-gray-200 cursor-pointer"
                onClick={() => onTopicClick(topic)}
              >
                # {topic}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RightPanel; 