import { motion } from 'framer-motion';
import { handleTeamDelete } from '../utils/handleTeams';

const TeamActions = ({
  team,
  fetchTeamsWithRetry,
  setEditTeam,
  selectedTeam,
  setSelectedTeam,
  setNotification,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col min-w-[6rem] bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden transition-all duration-300 ease-in-out"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditTeam(team);
        }}
        className="px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium text-left transition-all"
      >
        Edit
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleTeamDelete({
            teamId: team._id,
            selectedTeam,
            setSelectedTeam,
            fetchTeamsWithRetry,
            setNotification,
          });
        }}
        className="px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-left whitespace-nowrap transition-all"
      >
        Delete
      </button>
    </motion.div>
  );
};

export default TeamActions;
