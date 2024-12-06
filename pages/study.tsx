import ChatSession from '../components/ChatSession';

const StudyPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">코드 공부하기</h1>
      <ChatSession />
    </div>
  );
};

export default StudyPage; 