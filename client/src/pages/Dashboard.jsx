import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import TaskStatusCard from '../components/TaskStatusCard';
import api from '../api';
import useAuthToken from '../utils/useAuthToken';
import { motion } from 'framer-motion';
import TasksOverTimeChart from '../components/TasksOverTimeChart';
import TasksPerTeamChart from '../components/TasksPerTeamChart';

function Dashboard() {
  const { setNotification } = useOutletContext();

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
      className="min-h-screen sm:h-[calc(100vh-4.5rem)] bg-slate-50 dark:bg-slate-900 flex flex-col overflow-auto sm:overflow-hidden p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-7xl mx-auto flex-1"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-4 sm:p-6 h-full flex flex-col sm:flex-row sm:gap-6 transition-all duration-300">

          {/* Right side - Status + Team Chart */}
          <div className="order-1 sm:order-2 w-full sm:w-[22rem] flex-shrink-0 flex flex-col gap-6 mt-6 sm:mt-0">
            <div className="flex justify-center sm:justify-start">
              <TaskStatusCard tasks={tasks} />
            </div>

            <div className="flex justify-center sm:justify-start h-full mb-2 sm:mb-0 w-full">
              <TasksPerTeamChart tasks={tasks} teams={teams} />
            </div>
          </div>

          {/* Left side - Timeline Chart */}
          <div className="flex justify-center sm:justify-start h-[40vh] sm:h-full w-full min-w-0">
            <TasksOverTimeChart tasks={tasks} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
