import React, { useEffect, useState } from 'react';
import { Reference } from '@/types/chat';
import FadeIn from './FadeIn';
import Image from 'next/image';
import InvestmentProgress from './InvestmentProgress';

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

interface RightPanelProps {
  activeSession: string;
  currentReferences: Reference[];
  relatedTopics: string[];
  onTopicClick: (topic: string) => void;
  currentStep?: CurrentStep;
  onSubTaskComplete?: (taskId: string, completed: boolean) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  activeSession, 
  currentReferences, 
  relatedTopics, 
  onTopicClick,
  currentStep,
  onSubTaskComplete
}) => {
  const [userName, setUserName] = useState('');

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
              text={"좋은 하루되세요😀\n\n"} 
              delay={800}
              className="text-gray-300 hover:text-gray-200 cursor-pointer font-bold text-lg whitespace-pre-line"
            />
          </li>
        </ul>
        <div className="border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f] transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">새로 나왔어요</span>
            <span className="text-gray-400 text-sm">2024.01</span>
          </div>
          <FadeIn delay={500}>
            <div className="relative">
              <Image 
                src="/images/valuechain.png" 
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
            <h3 className="text-lg font-bold text-gray-200">UNICORN SK하이닉스밸류체인액티브</h3>
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
      {/* 디버깅용 로그 */}
      {console.log('RightPanel rendering conditions:', {
        activeSession,
        hasCurrentStep: !!currentStep,
        shouldShowProgress: activeSession === '투자시작하기' && !!currentStep,
        currentStepDetails: currentStep ? {
          id: currentStep.id,
          title: currentStep.title,
          subTasksCount: currentStep.subTasks.length
        } : null
      })}

      {/* 투자 시작하기 컨텍스트에서 InvestmentProgress 표시 */}
      {activeSession === '투자시작하기' && currentStep && (
        <>
          {console.log('Rendering InvestmentProgress component')}
          <div className="mb-6 border border-[#2f2f2f] rounded-lg p-4 hover:bg-[#2f2f2f]/50 transition-all">
            <InvestmentProgress
              currentStep={currentStep}
              onSubTaskComplete={onSubTaskComplete}
            />
          </div>
        </>
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