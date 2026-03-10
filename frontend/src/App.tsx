import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from './types/chat';
import { sendMessage } from './api/chat';

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4">
    <div className="bg-blue-600 rounded-full p-4 mb-4">
      <span className="text-4xl">🏋️</span>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">
      Sports Nutrition AI
    </h2>
    <p className="text-gray-400 max-w-md mb-6">
      Your personal East African sports nutrition assistant. 
      Tell me about your workout and I'll build a personalized recovery meal plan.
    </p>
    <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
      {[
        "I played basketball for 3 hours, 68kg, male, 19 years old",
        "I just finished a 10km run, female, 25 years old, 58kg",
        "I did 90 minutes of football training, 75kg, male"
      ].map((suggestion, i) => (
        <button
          key={i}
          className="text-left text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 
                     border border-gray-700 rounded-lg px-4 py-3 transition-colors"
          onClick={() => {
            const event = new CustomEvent('suggestion', { detail: suggestion });
            window.dispatchEvent(event);
          }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-start gap-3 mb-4">
    <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
      <span className="text-sm">🤖</span>
    </div>
    <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
      <div className="flex gap-1 items-center h-5">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
      </div>
    </div>
  </div>
);

export default function App() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handler = (e: Event) => {
      const suggestion = (e as CustomEvent).detail;
      handleSend(suggestion);
    };
    window.addEventListener('suggestion', handler);
    return () => window.removeEventListener('suggestion', handler);
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const data = await sendMessage(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I could not connect to the nutrition server. Please make sure the backend is running.'
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
    <div className="flex flex-col h-screen bg-gray-900 text-white">

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <div className="bg-blue-600 rounded-lg p-2">
          <span className="text-xl">🏋️</span>
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">
            Sports Nutrition <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-gray-400 text-xs">East African Athlete Recovery</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
          <span className="text-gray-400 text-xs">Online</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 mb-4 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`rounded-full w-8 h-8 flex items-center justify-center 
                                flex-shrink-0 text-sm ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-blue-600'
                }`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-100 rounded-tl-none'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your workout... (e.g. 'I played basketball for 2 hours')"
              rows={1}
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-xl 
                         px-4 py-3 resize-none focus:outline-none focus:ring-2 
                         focus:ring-blue-500 text-sm"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 
                       disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 
                       transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent 
                              rounded-full animate-spin"/>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-2">
          Powered by RAG + ACSM · IOC · UEFA · FIFA sports science
        </p>
      </div>

    </div>
  );
}