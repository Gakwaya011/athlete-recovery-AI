import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot } from 'lucide-react';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 
                        flex items-center justify-center shrink-0 mt-1 
                        bg-white dark:bg-gray-800">
          <Bot size={16} className="text-gray-900 dark:text-white" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 ${
        isUser
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl'
          : 'bg-transparent text-gray-900 dark:text-gray-100 rounded-lg'
      }`}>
        {!isUser ? (
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  );
};