import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface NavbarProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isDarkMode, onToggleDark, title }) => (
  <header className="bg-white dark:bg-[#1c1a17] border-b border-gray-200 dark:border-[#2e2b27]
                     px-4 py-3 flex items-center justify-between sticky top-0 z-20">
    <div className="flex items-center gap-3">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500">
        <Menu size={20} />
      </button>
      {title
        ? <h1 className="font-semibold text-gray-900 dark:text-white">{title}</h1>
        : <Logo />
      }
    </div>
    <button
      onClick={onToggleDark}
      className="p-2.5 rounded-full bg-gray-100 dark:bg-[#2a2723]
                 text-gray-600 dark:text-gray-300 transition-all"
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  </header>
);