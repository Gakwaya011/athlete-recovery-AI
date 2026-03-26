import React, { useState, useEffect } from 'react';
import { Clock, Trash2, ChevronRight, Flame } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface Session {
  id: number;
  title: string;
  sport?: string;
  duration_mins?: number;
  intensity?: string;
  goal?: string;
  calories_burned?: number;
  created_at: string;
}

export default function HistoryPage() {
  const { isDarkMode, toggleDark }      = useDarkMode();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [sessions, setSessions]         = useState<Session[]>([]);
  const [loading, setLoading]           = useState(true);
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('mwili_token');
      const res   = await fetch(`${API_URL}/api/v1/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const token = localStorage.getItem('mwili_token');
      await fetch(`${API_URL}/api/v1/sessions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIntensityColor = (intensity?: string) => {
    if (intensity === 'heavy')    return 'text-red-400';
    if (intensity === 'moderate') return 'text-amber-400';
    return 'text-green-400';
  };

  const getSportEmoji = (sport?: string) => {
    if (!sport) return '🏃';
    const s = sport.toLowerCase();
    if (s.includes('football') || s.includes('soccer')) return '⚽';
    if (s.includes('basketball'))  return '🏀';
    if (s.includes('running'))     return '🏃';
    if (s.includes('gym') || s.includes('weight')) return '🏋️';
    if (s.includes('swimming'))    return '🏊';
    if (s.includes('cycling'))     return '🚴';
    if (s.includes('rugby'))       return '🏉';
    if (s.includes('volleyball'))  return '🏐';
    if (s.includes('tennis'))      return '🎾';
    if (s.includes('boxing'))      return '🥊';
    if (s.includes('yoga'))        return '🧘';
    return '🏃';
  };

  const groupedSessions = sessions.reduce((groups: Record<string, Session[]>, session) => {
    const date = new Date(session.created_at);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    let key = '';
    if (diff === 0)      key = 'Today';
    else if (diff === 1) key = 'Yesterday';
    else if (diff <= 7)  key = 'Previous 7 Days';
    else if (diff <= 30) key = 'Previous 30 Days';
    else key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(session);
    return groups;
  }, {});

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar
          title="History"
          onMenuClick={() => setSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDark={toggleDark}
        />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Chat History
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {sessions.length > 0 ? `${sessions.length} nutrition session${sessions.length > 1 ? 's' : ''}` : 'Your past nutrition sessions.'}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl mb-4">
                  <Clock size={28} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No sessions yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Your chat history will appear here after you complete your first nutrition session.
                </p>
                <button onClick={() => navigate('/chat')}
                  className="mt-6 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                  Start a session
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {Object.entries(groupedSessions).map(([group, groupSessions]) => (
                  <div key={group}>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
                      {group}
                    </p>
                    <div className="flex flex-col gap-2">
                      {groupSessions.map(session => (
                        <div key={session.id}
                          onClick={() => navigate(`/chat?session=${session.id}`)}
                          className="group flex items-center gap-4 p-4 rounded-2xl
                                     bg-gray-50 dark:bg-[#2a2723] border border-gray-100
                                     dark:border-[#3a3630] hover:border-amber-500/50
                                     cursor-pointer transition-all duration-200 hover:shadow-sm">
                          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20
                                          flex items-center justify-center text-xl flex-shrink-0">
                            {getSportEmoji(session.sport)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {session.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {session.sport && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{session.sport}</span>
                              )}
                              {session.duration_mins && (
                                <span className="text-xs text-gray-400">⏱ {session.duration_mins}min</span>
                              )}
                              {session.intensity && (
                                <span className={`text-xs font-medium capitalize ${getIntensityColor(session.intensity)}`}>
                                  {session.intensity}
                                </span>
                              )}
                              {session.calories_burned && (
                                <span className="text-xs text-amber-500 flex items-center gap-1">
                                  <Flame size={10} /> {session.calories_burned} kcal
                                </span>
                              )}
                              {session.goal && (
                                <span className="text-xs text-gray-400 capitalize">
                                  🎯 {session.goal.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400">{formatDate(session.created_at)}</span>
                            <button onClick={(e) => deleteSession(session.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                                         hover:bg-red-50 dark:hover:bg-red-900/20
                                         text-gray-400 hover:text-red-500 transition-all">
                              {deletingId === session.id
                                ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <Trash2 size={14} />}
                            </button>
                            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}