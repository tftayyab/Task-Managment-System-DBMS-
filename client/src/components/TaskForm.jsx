import { useEffect, useState } from 'react';
import { CrossIcon } from '../components/svg';
import { handleTaskSubmit } from '../utils/handleTasks';
import { enhanceTextWithAI } from '../utils/aiEnhancer';
import { motion } from 'framer-motion';
import {
  handleEnhanceField,
  animateTyping,
  handleReload,
} from '../utils/handleAI';


function TaskForm({
  mode = 'add',
  taskData = null,
  onClose,
  fetchTasksWithRetry,
  team = null,
  setNotification
}) {
  const [originalTitle, setOriginalTitle] = useState(document.title);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'In Progress',
    dueDate: ''
  });

  const [loadingTitle, setLoadingTitle] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [showReload, setShowReload] = useState({ title: false, description: false });
  const [showTooltip, setShowTooltip] = useState({
    title: true,
  });


  useEffect(() => {
    setOriginalTitle(document.title);

    if (mode === 'edit' && taskData) {
      const formattedDate = taskData.dueDate?.slice(0, 10);
      setNewTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        dueDate: formattedDate,
      });
      localStorage.setItem('originalTitle', taskData.title);
      localStorage.setItem('originalDescription', taskData.description);
      document.title = 'Edit Task';
    } else {
      document.title = 'Add Task';
    }
    const timeout = setTimeout(() => {
      setShowTooltip({ title: false, description: false });
    }, 3000);

    return () => {
      clearTimeout(timeout);
      document.title = originalTitle;
      localStorage.removeItem('originalTitle');
      localStorage.removeItem('originalDescription');
    };
  }, [mode, taskData]);

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative w-full sm:w-[90vw] max-w-3xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl p-4 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-700"
      >
        {/* Close */}
        <div
          onClick={() => {
            onClose();
            localStorage.removeItem('originalTitle');
            localStorage.removeItem('originalDescription');
          }}
          className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <CrossIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
        </div>

        {/* Header */}
        <div className="text-center">
          <p className="font-bold text-xl sm:text-2xl">
            {mode === 'edit' ? 'Edit Task' : 'Add New Task'}
          </p>
          <div className="mt-2 mx-auto w-12 sm:w-20 h-1 bg-indigo-500 rounded-full" />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Title</label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleUserInput}
              className="w-full pr-8 rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 items-center">
              {showReload.title && (
                <button
                  type="button"
                  onClick={() => handleReload('title', setNewTask)}
                  className="text-indigo-500 text-xl hover:underline"
                >
                  🔄
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    handleEnhanceField({
                      field: 'title',
                      newTask,
                      setNewTask,
                      setShowReload,
                      setLoadingTitle,
                      setLoadingDesc,
                  setNotification,
                    })
                  }
                  className="text-indigo-500 text-xl hover:scale-110 transition-transform"
                >
                  {loadingTitle ? '⏳' : '✨'}
                </button>

                {showTooltip.title && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="absolute whitespace-nowrap top-9 right-1 text-xs text-white bg-indigo-500 px-2 py-1 rounded-lg shadow z-10"
                  >
                    Edit with AI
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Description</label>
          <div className="relative">
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleUserInput}
              rows="4"
              className="w-full pr-8 rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm resize-none bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                transition-all"
            />
            <div className="absolute right-2 top-3 flex gap-2 items-center">
              {showReload.description && (
                <button
                  type="button"
                  onClick={() => handleReload('description', setNewTask)}
                  className="text-indigo-500 text-xl hover:underline"
                >
                  🔄
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  handleEnhanceField({
                    field: 'description',
                    newTask,
                    setNewTask,
                    setShowReload,
                    setLoadingTitle,
                    setLoadingDesc,
                  setNotification,
                  })
                }
                className="text-indigo-500 hover:scale-110 text-xl transition-transform"
              >
                {loadingDesc ? '⏳' : '✨'}
              </button>
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleUserInput}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white
              hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Status */}
        <div>
          <p className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Status</p>
          <div className="flex flex-wrap gap-4">
            {["Pending", "In Progress", "Completed"].map((status) => (
              <label
                key={status}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={newTask.status === status}
                  onChange={handleUserInput}
                  className="accent-indigo-500 cursor-pointer"
                />
                {status}
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center sm:justify-start">
          <button
            onClick={() =>
              handleTaskSubmit({
                mode,
                newTask,
                taskData,
                fetchTasksWithRetry,
                onClose,
                setNewTask,
                team,
                setNotification,
              })
            }
            disabled={!newTask.title || !newTask.description || !newTask.dueDate}
            className={`bg-indigo-500 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
              ${(!newTask.title || !newTask.description || !newTask.dueDate) && 'opacity-50 cursor-not-allowed'}`}
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default TaskForm;
