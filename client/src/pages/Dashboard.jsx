import { lazy, Suspense, useEffect, useState } from 'react';
import TaskStatusCard from '../components/TaskStatusCard';
import api from '../api';
import useAuthToken from '../utils/useAuthToken';
import { motion } from 'framer-motion';

const TasksOverTimeChart = lazy(() => import('../components/TasksOverTimeChart'));
const TasksPerTeamChart = lazy(() => import('../components/TasksPerTeamChart'));

const ChartFallback = () => (
  <div className="w-full h-full min-h-[12rem] rounded-2xl bg-slate-100 dark:bg-slate-800/80 animate-pulse flex items-center justify-center text-slate-400 text-sm">
    Loading chart…
  </div>
);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);

  useAuthToken();

  useEffect(() => {
    document.title = 'Dashboard';
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, sharedRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/shared'),
      ]);
      setTasks(tasksRes.data);
      setTeams(sharedRes.data?.teams || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err.response?.data || err.message);
    }
  };

  return (
    <motion.div
      className="flex-1 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-900 p-3 sm:p-6 xl:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-[96rem] mx-auto flex-1 min-h-0 flex flex-col"
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-3 sm:p-6 xl:p-8 flex-1 min-h-0 flex flex-col gap-6 xl:flex-row xl:gap-10 transition-all duration-300 overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0 flex flex-col order-2 xl:order-1">
            <div className="h-[min(44vh,23rem)] sm:h-[min(52vh,28rem)] xl:h-[min(70vh,42rem)] 2xl:h-[min(72vh,46rem)] min-h-[240px] w-full">
              <Suspense fallback={<ChartFallback />}>
                <TasksOverTimeChart tasks={tasks} />
              </Suspense>
            </div>
          </div>

          <div className="w-full xl:w-[24rem] 2xl:w-[26rem] flex-shrink-0 flex flex-col gap-5 order-1 xl:order-2 min-h-0">
            <TaskStatusCard tasks={tasks} />
            <div className="w-full min-h-0 flex-1 min-h-[200px] overflow-x-auto overflow-y-visible pb-2 scrollbar-hide">
              <Suspense fallback={<ChartFallback />}>
                <TasksPerTeamChart tasks={tasks} teams={teams} />
              </Suspense>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
