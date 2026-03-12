import React from 'react';
import { RefreshCw, Dumbbell, Timer, Flame, Wind } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SUGGESTIONS = [
  {
    icon: <Dumbbell size={16} className="text-gray-400 dark:text-gray-500" />,
    text: "I just finished a 90-min football match",
  },
  {
    icon: <Wind size={16} className="text-gray-400 dark:text-gray-500" />,
    text: "I ran 10km this morning, what should I eat?",
  },
  {
    icon: <Timer size={16} className="text-gray-400 dark:text-gray-500" />,
    text: "I did a 2-hour basketball game, I'm 72kg",
  },
  {
    icon: <Flame size={16} className="text-gray-400 dark:text-gray-500" />,
    text: "I just finished gym, want to build muscle",
  },
];

interface SuggestionCardsProps {
  onSelect: (text: string) => void;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ onSelect }) => {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'Athlete';

  return (
    <div className="flex flex-col justify-center h-full max-w-2xl mx-auto px-6 py-12">

      {/* Greeting */}
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Hi there, <span className="text-amber-500">{firstName}</span>
        </h2>
        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
          What did you train today?
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Use one of the prompts below or describe your own workout.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.text)}
            className="text-left bg-white dark:bg-[#2a2723]
                       hover:bg-gray-50 dark:hover:bg-[#333028]
                       border border-gray-200 dark:border-[#3a3630]
                       rounded-2xl p-4 transition-all"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug mb-6">
              {s.text}
            </p>
            <div className="flex justify-end">
              {s.icon}
            </div>
          </button>
        ))}
      </div>

      {/* Refresh */}
      <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 
                         dark:hover:text-gray-300 transition-colors self-start ml-1">
        <RefreshCw size={12} />
        Refresh prompts
      </button>
    </div>
  );
};