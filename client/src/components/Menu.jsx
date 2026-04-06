import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardSelectedIcon, DashboardNotSelectedIcon,
  LogoutIcon,
  MyTasksSelectedIcon, MyTasksNotSelectedIcon,
  CollaborationNotSelectedIcon, CollaborationSelectedIcon
} from './svg';
import { handleLogout } from '../utils/handleTasks';
import { motion, AnimatePresence } from 'framer-motion';

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
    <>
      <AnimatePresence>
        {onClose && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm z-40 sm:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 flex flex-col justify-between rounded-r-2xl sm:rounded-none shadow-2xl sm:shadow-none">
        {/* Top */}
        <div className="p-6 flex flex-col gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              T
            </div>
            <div>
              <p className="text-white font-semibold text-sm tracking-wide">Task Manager</p>
              <p className="text-indigo-300 text-xs">Stay organized</p>
            </div>
          </div>

          {/* User info */}
          <div className="mt-2 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white text-sm font-medium tracking-wide truncate">{username}</p>
            <p className="text-slate-400 text-xs mt-0.5 truncate">{email}</p>
          </div>

          <nav className="mt-2 flex flex-col gap-1">
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

        {/* Bottom */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-all duration-200 mb-2"
          >
            <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={() => handleLogout(navigate)}
            className="group flex items-center gap-3 px-4 py-2.5 w-full rounded-lg font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
          >
            <LogoutIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm group-hover:translate-x-0.5 transition-all">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

function MenuButton({ label, isActive, IconActive, IconInactive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-2.5 w-full rounded-xl font-medium text-sm transition-all duration-200 ${
        isActive
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {isActive ? (
        <IconActive className="w-5 h-5 transition-transform duration-200" />
      ) : (
        <IconInactive className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      )}
      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{label}</span>
    </button>
  );
}

export default Menu;
