import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose, message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="fixed left-3 right-3 sm:left-auto sm:right-4 top-[max(4.5rem,env(safe-area-inset-top,0px)+0.75rem)] sm:top-20 z-[200] sm:max-w-md sm:w-auto pointer-events-none"
        >
          <div
            className="pointer-events-auto rounded-xl px-4 py-3 shadow-xl bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-800 text-white text-sm sm:text-sm font-semibold leading-snug whitespace-normal break-words [overflow-wrap:anywhere] hyphens-auto"
            role="status"
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
