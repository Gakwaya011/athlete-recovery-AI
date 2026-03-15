import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode]   = useState(true);
  const [chatKey, setChatKey]         = useState(0);
  const location                      = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Reset chat when navigating to /chat with state {new: true}
  useEffect(() => {
    if ((location.state as any)?.new) {
      setChatKey(prev => prev + 1);
    }
  }, [location.state]);

  const handleNewChat = useCallback(() => {
    setChatKey(prev => prev + 1);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#1c1a17] transition-colors">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <ChatWindow
          key={chatKey}
          isDarkMode={isDarkMode}
          onToggleDark={() => setIsDarkMode(!isDarkMode)}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}