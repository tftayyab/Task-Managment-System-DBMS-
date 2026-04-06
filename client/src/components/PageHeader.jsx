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
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    document.title = redTitle + blackTitle;
  }, [redTitle, blackTitle]);

  useEffect(() => {
    if (!hasAnimated) setHasAnimated(true);
  }, []);

  const handleMenuToggle = () => {
    setShowMenu((prev) => !prev);
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 py-4 sm:py-5 px-4 sm:px-8 z-30"
    >
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm z-40 sm:hidden"
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
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="fixed top-0 left-0 z-50 sm:hidden w-[80%] max-w-[300px] h-full"
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

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Title */}
        <div className="w-full relative flex items-center justify-center sm:justify-start">
          <button
            onClick={handleMenuToggle}
            className="absolute sm:hidden left-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <MenuIcon />
          </button>
          <h1 className="text-2xl sm:text-3xl font-inter font-bold text-center sm:text-left transition-all">
            <span className="text-indigo-500 dark:text-indigo-400">{redTitle}</span>
            <span className="text-slate-800 dark:text-slate-100">{blackTitle}</span>
          </h1>
        </div>

        {/* Search & Date */}
        <div className="flex sm:flex-row flex-col sm:gap-6 sm:items-center items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:max-w-xs md:max-w-sm lg:max-w-md px-2 sm:px-0">
            <div className="relative flex items-center w-full group">
              <SearchIcon className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                placeholder="Search tasks..."
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-700 transition-all border border-transparent"
              />
            </div>
          </div>

          <div className="text-center hidden sm:block sm:text-right whitespace-nowrap">
            <p className="text-slate-700 dark:text-slate-200 font-inter text-sm font-semibold">
              {day}
            </p>
            <p className="text-indigo-500 dark:text-indigo-400 font-inter text-xs font-medium">
              {date}
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default PageHeader;
