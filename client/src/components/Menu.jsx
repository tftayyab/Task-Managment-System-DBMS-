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

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 sm:rounded-none rounded-r-2xl shadow-2xl sm:shadow-none overflow-hidden">
      {onClose && (
        <div className="flex sm:hidden items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <span className="text-white font-semibold text-base">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-indigo-200 hover:text-white px-3 py-1.5 rounded-lg bg-white/10"
          >
            Close
          </button>
        </div>
      )}

      <div className="p-4 sm:p-6 flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 shrink-0">
            T
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm tracking-wide truncate">Task Manager</p>
            <p className="text-indigo-300 text-xs">Navigate</p>
          </div>
        </div>

        <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white text-sm font-medium truncate">{username}</p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{email}</p>
        </div>

        <nav className="flex flex-col gap-1">
          <MenuButton
            label="Dashboard"
            isActive={isDashboard}
            IconActive={DashboardSelectedIcon}
            IconInactive={DashboardNotSelectedIcon}
            onClick={() => handleNavigate('/dashboard')}
          />
          <MenuButton
            label="My Tasks"
            isActive={isTasks}
            IconActive={MyTasksSelectedIcon}
            IconInactive={MyTasksNotSelectedIcon}
            onClick={() => handleNavigate('/mytasks')}
          />
          <MenuButton
            label="Collaborate"
            isActive={isCollaborate}
            IconActive={CollaborationSelectedIcon}
            IconInactive={CollaborationNotSelectedIcon}
            onClick={() => handleNavigate('/collaborate')}
          />
        </nav>
      </div>

      <div className="p-4 sm:p-6 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-all duration-200 mb-2"
        >
          <span className="text-lg leading-none">{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          type="button"
          onClick={() => handleLogout(navigate)}
          className="group flex items-center gap-3 px-4 py-2.5 w-full rounded-lg font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
          <LogoutIcon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-sm group-hover:translate-x-0.5 transition-all">Logout</span>
        </button>
      </div>
    </div>
  );
}

function MenuButton({ label, isActive, IconActive, IconInactive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-2.5 w-full rounded-xl font-medium text-sm text-left transition-all duration-200 ${
        isActive
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {isActive ? (
        <IconActive className="w-5 h-5 shrink-0 transition-transform duration-200" />
      ) : (
        <IconInactive className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-200" />
      )}
      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{label}</span>
    </button>
  );
}

export default Menu;
