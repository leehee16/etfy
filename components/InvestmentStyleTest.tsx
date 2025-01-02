import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "투자 경험이 얼마나 되시나요?",
    options: [
      { text: "투자 경험이 전혀 없습니다", score: 1 },
      { text: "1년 미만의 투자 경험이 있습니다", score: 2 },
      { text: "1-3년의 투자 경험이 있습니다", score: 3 },
      { text: "3-5년의 투자 경험이 있습니다", score: 4 },
      { text: "5년 이상의 투자 경험이 있습니다", score: 5 }
    ]
  },
  {
    id: 2,
    text: "투자 위험에 대해 어떻게 생각하시나요?",
    options: [
      { text: "위험을 전혀 감수하고 싶지 않습니다", score: 1 },
      { text: "약간의 위험은 감수할 수 있습니다", score: 2 },
      { text: "적절한 위험은 감수할 수 있습니다", score: 3 },
      { text: "높은 수익을 위해 위험을 감수할 수 있습니다", score: 4 },
      { text: "매우 높은 수익을 위해 큰 위험도 감수할 수 있습니다", score: 5 }
    ]
  }
];

const InvestmentStyleTest = () => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleStartTest = () => {
    setCurrentStep('test');
  };

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('result');
    }
  };

  const calculateResult = () => {
    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / answers.length;

    if (averageScore <= 1.5) return '안정형';
    if (averageScore <= 2.5) return '안정추구형';
    if (averageScore <= 3.5) return '위험중립형';
    if (averageScore <= 4.5) return '적극투자형';
    return '공격투자형';
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#1f1f1f]">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === 'intro' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-100">투자성향 테스트</h1>
              <div className="bg-[#242424] rounded-lg p-6 border border-[#2f2f2f]">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">나의 투자 성향 알아보기</h2>
                <p className="text-gray-300 mb-6">
                  투자 성향 테스트를 통해 자신에게 맞는 ETF 투자 전략을 찾아보세요.
                  테스트는 약 5분 정도 소요됩니다.
                </p>
                <button
                  onClick={handleStartTest}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  테스트 시작하기
                </button>
              </div>
              <div className="bg-[#242424] rounded-lg p-6 border border-[#2f2f2f]">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">투자 성향이란?</h2>
                <p className="text-gray-300 mb-4">
                  투자 성향은 투자자가 감수할 수 있는 위험 수준과 기대하는 수익률을 나타내는 지표입니다.
                  일반적으로 다음과 같은 유형으로 구분됩니다:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>안정형: 원금 보존을 최우선으로 하는 투자자</li>
                  <li>안정추구형: 원금 보존을 추구하면서 일정 수준의 수익을 기대하는 투자자</li>
                  <li>위험중립형: 위험과 수익의 균형을 추구하는 투자자</li>
                  <li>적극투자형: 높은 수익을 위해 일정 수준의 위험을 감수하는 투자자</li>
                  <li>공격투자형: 높은 수익을 위해 높은 위험을 감수하는 투자자</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 'test' && (
            <div className="bg-[#242424] rounded-lg p-6 border border-[#2f2f2f]">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">진행률</span>
                  <span className="text-sm text-gray-400">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                </div>
                <div className="w-full bg-[#1f1f1f] rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-6 text-gray-200">
                {questions[currentQuestion].text}
              </h2>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.score)}
                    className="w-full text-left p-4 rounded-lg bg-[#2f2f2f] hover:bg-[#3f3f3f] text-gray-300 transition-colors flex items-center justify-between group"
                  >
                    <span>{option.text}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'result' && (
            <div className="bg-[#242424] rounded-lg p-6 border border-[#2f2f2f]">
              <h2 className="text-xl font-semibold mb-6 text-gray-200">
                테스트 결과
              </h2>
              <div className="text-center mb-6">
                <p className="text-gray-300 mb-2">당신의 투자 성향은</p>
                <p className="text-3xl font-bold text-blue-500 mb-2">{calculateResult()}</p>
                <p className="text-gray-300">입니다.</p>
              </div>
              <div className="text-gray-300">
                <h3 className="font-semibold mb-2">투자 성향 설명</h3>
                <p className="mb-4">
                  {calculateResult() === '안정형' && '원금 보존을 최우선으로 하는 투자자입니다. 안정적인 ETF 상품을 중심으로 투자하는 것이 좋습니다.'}
                  {calculateResult() === '안정추구형' && '원금 보존을 추구하면서 일정 수준의 수익을 기대하는 투자자입니다. 국내 대형주 ETF나 채권 ETF를 중심으로 투자하는 것이 좋습니다.'}
                  {calculateResult() === '위험중립형' && '위험과 수익의 균형을 추구하는 투자자입니다. 국내외 주식 ETF와 채권 ETF를 적절히 혼합하여 투자하는 것이 좋습니다.'}
                  {calculateResult() === '적극투자형' && '높은 수익을 위해 일정 수준의 위험을 감수하는 투자자입니다. 해외 ETF나 섹터 ETF에 더 많은 비중을 둘 수 있습니다.'}
                  {calculateResult() === '공격투자형' && '높은 수익을 위해 높은 위험을 감수하는 투자자입니다. 레버리지 ETF나 특정 섹터에 집중 투자할 수 있습니다.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentStep('intro');
                  setCurrentQuestion(0);
                  setAnswers([]);
                }}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                테스트 다시하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentStyleTest;

