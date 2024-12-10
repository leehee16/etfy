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
  subTasks: SubTask[];
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
}

// 투자 시작하기 단계 정의
const investmentSteps: InvestmentStep[] = [
  {
    id: 1,
    title: "증권계좌 개설",
    description: "온라인으로 계좌 개설하기",
    completed: false,
    subTasks: []
  },
  {
    id: 2,
    title: "투자 성향 파악",
    description: "나의 투자 스타일 확인하기",
    completed: false,
    subTasks: []
  },
  {
    id: 3,
    title: "ETF 선택하기",
    description: "투자 목적에 맞는 ETF 찾기",
    completed: false,
    subTasks: []
  },
  {
    id: 4,
    title: "투자 실행",
    description: "실제 매수 주문하기",
    completed: false,
    subTasks: []
  }
];

const InvestmentProgress: React.FC<InvestmentProgressProps> = ({ 
  currentStep, 
  onSubTaskComplete 
}) => {
  // 디버깅용 로그
  console.log('InvestmentProgress component received:', {
    hasCurrentStep: !!currentStep,
    stepDetails: currentStep ? {
      id: currentStep.id,
      title: currentStep.title,
      progress: currentStep.progress,
      subTasksCount: currentStep.subTasks.length
    } : null
  });

  if (!currentStep) {
    console.log('InvestmentProgress: currentStep is undefined');
    return null;
  }

  const progress = currentStep.progress || 0;
  const completedSteps = Math.floor((progress / 100) * investmentSteps.length);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-200">투자 진행률</h3>
      {/* 프로그레스 바 */}
      <div className="w-full h-2 bg-gray-700 rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* 단계별 표시 */}
      <div className="space-y-3 mt-4">
        {investmentSteps.map((step, index) => {
          const isCurrentStep = currentStep.id === step.id;
          const isCompleted = index < completedSteps;
          
          return (
            <div 
              key={step.id}
              className={`p-3 rounded-lg border ${
                isCompleted 
                  ? 'border-violet-500 bg-violet-500/10' 
                  : isCurrentStep
                    ? 'border-pink-500 bg-pink-500/5'
                    : 'border-[#2f2f2f]'
              }`}
            >
              <h4 className="font-medium text-gray-200">
                {step.title}
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                {step.description}
              </p>
              
              {/* 현재 단계의 서브태스크 표시 */}
              {isCurrentStep && currentStep.subTasks && (
                <div className="space-y-2 mt-3 border-t border-gray-700 pt-3">
                  {currentStep.subTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={(checked) => {
                          onSubTaskComplete?.(task.id, checked);
                        }}
                        className="mt-1"
                      />
                      <div>
                        <label
                          htmlFor={task.id}
                          className="text-sm font-medium text-gray-200 cursor-pointer"
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
    </div>
  );
};

export default InvestmentProgress; 