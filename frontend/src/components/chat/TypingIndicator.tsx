import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-4 mb-6">
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                    rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
      <Bot size={16} className="text-gray-900 dark:text-white" />
    </div>
    <div className="px-2 py-4 flex gap-1.5 items-center">
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
    </div>
  </div>
);