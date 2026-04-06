import { useNavigate } from 'react-router-dom';
import { DeleteTasksIcon, EditTasksIcon, ShareIcon } from './svg';
import { formatDueDate } from '../utils/DayDate';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { handleDelete } from '../utils/handleTasks';

function Tasks({
  tasks,
  fetchTasksWithRetry,
  statuses = [],
  searchTerm = '',
  task_id = null,
  setEditTask,
  setShareTask,
  loading = false,
  setNotification,
}) {
  const navigate = useNavigate();
  const search = searchTerm.toLowerCase().trim();

  const filtered = Array.from(
    new Map(
      tasks
        .filter((task) => {
          if (task_id) return task._id === task_id;

          const matchesSearch =
            !search ||
            [
              task.title?.toLowerCase(),
              task.description?.toLowerCase(),
              task.status?.toLowerCase(),
              task.dueDate,
            ].some((field) => field?.includes(search));

          if (search) return matchesSearch;
          return statuses.includes(task.status);
        })
        .map(task => [task._id, task])
    ).values()
  );

  return (
    <>
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <ul className="flex flex-col gap-4 w-full h-full overflow-y-auto pr-1 scrollbar-hide">
          <AnimatePresence>
            {filtered.map((task) => (
              <motion.li
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/viewtask/${task._id}`)}
                className="group h-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 
                          bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 
                          hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 hover:-translate-y-0.5 relative cursor-pointer"
              >
                {/* Title */}
                <p className="text-slate-800 dark:text-white font-inter text-base font-semibold break-words max-w-[12rem] sm:max-w-none">
                  {task.title}
                </p>

                {/* Status and Due Date */}
                <div className="flex flex-col justify-between items-start mt-3 gap-y-2 text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    task.status === 'In Progress' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {task.status}
                  </span>
                  <p className="text-slate-400 dark:text-slate-500">
                    <span className="text-slate-600 dark:text-slate-300">Due:</span> {formatDueDate(task.dueDate)}
                  </p>
                </div>

                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 break-words">{task.description}</p>

                {/* Action Buttons */}
                <div className="sm:absolute sm:bottom-4 sm:right-4 justify-end sm:mt-0 mt-6 flex sm:items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await handleDelete(task._id, setNotification);
                        await fetchTasksWithRetry();
                        navigate('/mytasks');
                      } catch (err) {
                        console.error('Delete failed:', err);
                      }
                    }}
                  >
                    <DeleteTasksIcon className="w-7 h-7" />
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-500 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTask(task);
                    }}
                  >
                    <EditTasksIcon className="w-7 h-7" />
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-500 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      const taskToShare = tasks.find((t) => t._id === task._id);
                      if (taskToShare) setShareTask(taskToShare);
                    }}
                  >
                    <ShareIcon className="w-7 h-7" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}

export default Tasks;
