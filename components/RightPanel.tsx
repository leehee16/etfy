import React from 'react';
import { Reference } from '@/types/chat';
import FadeIn from './FadeIn';

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
  if (activeSession === 'home') {
    return (
      <>
        <h3 className="text-2xl font-bold mb-4">
          <FadeIn 
            text="DeepBlend님" 
            delay={300}
            className="bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text"
          />
        </h3>
        <ul className="space-y-2">
          <li>
            <FadeIn 
              text="좋은 아침이에요" 
              delay={800}
              className="text-gray-300 hover:text-gray-200 cursor-pointer font-bold text-lg"
            />
          </li>
        </ul>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {currentReferences.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-200">참고 자료</h3>
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