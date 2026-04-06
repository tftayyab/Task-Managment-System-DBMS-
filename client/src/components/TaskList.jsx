import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleIcon, OptionIcon, AddIcon, TaskIcon } from './svg';
import Actions from './actions';
import useIsMobile from '../utils/useScreenSize';
import { getDueLabel } from '../utils/DayDate';
import { motion, AnimatePresence } from 'framer-motion';

function TaskList({
  tasks,
  fetchTasksWithRetry,
  statuses = [],
  searchTerm = '',
  setEditTask,
  onTaskClick,
  onAddTaskClick,
  mode = '',
  setShareTask,
  loading = false,
  setNotification,
}) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openActionId, setOpenActionId] = useState(null);
  const clickTimeout = useRef(null);

  const search = searchTerm.toLowerCase().trim();
  const strokeColors = ['#6366f1', '#f59e0b', '#0ea5e9', '#10b981'];

  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const monthMap = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  };

  const filtered = tasks.filter((task) => {
    const monthNumber = monthMap[search];

    const matchesSearch =
      !search ||
      [
        task.title?.toLowerCase(),
        task.description?.toLowerCase(),
        task.status?.toLowerCase(),
        task.dueDate,
      ].some((field) => field?.includes(search)) ||
      (monthNumber && task.dueDate?.slice(5, 7) === monthNumber);
    if (search) return matchesSearch;
    return statuses.includes(task.status);
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      {!(statuses.length === 1 && statuses[0]?.toLowerCase() === 'completed') && (
        <div className="flex items-center justify-between mb-4">
          <div
            onClick={() => navigate('/mytasks')}
            className="flex items-center gap-x-2 cursor-pointer group"
          >
            <TaskIcon className="w-4 h-4" />
            <p className="text-indigo-500 dark:text-indigo-400 text-sm font-semibold group-hover:underline">Tasks</p>
          </div>

          <button
            onClick={() => onAddTaskClick?.()}
            className="flex items-center gap-x-2 text-sm text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all"
          >
            <AddIcon className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-slate-400 dark:text-slate-500 text-lg font-inter mb-2">No Tasks Found</p>
          <button
            onClick={() => onAddTaskClick?.()}
            className="text-indigo-500 dark:text-indigo-400 font-medium hover:underline mt-1"
          >
            + Add Task
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 w-full h-full overflow-y-auto overflow-x-visible pr-1 pb-3 scrollbar-hide">
          <AnimatePresence>
            {filtered.map((task, index) => {
              const stroke = strokeColors[index % strokeColors.length];
              return (
                <motion.li
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => {
                    if (isMobile) {
                      navigate(`/viewtask/${task._id}`);
                    } else {
                      onTaskClick?.(task._id);
                    }
                  }}
                  className={`cursor-pointer group p-4 rounded-xl border 
                    border-slate-200 dark:border-slate-700
                    bg-white dark:bg-slate-800
                    text-slate-800 dark:text-slate-100 
                    shadow-sm transition-shadow duration-150 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 relative isolate ${
                      openActionId === task._id ? 'z-[200]' : 'z-[1]'
                    }`}
                >
                  {/* Top Row: grid keeps title from flowing under the ⋮ control */}
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1 items-start">
                    <div className="flex items-start gap-2 min-w-0">
                      <CircleIcon className="flex-shrink-0 mt-1 w-4 h-4" stroke={stroke} />
                      <p
                        className="font-inter text-base font-semibold line-clamp-2 break-words min-w-0"
                        title={task.title}
                      >
                        {task.title}
                      </p>
                    </div>

                    <div className="relative hidden sm:block flex-shrink-0 z-[5]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId((prev) => (prev === task._id ? null : task._id));
                        }}
                        className="hover:scale-110 transition-transform p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg -mr-1"
                        type="button"
                      >
                        <OptionIcon />
                      </button>

                      {openActionId === task._id && (
                        <div className="absolute z-[220] right-0 top-full mt-1">
                          <Actions
                            task={task}
                            fetchTasksWithRetry={fetchTasksWithRetry}
                            setEditTask={setEditTask}
                            setShareTask={setShareTask}
                            setNotification={setNotification}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description — reserve horizontal space; ellipsis when long */}
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 min-w-0 line-clamp-2 break-words">
                    {task.description}
                  </p>

                  {/* Status + Due */}
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      task.status === 'In Progress' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {task.status}
                    </span>
                    <p className="text-slate-400 dark:text-slate-500">{getDueLabel(task.dueDate)}</p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

export default TaskList;
