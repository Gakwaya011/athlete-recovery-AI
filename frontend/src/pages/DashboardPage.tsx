import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sun, Moon, Menu } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';

export default function DashboardPage() {
  const { user }                      = useAuth();
  const navigate                      = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode]   = useState(true);

  const firstName = user?.full_name?.split(' ')[0] || 'Athlete';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#1c1a17] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3
                        border-b border-gray-200 dark:border-[#2e2b27]
                        bg-white dark:bg-[#1c1a17]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400"
            >
              <Menu size={20} />
            </button>
            <Logo size="sm" />
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       bg-gray-100 dark:bg-[#2a2723]
                       text-gray-500 dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-[#333028] transition-colors"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-2xl mx-auto">

            {/* Greeting */}
            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Hi there, <span className="text-amber-500">{firstName}</span>
              </h2>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
                What would you like to do?
              </p>
            </div>

            {/* Quick action card */}
            <div
              onClick={() => navigate('/chat')}
              className="bg-white dark:bg-[#2a2723]
                         border border-gray-200 dark:border-[#3a3630]
                         rounded-2xl p-6 cursor-pointer
                         hover:border-amber-400 dark:hover:border-amber-500
                         transition-all group mb-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl
                                flex items-center justify-center">
                  <Zap size={22} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white
                                 group-hover:text-amber-500 transition-colors">
                    Start a new session
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                    Tell nutri_athlete about today's workout
                  </p>
                </div>
                <div className="ml-auto text-gray-400 group-hover:text-amber-500 transition-colors">
                  →
                </div>
              </div>
            </div>

            {/* Recent sessions placeholder */}
            <div className="bg-white dark:bg-[#2a2723]
                            border border-gray-200 dark:border-[#3a3630]
                            rounded-2xl p-8 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Your recent sessions will appear here.
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}