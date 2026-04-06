import { motion } from 'framer-motion';
import api from '../api';

const Actions = ({ task, fetchTasksWithRetry, setEditTask, setShareTask, setNotification }) => {
  const handleDelete = async (id) => {
    try {
      await api.delete(`/task/${id}`);
      fetchTasksWithRetry();
      setNotification("Task deleted successfully");
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refreshRes = await api.get('/auth/refresh-token');
          const newToken = refreshRes.data.accessToken;
          localStorage.setItem('token', newToken);
          await api.delete(`/task/${id}`);
          fetchTasksWithRetry();
          setNotification("Task deleted successfully");
        } catch {
          console.error('Token refresh failed on delete');
          window.location.href = '/login';
        }
      } else {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col -mt-4 min-w-[6rem] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditTask(task);
        }}
        className="px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium text-left"
      >
        Edit
      </button>

      <button
        onClick={() => handleDelete(task._id)}
        className="px-4 py-2.5 text-sm whitespace-nowrap text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium text-left"
      >
        Delete
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setShareTask(task);
        }}
        className="px-4 py-2.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all font-medium text-left"
      >
        Share
      </button>
    </motion.div>
  );
};

export default Actions;
