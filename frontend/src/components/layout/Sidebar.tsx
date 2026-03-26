import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Home, Clock, Settings, LogOut, Flame, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  isOpen:      boolean;
  onClose:     () => void;
  onNewChat?:  () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNewChat }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <Home size={16} />,           label: 'Dashboard', path: '/dashboard' },
    { icon: <MessageSquare size={16} />,  label: 'Chat',      path: '/chat' },
    { icon: <Flame size={16} />,          label: 'Calories',  path: '/calories' },
    { icon: <Clock size={16} />,          label: 'History',   path: '/history' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      navigate('/chat', { state: { new: true } });
    }
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-[68px] z-40 flex flex-col
        bg-[#f0eeeb] dark:bg-[#151310]
        border-r border-gray-200 dark:border-[#2e2b27]
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo — click to go to landing page */}
        <div
          className="flex items-center justify-center py-5 border-b border-gray-200
                     dark:border-[#2e2b27] cursor-pointer"
          onClick={() => { navigate('/'); onClose(); }}
          title="Go to home"
        >
          <Logo collapsed />
        </div>

        {/* New Chat button */}
        <div className="flex items-center justify-center py-3">
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       bg-amber-500 text-white hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-1 py-2 flex-1">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => handleNav(item.path)}
              title={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                ${location.pathname === item.path
                  ? 'bg-white dark:bg-[#2a2723] text-amber-500 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-white dark:hover:bg-[#2a2723] hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-2 py-4 border-t border-gray-200 dark:border-[#2e2b27]">
          <button
            title="Settings"
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       text-gray-400 dark:text-gray-500
                       hover:bg-white dark:hover:bg-[#2a2723]
                       hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            title="Sign out"
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       text-gray-400 dark:text-gray-500
                       hover:bg-white dark:hover:bg-[#2a2723]
                       hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
          <div
            title={user?.full_name}
            className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center
                       text-white text-xs font-bold cursor-pointer mt-1"
          >
            {user?.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </aside>
    </>
  );
};