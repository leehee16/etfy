import React, { useState, useEffect } from 'react';

interface FadeInProps {
  text: string;
  delay?: number;
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({ text, delay = 500, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <span 
      className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {text}
    </span>
  );
};

export default FadeIn; 