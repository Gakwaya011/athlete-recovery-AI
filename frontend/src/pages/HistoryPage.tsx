import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

export default function HistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode]   = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar
          title="History"
          onMenuClick={() => setSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDark={() => setIsDarkMode(!isDarkMode)}
        />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Chat History
              </h2>
              <p className="text-gray-500 text-sm mt-1">Your past nutrition sessions.</p>
            </div>

            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl mb-4">
                <Clock size={28} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No sessions yet</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Your chat history will appear here after you complete your first nutrition session.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}