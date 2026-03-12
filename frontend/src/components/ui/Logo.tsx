import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', collapsed = false }) => {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };
  if (collapsed) {
    return (
      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
        <span className="text-white font-black text-sm">N</span>
      </div>
    );
  }
  return (
    <div className={`font-black tracking-tight ${sizes[size]} text-gray-900 dark:text-white`}>
      nutri_<span className="text-amber-500">athlete</span>
    </div>
  );
};