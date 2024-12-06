import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface SearchInputProps {
  onSendMessage: (message: string) => void;
  placeholder: string;
  disabled: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSendMessage, placeholder, disabled }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSendMessage(query);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-3 rounded-lg border border-[#2f2f2f] bg-[#242424] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3f3f3f] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default SearchInput;

