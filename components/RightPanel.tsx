import React, { useEffect, useState } from 'react';
import { Reference } from '@/types/chat';
import FadeIn from './FadeIn';
import Image from 'next/image';

interface RightPanelProps {
  activeSession: string;
  currentReferences: Reference[];
  relatedTopics: string[];
  onTopicClick: (topic: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  activeSession, 
  currentReferences, 
  relatedTopics, 
  onTopicClick 
}) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 세션 스토리지에서 사용자 정보 가져오기
    const userStr = sessionStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || '');
    }
  }, []);

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
          <FadeIn delay={500}>
              <Image 
                src="/images/valuechain.png" 
                alt="SK하이닉스 밸류체인" 
                width={500}
                height={300}
                className="object-cover rounded-lg"
                style={{ objectFit: 'cover' }}
              />
          </FadeIn>
          <FadeIn 
            text={"UNICORN SK하이닉스밸류체인액티브\n\n" + 
                 "인공지능(AI)**과 관련된 반도체에 투자하는 새로운 ETF를 시장에 내놓았어요.\n\n" +
                 "이건 마치 로봇과 컴퓨터의 뇌를 만드는 회사들에 투자하는 것과 같아요.\n\n" +
                 "이렇게 새로운 ETF가 나오면, 사람들은 다양한 분야에 쉽게 투자할 수 있게 돼요."}
            delay={800}
            className="text-gray-300 hover:text-gray-200 cursor-pointer font-bold text-base whitespace-pre-line leading-relaxed"
          />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
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