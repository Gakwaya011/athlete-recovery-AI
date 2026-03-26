import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nutri_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('nutri_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDark = () => setIsDarkMode(prev => !prev);

  return { isDarkMode, toggleDark };
}
