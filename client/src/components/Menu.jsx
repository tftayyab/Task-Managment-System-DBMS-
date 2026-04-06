import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardSelectedIcon, DashboardNotSelectedIcon,
  LogoutIcon,
  MyTasksSelectedIcon, MyTasksNotSelectedIcon,
  CollaborationNotSelectedIcon, CollaborationSelectedIcon
} from './svg';
import { handleLogout } from '../utils/handleTasks';

function Menu({ onClose, toggleDarkMode = () => {}, darkMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const isDashboard = location.pathname === '/dashboard';
  const isTasks = location.pathname === '/mytasks';
  const isCollaborate = location.pathname === '/collaborate';

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  const mobile = Boolean(onClose);

  return (
    <div
      className={`w-full h-full flex flex-col bg-slate-950 sm:bg-gradient-to-b sm:from-slate-900 sm:via-slate-900 sm:to-indigo-950 overflow-hidden ${
        mobile ? 'rounded-r-3xl border-r border-white/10' : ''
      }`}
    >
      {mobile && (
        <div className="flex sm:hidden items-center justify-between gap-3 px-4 py-4 border-b border-white/10 shrink-0 bg-slate-950/80 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-lg tracking-tight truncate">Task Manager</p>
            <p className="text-indigo-300/90 text-xs mt-0.5 truncate">{username || 'Signed in'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 text-white text-xl font-light leading-none hover:bg-white/20 active:scale-95 transition-all"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
      )}

      {!mobile && (
        <div className="hidden sm:flex items-center gap-3 px-6 pt-8 pb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 shrink-0">
            T
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm tracking-wide truncate">Task Manager</p>
            <p className="text-indigo-300 text-xs">Navigate</p>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-[max(1rem,env(safe-area-inset-bottom))]">
        {mobile && (
          <div className="sm:hidden px-1 py-2 rounded-2xl bg-white/5 border border-white/10 mb-2">
            <p className="text-white/90 text-sm font-medium truncate">{username}</p>
            <p className="text-slate-400 text-xs mt-1 truncate">{email}</p>
          </div>
        )}

        {!mobile && (
          <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 mb-2">
            <p className="text-white text-sm font-medium truncate">{username}</p>
            <p className="text-slate-400 text-xs mt-0.5 truncate">{email}</p>
          </div>
        )}

        <nav className="flex flex-col gap-1.5 sm:gap-1" aria-label="Main navigation">
          <MenuButton
            label="Dashboard"
            isActive={isDashboard}
            IconActive={DashboardSelectedIcon}
            IconInactive={DashboardNotSelectedIcon}
            onClick={() => handleNavigate('/dashboard')}
            large={mobile}
          />
          <MenuButton
            label="My Tasks"
            isActive={isTasks}
            IconActive={MyTasksSelectedIcon}
            IconInactive={MyTasksNotSelectedIcon}
            onClick={() => handleNavigate('/mytasks')}
            large={mobile}
          />
          <MenuButton
            label="Collaborate"
            isActive={isCollaborate}
            IconActive={CollaborationSelectedIcon}
            IconInactive={CollaborationNotSelectedIcon}
            onClick={() => handleNavigate('/collaborate')}
            large={mobile}
          />
        </nav>
      </div>

      <div className="p-4 sm:p-6 border-t border-white/10 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2 bg-slate-950/90 sm:bg-transparent">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-4 py-3 sm:py-2.5 w-full rounded-2xl sm:rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition-all duration-200"
        >
          <span className="text-lg leading-none">{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          type="button"
          onClick={() => handleLogout(navigate)}
          className="group flex items-center gap-3 px-4 py-3 sm:py-2.5 w-full rounded-2xl sm:rounded-lg font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
          <LogoutIcon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm group-hover:translate-x-0.5 transition-all">Logout</span>
        </button>
      </div>
    </div>
  );
}

function MenuButton({ label, isActive, IconActive, IconInactive, onClick, large = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 w-full rounded-2xl font-medium text-left transition-all duration-200 ${
        large ? 'py-3.5 text-base' : 'py-2.5 rounded-xl text-sm'
      } ${
        isActive
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {isActive ? (
        <IconActive className="w-6 h-6 sm:w-5 sm:h-5 shrink-0 transition-transform duration-200" />
      ) : (
        <IconInactive className="w-6 h-6 sm:w-5 sm:h-5 shrink-0 group-hover:scale-110 transition-transform duration-200" />
      )}
      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{label}</span>
    </button>
  );
}

export default Menu;
