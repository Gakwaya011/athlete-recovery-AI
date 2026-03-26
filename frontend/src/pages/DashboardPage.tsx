import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sun, Moon, Menu, Flame, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui/Logo';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface Session {
  id: number;
  title: string;
  sport?: string;
  duration_mins?: number;
  intensity?: string;
  calories_burned?: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user }                            = useAuth();
  const navigate                            = useNavigate();
  const { isDarkMode, toggleDark }          = useDarkMode();
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  const firstName = user?.full_name?.split(' ')[0] || 'Athlete';

  useEffect(() => {
    const token = localStorage.getItem('mwili_token');
    fetch(`${API_URL}/api/v1/sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setRecentSessions(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(console.error);
  }, []);

  const getSportEmoji = (sport?: string) => {
    if (!sport) return '🏃';
    const s = sport.toLowerCase();
    if (s.includes('football') || s.includes('soccer')) return '⚽';
    if (s.includes('basketball')) return '🏀';
    if (s.includes('running'))    return '🏃';
    if (s.includes('gym') || s.includes('weight')) return '🏋️';
    if (s.includes('swimming'))   return '🏊';
    if (s.includes('cycling'))    return '🚴';
    if (s.includes('rugby'))      return '🏉';
    if (s.includes('volleyball')) return '🏐';
    if (s.includes('tennis'))     return '🎾';
    if (s.includes('boxing'))     return '🥊';
    if (s.includes('yoga'))       return '🧘';
    return '🏃';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#1c1a17] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3
                        border-b border-gray-200 dark:border-[#2e2b27]
                        bg-white dark:bg-[#1c1a17]">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400">
              <Menu size={20} />
            </button>
            <Logo size="sm" />
          </div>
          <button onClick={toggleDark}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       bg-gray-100 dark:bg-[#2a2723] text-gray-500 dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-[#333028] transition-colors">
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-2xl mx-auto">

            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Hi there, <span className="text-amber-500">{firstName}</span>
              </h2>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
                What would you like to do?
              </p>
            </div>

            <div
              onClick={() => navigate('/chat', { state: { new: true } })}
              className="bg-white dark:bg-[#2a2723] border border-gray-200
                         dark:border-[#3a3630] rounded-2xl p-6 cursor-pointer
                         hover:border-amber-400 dark:hover:border-amber-500
                         transition-all group mb-6"
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

            <div className="bg-white dark:bg-[#2a2723] border border-gray-200
                            dark:border-[#3a3630] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  Recent Sessions
                </h3>
                {recentSessions.length > 0 && (
                  <button onClick={() => navigate('/history')}
                    className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
                    View all →
                  </button>
                )}
              </div>

              {recentSessions.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
                  Your recent sessions will appear here.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentSessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/chat?session=${session.id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer
                                 hover:bg-gray-50 dark:hover:bg-[#333028] transition-colors group"
                    >
                      <span className="text-lg">{getSportEmoji(session.sport)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {session.calories_burned && (
                            <span className="text-xs text-amber-500 flex items-center gap-0.5">
                              <Flame size={10} /> {session.calories_burned} kcal
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDate(session.created_at)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}