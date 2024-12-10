import React from 'react';
import { Checkbox } from './Checkbox';

interface SubTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number;
}

interface InvestmentStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  defaultSubTasks: SubTask[];
}

interface InvestmentProgressProps {
  currentStep?: {
    id: number;
    title: string;
    description: string;
    progress: number;
    subTasks: SubTask[];
  };
  onSubTaskComplete?: (taskId: string, completed: boolean) => void;
  nextCards?: Array<{
    title: string;
    description: string;
  }>;
}

// 투자시작하기 테마 색상
const themeColors = {
  primary: '#81C784',
  secondary: '#4CAF50',
  gradient: 'from-green-400 to-green-600',
  border: 'border-green-500',
  borderLight: 'border-green-400',
  bg: 'bg-green-500/10',
  bgLight: 'bg-green-400/5',
  text: 'text-green-400'
};

// 투자 단계 정보 (LLM이 생성할 수 있는 구조)
const INVESTMENT_STEPS: InvestmentStep[] = [
  {
    id: 1,
    title: "증권계좌 개설",
    description: "온라인으로 계좌 개설하기",
    completed: false,
    defaultSubTasks: [
      {
        id: "account-verify",
        title: "본인 인증하기",
        description: "신분증과 계좌 정보로 본인 확인",
        completed: false,
        weight: 25
      }
    ]
  },
  {
    id: 2,
    title: "투자 성향 파악",
    description: "나의 투자 스타일 확인하기",
    completed: false,
    defaultSubTasks: [
      {
        id: "risk-assessment",
        title: "투자 성향 진단",
        description: "나의 위험 감수 성향 확인하기",
        completed: false,
        weight: 25
      }
    ]
  },
  {
    id: 3,
    title: "ETF 선택하기",
    description: "투자 목적에 맞는 ETF 찾기",
    completed: false,
    defaultSubTasks: [
      {
        id: "etf-research",
        title: "ETF 정보 확인",
        description: "ETF의 기본 정보와 수익률 확인",
        completed: false,
        weight: 25
      }
    ]
  },
  {
    id: 4,
    title: "투자 실행",
    description: "실제 매수 주문하기",
    completed: false,
    defaultSubTasks: [
      {
        id: "order-check",
        title: "주문 정보 확인",
        description: "매수 수량과 금액 확인하기",
        completed: false,
        weight: 25
      }
    ]
  }
];

const InvestmentProgress: React.FC<InvestmentProgressProps> = ({ 
  currentStep, 
  onSubTaskComplete,
  nextCards = []
}) => {
  if (!currentStep) {
    console.log('InvestmentProgress: currentStep is undefined');
    return null;
  }

  const progress = currentStep.progress || 0;
  const completedSteps = Math.floor((progress / 100) * 4);

  // 현재 단계의 기본 서브태스크 가져오기
  const getCurrentStepDefaultSubTasks = () => {
    const step = INVESTMENT_STEPS.find(s => s.id === currentStep.id);
    return step?.defaultSubTasks || [];
  };

  // 현재 단계의 서브태스크와 기본 서브태스크 병합
  const mergedSubTasks = [...getCurrentStepDefaultSubTasks(), ...currentStep.subTasks];

  return (
    <div className="space-y-4">
      <h3 className={`text-xl font-bold ${themeColors.text}`}>진행 과정이에요.</h3>
      {/* 프로그레스 바 */}
      <div className={`w-full h-2 bg-gray-700 rounded-full ${themeColors.border}`}>
        <div 
          className={`h-full bg-gradient-to-r ${themeColors.gradient} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* 단계별 표시 */}
      <div className="space-y-3 mt-4">
        {INVESTMENT_STEPS.map((step) => {
          const isCurrentStep = currentStep.id === step.id;
          const isCompleted = step.id <= completedSteps;
          
          return (
            <div 
              key={step.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                isCompleted 
                  ? `${themeColors.border} ${themeColors.bg}` 
                  : isCurrentStep
                    ? `${themeColors.borderLight} ${themeColors.bgLight}`
                    : 'border-[#2f2f2f]'
              }`}
            >
              <h4 className={`font-medium ${isCompleted || isCurrentStep ? themeColors.text : 'text-gray-200'}`}>
                {step.title}
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                {step.description}
              </p>
              
              {/* 현재 단계의 서브태스크 표시 */}
              {isCurrentStep && (
                <div className={`space-y-2 mt-3 border-t ${themeColors.borderLight} pt-3`}>
                  {mergedSubTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={(checked) => {
                          onSubTaskComplete?.(task.id, checked);
                        }}
                        className={`mt-1 ${themeColors.text}`}
                      />
                      <div>
                        <label
                          htmlFor={task.id}
                          className={`text-sm font-medium cursor-pointer ${
                            task.completed ? themeColors.text : 'text-gray-200'
                          }`}
                        >
                          {task.title}
                        </label>
                        <p className="text-xs text-gray-400">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Cards 섹션 */}
      {nextCards.length > 0 && (
        <div className="mt-6">
          <h3 className={`text-xl font-bold ${themeColors.text} mb-3`}>다음 단계</h3>
          <div className="space-y-3">
            {nextCards.map((card, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${themeColors.borderLight} ${themeColors.bgLight}`}
              >
                <h4 className="font-medium text-gray-200">{card.title}</h4>
                <p className="text-sm text-gray-400">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentProgress; 