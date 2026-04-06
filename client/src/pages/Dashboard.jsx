import { useEffect, useState } from 'react';
import TaskStatusCard from '../components/TaskStatusCard';
import api from '../api';
import useAuthToken from '../utils/useAuthToken';
import { motion } from 'framer-motion';
import TasksOverTimeChart from '../components/TasksOverTimeChart';
import TasksPerTeamChart from '../components/TasksPerTeamChart';

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
      const tasksRes = await api.get('/tasks');
      setTasks(tasksRes.data);

      const sharedRes = await api.get(`/tasks/shared`);
      const fetchedTeams = sharedRes.data.teams || [];
      setTeams(fetchedTeams);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err.response?.data || err.message);
    }
  };

  return (
    <motion.div
      className="flex-1 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 lg:p-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col"
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-3 sm:p-4 lg:p-6 flex-1 min-h-0 flex flex-col gap-4 lg:flex-row lg:gap-6 overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2">
            <div className="flex-1 min-h-[min(12rem,38vh)] lg:min-h-0 w-full relative">
              <TasksOverTimeChart tasks={tasks} />
            </div>
          </div>

          <div className="w-full lg:w-[min(22rem,34vw)] shrink-0 flex flex-col gap-3 min-h-0 lg:overflow-hidden">
            <div className="shrink-0">
              <TaskStatusCard tasks={tasks} />
            </div>
            <div className="flex-1 min-h-[180px] lg:min-h-0 flex flex-col min-w-0">
              <TasksPerTeamChart tasks={tasks} teams={teams} fillHeight />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
