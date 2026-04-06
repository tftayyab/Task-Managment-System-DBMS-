import { useNavigate } from 'react-router-dom';
import { DeleteTasksIcon, EditTasksIcon, ShareIcon } from './svg';
import { formatDueDate } from '../utils/DayDate';
import { motion, AnimatePresence } from 'framer-motion';
import { handleDelete } from '../utils/handleTasks';
import useIsMobile from '../utils/useScreenSize';

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
  const isMobile = useIsMobile();
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
        .map((task) => [task._id, task])
    ).values()
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-10 min-h-[12rem]">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <ul className="flex flex-col gap-4 w-full flex-1 min-h-0 overflow-y-auto pr-1 pb-3 scrollbar-hide">
          <AnimatePresence>
            {filtered.map((task) => (
              <motion.li
                key={task._id}
                initial={isMobile ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                onClick={() => navigate(`/viewtask/${task._id}`)}
                className={`group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-shadow duration-150 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 cursor-pointer flex flex-col w-full ${
                  isMobile ? 'min-h-[min(72vh,36rem)]' : ''
                }`}
              >
                <div className="p-4 flex flex-col flex-1 min-h-0">
                  <p className="text-slate-800 dark:text-white font-inter text-base font-semibold break-words">
                    {task.title}
                  </p>

                  <div className="flex flex-col items-start mt-3 gap-2 text-xs shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : task.status === 'In Progress'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {task.status}
                    </span>
                    <p className="text-slate-400 dark:text-slate-500">
                      <span className="text-slate-600 dark:text-slate-300">Due:</span>{' '}
                      {formatDueDate(task.dueDate)}
                    </p>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 break-words flex-1 min-h-[4rem] overflow-y-auto">
                    {task.description}
                  </p>
                </div>

                <div
                  className={`flex flex-row justify-center items-center gap-3 p-4 border-slate-200 dark:border-slate-600 shrink-0 ${
                    isMobile
                      ? 'mt-auto border-t bg-slate-50 dark:bg-slate-900/90 rounded-b-[inherit]'
                      : 'sm:absolute sm:bottom-3 sm:right-3 sm:border-0 sm:bg-transparent sm:p-2 sm:mt-0'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
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
    </div>
  );
}

export default Tasks;
