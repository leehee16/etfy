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
  allSteps?: Array<{
    id: number;
    title: string;
    description: string;
    progress: number;
    subTasks: SubTask[];
  }>;
  currentStepIndex?: number;
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

const InvestmentProgress: React.FC<InvestmentProgressProps> = ({ 
  currentStep, 
  allSteps = [],
  currentStepIndex = 0,
  onSubTaskComplete,
  nextCards = []
}) => {
  if (!currentStep) {
    console.log('InvestmentProgress: currentStep is undefined');
    return null;
  }

  const progress = currentStep.progress || 0;

  return (
    <div className="space-y-4">
      {/* 프로그레스 바 */}
      <div className={`w-full h-2 bg-gray-700 rounded-full ${themeColors.border}`}>
        <div 
          className={`h-full bg-gradient-to-r ${themeColors.gradient} rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* 모든 단계 표시 */}
      <div className="space-y-3 mt-4">
        {allSteps.map((step, index) => {
          const isCurrentStep = index === currentStepIndex;
          const isCompleted = index < currentStepIndex || (index === currentStepIndex && step.progress === 100);
          const isLocked = index > currentStepIndex;
          
          return (
            <div 
              key={step.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                isCompleted 
                  ? `${themeColors.border} ${themeColors.bg}` 
                  : isCurrentStep
                    ? `${themeColors.borderLight} ${themeColors.bgLight}`
                    : isLocked
                      ? 'border-[#2f2f2f] opacity-50'
                      : 'border-[#2f2f2f]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${
                  isCompleted || isCurrentStep ? themeColors.text : 'text-gray-200'
                }`}>
                  {step.title}
                </h4>
                {isLocked && (
                  <span className="text-xs text-gray-400">🔒 잠김</span>
                )}
                {isCompleted && (
                  <span className="text-xs text-green-400">✓ 완료</span>
                )}
                {(!isCompleted && !isLocked) && (
                  <span className="text-xs text-gray-400">{Math.round(step.progress)}%</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">
                {step.description}
              </p>
              
              {/* 현재 단계의 서브태스크 표시 */}
              {isCurrentStep && (
                <div className={`space-y-2 mt-3 border-t ${themeColors.borderLight} pt-3`}>
                  {step.subTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={(checked) => {
                          onSubTaskComplete?.(task.id, checked);
                        }}
                        className={`mt-1 ${themeColors.text}`}
                      />
                      <div className={task.completed ? `${themeColors.text}` : ''}>
                        <label
                          htmlFor={task.id}
                          className={`text-sm font-medium cursor-pointer ${
                            task.completed ? themeColors.text : 'text-gray-200'
                          }`}
                        >
                          {task.title}
                        </label>
                        <p className={`text-xs ${task.completed ? '' : 'text-gray-400'}`}>
                          {task.description}
                        </p>
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