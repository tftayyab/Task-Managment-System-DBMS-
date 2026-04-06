import { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Tasks from '../components/Tasks';
import api from '../api';
import Edit from './EditTasks';
import useAuthToken from '../utils/useAuthToken';
import ShareTasks from './ShareTasks';
import { motion } from 'framer-motion';

function ViewTasks() {
  const {
    searchTerm,
    setSearchTerm,
    setNotification,
  } = useOutletContext();

  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [filteredTasksList, setFilteredTasksList] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editTask, setEditTask] = useState(null);
  const [shareTask, setShareTask] = useState(null);

  const navigate = useNavigate();
  useAuthToken();

  useEffect(() => {
    const tryFetch = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        try {
          const res = await api.get('/auth/refresh-token');
          const newToken = res.data.accessToken;
          localStorage.setItem('token', newToken);
        } catch (err) {
          window.location.href = '/login';
          return;
        }
      }

      fetchTasksWithRetry();
    };

    tryFetch();
  }, []);

  const fetchTasksWithRetry = async () => {
    try {
      const [personalRes, sharedRes] = await Promise.all([
        api.get(`/tasks`),
        api.get(`/tasks/shared`),
      ]);

      const allTasks = [
        ...(personalRes.data || []),
        ...(sharedRes.data?.tasks || []),
      ];

      setTasks(allTasks);
      setFilteredTasksList(allTasks);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && filteredTasksList.length > 0) {
      const exists = filteredTasksList.some(task => task._id === id);
      setSelectedTaskId(exists ? id : null);
    } else if (!selectedTaskId && filteredTasksList.length > 0) {
      setSelectedTaskId(filteredTasksList[0]._id);
    }
  }, [id, filteredTasksList, selectedTaskId]);

  return (
    <motion.div
      className="min-h-screen sm:h-[calc(100vh-4.5rem)] bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-auto sm:overflow-hidden p-4 sm:p-6"
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
          <div className="w-full flex flex-col gap-6">
            {selectedTaskId && (
              <div className="min-h-[31rem] sm:h-[31rem] sm:min-h-0 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-y-auto scrollbar-hide">
                <Tasks
                  tasks={tasks}
                  task_id={selectedTaskId}
                  setEditTask={setEditTask}
                  setShareTask={setShareTask}
                  setNotification={setNotification}
                  fetchTasksWithRetry={fetchTasksWithRetry}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {editTask && (
        <Edit
          taskData={editTask}
          onClose={() => setEditTask(null)}
          setNotification={setNotification}
          fetchTasksWithRetry={() => {
            fetchTasksWithRetry();
            setNotification("Task updated successfully");
          }}
        />
      )}

      {shareTask && (
        <ShareTasks
          taskData={shareTask}
          onClose={() => setShareTask(null)}
          setNotification={setNotification}
          fetchTasksWithRetry={() => {
            fetchTasksWithRetry();
            setNotification("Task shared with team");
          }}
        />
      )}
    </motion.div>
  );
}

export default ViewTasks;
