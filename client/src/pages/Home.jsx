import '../App.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

function Home() {
  useEffect(() => {
    document.title = 'Home';
  }, []);

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className={`relative w-full h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'} overflow-hidden`}>

        <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-center bg-cover z-0 opacity-30" />

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-0">
          <img
            src="/icon.png"
            alt="Logo"
            className="w-24 h-24 sm:w-36 sm:h-36 mb-8 transition-transform duration-500 hover:scale-110 drop-shadow-xl"
          />

          <h1 className="text-indigo-500 dark:text-indigo-400 text-4xl sm:text-7xl font-bold text-center mb-4">
            Task <span className={`${isDark ? 'text-white' : 'text-slate-800'}`}>Manager</span>
          </h1>

          <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-base sm:text-lg text-center font-medium mb-10 max-w-md`}>
            Organize your tasks. Collaborate with teams. Boost your productivity.
          </p>

          <div className="flex gap-4">
            <button
              className="homeBtn"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="text-indigo-500 dark:text-indigo-400 border-2 border-indigo-500 dark:border-indigo-400 text-sm sm:text-base font-semibold px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:w-40 transition-all duration-300 ease-in-out hover:bg-indigo-50 dark:hover:bg-indigo-500/10 active:scale-95"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Home;
