'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { Step, CallBackProps } from 'react-joyride';
import { STATUS } from 'react-joyride';

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

interface GuideModeProps {
  isActive: boolean;
  onFinish: () => void;
  activeSession?: string;
}

const GuideMode: React.FC<GuideModeProps> = ({ isActive, onFinish, activeSession = 'home' }) => {
  const homeSteps: Step[] = [
    {
      target: '.logo-button',
      content: '이곳을 클릭하면 홈 화면으로 돌아갈 수 있어요.',
      placement: 'right',
      disableOverlay: false,
    },
    {
      target: '.home-dashboard',
      content: 'ETF 투자를 위한 대시보드가 표시돼요.',
      placement: 'center',
      disableBeacon: true,
      disableOverlay: false,
    },
    {
      target: '.chat-button',
      content: '잇삐와 계속 대화 할 수 있어요.',
      placement: 'right',
      disableOverlay: false,
    },
    {
      target: '.flex-1.overflow-y-auto.px-6',
      content: '채팅창에서는 ETF와 관련된 모든 질문이 가능해요. 차트나 이미지도 붙여넣어보세요.',
      placement: 'left',
      disableBeacon: true,
      disableOverlay: false,
    },
    {
      target: '.p-0\\.5.rounded-2xl.bg-white\\/10',
      content: '채팅창에서는 ETF와 관련된 모든 질문이 가능해요. 차트나 이미지도 붙여넣어보세요.',
      placement: 'top',
      disableBeacon: true,
      disableOverlay: false,
    },
    {
      target: '.investment-style-button',
      content: '투자 성향 테스트를 통해 나에게 맞는 ETF 투자 방식을 찾아보세요.',
      placement: 'right',
      disableOverlay: false,
    },
    {
      target: '.archive-button',
      content: '지금까지 나눈 대화와 학습 내용을 바탕으로 맞춤형 보고서를 생성해드려요. 나만의 ETF 투자 가이드북으로 활용해보세요.',
      placement: 'right',
      disableOverlay: false,
    },
    {
      target: '.guide-mode-button',
      content: '사용 방법이 기억나지 않으시나요? 이 버튼을 클릭하면 언제든지 다시 가이드를 볼 수 있어요.',
      placement: 'right',
      disableOverlay: false,
    }
  ];

  const chatSteps: Step[] = [
    {
      target: 'header',
      content: '상단에서는 각 섹션별로 질문할 데이터를 넣을 수 있어요.',
      placement: 'bottom',
      disableOverlay: false,
    },
    {
      target: '.chat-messages-container',
      content: '채팅창에서는 잇삐와의 대화가 표시돼요.',
      placement: 'left',
      disableBeacon: true,
      disableOverlay: false,
    },
    {
      target: '.p-0\\.5.rounded-2xl.bg-white\\/10',
      content: '채팅창에서는 ETF와 관련된 모든 질문이 가능해요. 차트나 이미지도 붙여넣어보세요.',
      placement: 'top',
      disableBeacon: true,
      disableOverlay: false,
    },
    {
      target: '.w-80.flex-shrink-0',
      content: '오른쪽 패널에서는 대화 내용을 바탕으로 다양한 기능을 사용할 수 있어요.',
      placement: 'left',
      disableOverlay: false,
    },
    {
      target: '.generate-report-button',
      content: '지금까지 주고받은 대화를 통해 나만의 보고서를 받아볼 수 있어요.',
      placement: 'left',
      disableOverlay: false,
    },
    {
      target: '.action-buttons',
      content: '4가지 기능을 사용할 수 있어요.',
      placement: 'left',
      disableOverlay: false,
    }
  ];

  const steps = activeSession === 'home' ? homeSteps : chatSteps;

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish();
    }
  };

  if (!isActive) return null;

  return (
    <Joyride
      steps={steps}
      run={isActive}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks
      styles={{
        options: {
          primaryColor: '#4CAF50',
          textColor: '#f8f9fa',
          backgroundColor: '#242424',
          arrowColor: '#242424',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: '#4CAF50',
          fontSize: '14px',
          padding: '8px 16px',
          whiteSpace: 'nowrap',
          marginLeft: '10px',
        },
        buttonBack: {
          color: '#f8f9fa',
          fontSize: '14px',
          padding: '8px 16px',
          whiteSpace: 'nowrap',
        },
        buttonSkip: {
          color: '#f8f9fa',
          fontSize: '14px',
          padding: '8px 16px',
          whiteSpace: 'nowrap',
        },
        buttonClose: {
          color: '#f8f9fa',
          fontSize: '14px',
          padding: '8px',
          marginLeft: '10px',
        },
        tooltip: {
          padding: '16px',
          fontSize: '14px',
          maxWidth: '400px',
          lineHeight: '1.6',
        },
        tooltipContainer: {
          textAlign: 'left',
          padding: '8px 8px 0 8px',
        },
        tooltipTitle: {
          marginRight: '35px',
        },
        tooltipContent: {
          padding: '8px 8px 0 8px',
        },
        tooltipFooter: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: '16px',
          padding: '8px',
        },
        spotlight: {
          borderRadius: 4,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)',
        },
        overlay: {
          backgroundColor: 'transparent',
        },
      }}
      callback={handleJoyrideCallback}
      locale={{
        back: '이전',
        close: '닫기',
        last: '완료',
        next: '다음',
        skip: '건너뛰기'
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};

export default GuideMode;