import { useState, useEffect } from 'react';
import { MenuIcon, SearchIcon } from './svg';
import { day, date } from '../utils/DayDate';
import Menu from './Menu';
import { motion, AnimatePresence } from 'framer-motion';

const PageHeader = ({
  redTitle = '',
  blackTitle = '',
  searchTerm = '',
  setSearchTerm = () => {},
  isMenuOpen = false,
  setIsMenuOpen = () => {},
  toggleDarkMode = () => {},
  darkMode = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    document.title = redTitle + blackTitle;
  }, [redTitle, blackTitle]);

  const handleMenuToggle = () => {
    setShowMenu((prev) => !prev);
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-30 w-full shrink-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 py-3 sm:py-4 px-3 sm:px-6"
    >
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMenu(false);
                setIsMenuOpen(false);
              }}
            />
            <motion.div
              key="menu"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 z-50 sm:hidden w-[min(88vw,20rem)] h-full shadow-2xl"
            >
              <Menu
                onClose={() => {
                  setShowMenu(false);
                  setIsMenuOpen(false);
                }}
                toggleDarkMode={toggleDarkMode}
                darkMode={darkMode}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={handleMenuToggle}
            className="sm:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-inter font-bold flex-1 min-w-0 text-center sm:text-left sm:pl-0 pl-10 sm:pl-0">
            <span className="text-indigo-500 dark:text-indigo-400">{redTitle}</span>
            <span className="text-slate-800 dark:text-slate-100">{blackTitle}</span>
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0 shrink-0">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="sm:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="text-lg leading-none">{darkMode ? '☀️' : '🌙'}</span>
            </button>
            <div className="hidden sm:block text-right whitespace-nowrap text-xs sm:text-sm">
              <p className="text-slate-700 dark:text-slate-200 font-semibold">{day}</p>
              <p className="text-indigo-500 dark:text-indigo-400 font-medium">{date}</p>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1">
          <div className="relative flex items-center w-full group max-w-none xl:max-w-4xl 2xl:max-w-5xl mx-auto sm:mx-0 sm:max-w-none">
            <SearchIcon className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              placeholder="Search by title, status, date..."
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-700 transition-all border border-transparent"
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default PageHeader;
