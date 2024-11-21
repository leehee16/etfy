import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

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

  const handleAttachment = () => {
    console.log('Attachment button clicked');
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
          className={`w-full p-2 pr-20 rounded-lg border border-borderMain dark:border-borderMainDark bg-background dark:bg-backgroundDark text-textMain dark:text-textMainDark focus:outline-none focus:ring-2 focus:ring-super dark:focus:ring-superDark ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <button
          type="button"
          onClick={handleAttachment}
          disabled={disabled}
          className={`absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Paperclip size={18} />
        </button>
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark ${(disabled || !query.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default SearchInput;

