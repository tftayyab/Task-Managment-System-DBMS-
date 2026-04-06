import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Menu from '../components/Menu';
import Notification from '../components/notification';
import useSocketNotifications from '../hooks/useSocketNotifications';
import useIsMobile from '../utils/useScreenSize';

function MainLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const isMobile = useIsMobile();
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  useSocketNotifications(setNotification);

  useEffect(() => {
    if (path !== '/collaborate' && searchTerm.trim().length > 0) {
      navigate('/mytasks');
    }
  }, [searchTerm, path, navigate]);

  useEffect(() => {
    if (!location.pathname.startsWith('/mytasks')) {
      setSearchTerm('');
    }
  }, [location]);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const shouldShowHeader = !['/', '/login', '/register'].includes(path);

  const getTitles = (pathname) => {
    if (pathname.startsWith('/dashboard')) return { red: 'Dash', black: 'Board' };
    if (pathname.startsWith('/mytasks')) return { red: 'My', black: 'Tasks' };
    if (pathname.startsWith('/viewtask')) return { red: 'View', black: 'Task' };
    if (pathname.startsWith('/viewteamtask')) return { red: 'Team', black: 'Task' };
    if (pathname.startsWith('/collaborate')) return { red: 'Collab', black: 'orate' };
    return { red: '', black: '' };
  };

  const { red, black } = getTitles(path);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      {shouldShowHeader && (
        <aside className="hidden sm:flex fixed left-0 top-0 h-full w-64 z-40">
          <Menu toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        </aside>
      )}

      <div className={shouldShowHeader ? 'sm:ml-64' : ''}>
        {shouldShowHeader && (
          <PageHeader
            redTitle={red}
            blackTitle={black}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            toggleDarkMode={toggleDarkMode}
            darkMode={darkMode}
          />
        )}

        <main className="flex-1">
          <Outlet
            context={{
              searchTerm,
              setSearchTerm,
              setNotification,
              isMenuOpen,
              setIsMenuOpen,
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
