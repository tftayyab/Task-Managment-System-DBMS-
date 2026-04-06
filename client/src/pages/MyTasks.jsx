import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import TaskList from '../components/TaskList';
import Tasks from '../components/Tasks';
import api from '../api';
import AddTasks from './AddTasks';
import Edit from './EditTasks';
import ShareTasks from './ShareTasks';
import useAuthToken from '../utils/useAuthToken';
import { motion } from 'framer-motion';

function MyTasks() {
  const { searchTerm, setNotification } = useOutletContext();

  const location = useLocation();
  const taskIdFromState = location.state?.taskId || null;

  const [tasks, setTasks] = useState([]);
  const [filteredTasksList, setFilteredTasksList] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
      const res = await api.get('/tasks');
      setTasks(res.data);
      setFilteredTasksList(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskIdFromState) setSelectedTaskId(taskIdFromState);
  }, [taskIdFromState]);

  useEffect(() => {
    if (!selectedTaskId && filteredTasksList.length > 0) {
      setSelectedTaskId(filteredTasksList[0]._id);
    }
  }, [filteredTasksList, selectedTaskId]);

  return (
    <motion.div
      className="flex-1 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-6 overflow-hidden"
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-3 sm:p-6 flex-1 min-h-0 flex flex-col md:flex-row md:gap-6 transition-all duration-300 overflow-hidden">

          {/* Task List */}
          <div className="order-2 md:order-1 flex-1 min-h-0 min-w-0 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 sm:p-6 overflow-y-auto scrollbar-hide">
            <TaskList
              tasks={filteredTasksList}
              statuses={["Pending", "In Progress", "Completed"]}
              setEditTask={setEditTask}
              setShareTask={setShareTask}
              fetchTasksWithRetry={fetchTasksWithRetry}
              loading={loading}
              onTaskClick={(id) => setSelectedTaskId(id)}
              searchTerm={searchTerm}
              setNotification={setNotification}
              onAddTaskClick={() => {
                setShowAddModal(true);
              }}
            />
          </div>

          {/* Task Preview — fills remaining viewport height; body scrolls inside */}
          <div className="order-1 md:order-2 w-full md:w-[min(28rem,42%)] md:max-w-md flex-shrink-0 flex flex-col gap-4 mt-2 md:mt-0 min-h-0 md:flex-1">
            <div className="hidden md:flex md:flex-1 md:min-h-0 md:flex-col bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden scrollbar-hide">
              {selectedTaskId ? (
                <Tasks
                  tasks={tasks}
                  task_id={selectedTaskId}
                  setEditTask={setEditTask}
                  setNotification={setNotification}
                  fetchTasksWithRetry={fetchTasksWithRetry}
                />
              ) : (
                <p className="text-center text-slate-400 dark:text-slate-500 mt-20">
                  No task selected
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {showAddModal && (
        <AddTasks
          onClose={() => setShowAddModal(false)}
          setNotification={setNotification}
          fetchTasksWithRetry={() => {
            fetchTasksWithRetry();
            setNotification("Task added successfully");
          }}
        />
      )}
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
            setNotification("Task shared with team!");
          }}
        />
      )}
    </motion.div>
  );
}

export default MyTasks;
