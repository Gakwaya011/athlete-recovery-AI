import React, { useState, useRef, useEffect } from 'react';
import { Send, Sun, Moon, Menu } from 'lucide-react';
import { Message } from '../../types/chat';
import { sendMessage } from '../../api/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { SuggestionCards } from './SuggestionCards';
import { Logo } from '../ui/Logo';

interface ChatWindowProps {
  isDarkMode:    boolean;
  onToggleDark:  () => void;
  onMenuClick:   () => void;
  initialMessages?: Message[];
  initialSessionId?: number | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isDarkMode,
  onToggleDark,
  onMenuClick,
  initialMessages   = [],
  initialSessionId  = null,
}) => {
  const [messages, setMessages]     = useState<Message[]>(initialMessages);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [sessionId, setSessionId]   = useState<number | null>(initialSessionId);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const data = await sendMessage(newMessages, sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.session_id) setSessionId(data.session_id);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ **Could not connect.** Make sure the backend is running.',
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] dark:bg-[#1c1a17]">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3
                      border-b border-gray-200 dark:border-[#2e2b27]
                      bg-white dark:bg-[#1c1a17]">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 dark:text-gray-400"
          >
            <Menu size={20} />
          </button>
          <Logo size="sm" />
        </div>
        <button
          onClick={onToggleDark}
          className="w-8 h-8 rounded-full flex items-center justify-center
                     bg-gray-100 dark:bg-[#2a2723]
                     text-gray-500 dark:text-gray-400
                     hover:bg-gray-200 dark:hover:bg-[#333028] transition-colors"
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <SuggestionCards onSelect={handleSend} />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-5 bg-[#f5f5f5] dark:bg-[#1c1a17]">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white dark:bg-[#2a2723]
                          rounded-2xl border border-gray-200 dark:border-[#3a3630] shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask whatever you want..."
              rows={1}
              className="w-full bg-transparent text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500
                         rounded-2xl pl-5 pr-14 py-4 resize-none
                         focus:outline-none text-sm"
              style={{ minHeight: '52px', maxHeight: '160px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2.5 bottom-2.5 w-8 h-8
                         bg-amber-500 disabled:opacity-30
                         text-white rounded-lg flex items-center justify-center
                         transition-all hover:bg-amber-400"
            >
              {isLoading
                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={14} />
              }
            </button>
          </div>
          <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-2">
            nutri_athlete can make mistakes. Always check with a nutritionist for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};