import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Message } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [isDarkMode, setIsDarkMode]           = useState(true);
  const [chatKey, setChatKey]                 = useState(0);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [initialSessionId, setInitialSessionId] = useState<number | null>(null);
  const [loadingSession, setLoadingSession]   = useState(false);
  const location                              = useLocation();
  const navigate                              = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Handle new chat
  useEffect(() => {
    if ((location.state as any)?.new) {
      setInitialMessages([]);
      setInitialSessionId(null);
      setChatKey(prev => prev + 1);
    }
  }, [location.state]);

  // Handle loading existing session from ?session=id
  useEffect(() => {
    const params    = new URLSearchParams(location.search);
    const sessionId = params.get('session');
    if (sessionId) {
      loadSession(parseInt(sessionId));
    } else {
      // Fresh chat — reset
      setInitialMessages([]);
      setInitialSessionId(null);
    }
  }, [location.search]);

  const loadSession = async (sessionId: number) => {
    setLoadingSession(true);
    try {
      const token = localStorage.getItem('mwili_token');
      const res   = await fetch(`${API_URL}/api/v1/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Session not found');
      const data = await res.json();

      // Convert messages to our format
      const msgs: Message[] = (data.messages || []).map((m: any) => ({
        role:    m.role,
        content: m.content,
      }));

      setInitialMessages(msgs);
      setInitialSessionId(sessionId);
      setChatKey(prev => prev + 1);
    } catch (e) {
      console.error('Failed to load session:', e);
      navigate('/chat');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleNewChat = useCallback(() => {
    setInitialMessages([]);
    setInitialSessionId(null);
    setChatKey(prev => prev + 1);
    setSidebarOpen(false);
    navigate('/chat');
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#1c1a17] transition-colors">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {loadingSession ? (
          <div className="flex flex-col flex-1 items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading session...</p>
          </div>
        ) : (
          <ChatWindow
            key={chatKey}
            isDarkMode={isDarkMode}
            onToggleDark={() => setIsDarkMode(!isDarkMode)}
            onMenuClick={() => setSidebarOpen(true)}
            initialMessages={initialMessages}
            initialSessionId={initialSessionId}
          />
        )}
      </div>
    </div>
  );
}