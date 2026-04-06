import { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import Tasks from '../components/Tasks';
import api from '../api';
import Edit from './EditTasks';
import useAuthToken from '../utils/useAuthToken';
import ShareTasks from './ShareTasks';
import { motion } from 'framer-motion';
import TaskList from '../components/TaskList';
import useIsMobile from '../utils/useScreenSize';

function ViewTeamTasks() {
  const { searchTerm, setNotification } = useOutletContext();

  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [filteredTasksList, setFilteredTasksList] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editTask, setEditTask] = useState(null);
  const [shareTask, setShareTask] = useState(null);
  const isMobile = useIsMobile();

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
      const res = await api.get(`/tasks/shared`);
      const allTasks = res.data.tasks;
      const teamTasks = allTasks.filter(task => task.teamIds?.includes(id));
      setTasks(teamTasks);
      setFilteredTasksList(teamTasks);
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
      className="flex-1 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col"
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-3 sm:p-6 flex-1 min-h-0 flex flex-col transition-all duration-300 overflow-hidden">
          <div className="w-full flex flex-col flex-1 min-h-0 gap-4">
            {isMobile ? (
              <div className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 overflow-y-auto scrollbar-hide">
                <TaskList
                  tasks={tasks}
                  statuses={["Pending", "In Progress", "Completed"]}
                  fetchTasksWithRetry={fetchTasksWithRetry}
                  onTaskClick={(taskId) => navigate(`/viewtask/${taskId}`)}
                  setEditTask={setEditTask}
                  setShareTask={setShareTask}
                  searchTerm={searchTerm}
                  loading={loading}
                  setNotification={setNotification}
                />
              </div>
            ) : (
              selectedTaskId && (
                <div className="flex-1 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[min(32rem,70vh)]">
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
              )
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

export default ViewTeamTasks;
