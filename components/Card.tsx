import React from 'react';

export interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ icon, title, description, color, onClick }) => {
  return (
    <button 
      className={`bg-[#242424] hover:bg-[#2f2f2f] p-6 rounded-lg text-left w-full transition-all duration-300 hover:scale-104 focus:outline-none`}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className="mr-4 text-gray-300">{icon}</div>
        <h3 className="text-xl font-medium text-gray-200">{title}</h3>
      </div>
      <p className="text-gray-400">{description}</p>
    </button>
  );
};

export default Card; 