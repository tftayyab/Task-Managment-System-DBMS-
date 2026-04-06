import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleIcon, TeamIcon, AddIcon, OptionIcon } from './svg';
import TeamActions from './TeamAction';
import useIsMobile from '../utils/useScreenSize';
import { motion, AnimatePresence } from 'framer-motion';

function TeamList({
  teams = [],
  onTeamClick,
  onAddTeamClick,
  fetchTeamsWithRetry,
  setEditTeam,
  selectedTeam,
  setSelectedTeam,
  loading = false,
  setNotification,
}) {
  const [openActionId, setOpenActionId] = useState(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const strokeColors = ['#6366f1', '#f59e0b', '#0ea5e9', '#10b981'];

  useEffect(() => {
    const close = () => setOpenActionId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const isEmpty = !loading && teams.length === 0;

  return (
    <div className="w-full h-full flex flex-col text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div
          onClick={() => navigate('/collaborate')}
          className="flex items-center gap-x-2 cursor-pointer group"
        >
          <TeamIcon className="w-4 h-4" />
          <p className="text-indigo-500 dark:text-indigo-400 text-sm font-semibold group-hover:underline">Teams</p>
        </div>

        <button
          onClick={() => onAddTeamClick?.()}
          className="flex items-center gap-x-2 text-sm text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all"
        >
          <AddIcon className="w-4 h-4" />
          <span>Add Team</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-slate-400 dark:text-slate-500 text-lg font-inter mb-2">No Teams Found</p>
          <button
            onClick={() => onAddTeamClick?.()}
            className="text-indigo-500 dark:text-indigo-400 font-medium hover:underline mt-1"
          >
            + Add Team
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 w-full h-full overflow-y-auto pr-1 scrollbar-hide">
          <AnimatePresence>
            {teams.map((team, index) => {
              const stroke = strokeColors[index % strokeColors.length];
              return (
                <motion.li
                  key={team._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    if (isMobile) {
                      navigate(`/viewteamtask/${team._id}`);
                    } else {
                      onTeamClick?.(team._id);
                    }
                  }}
                  className="cursor-pointer group p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 hover:-translate-y-0.5 relative"
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CircleIcon className="flex-shrink-0 mt-1 w-4 h-4" stroke={stroke} />
                      <p className="text-slate-800 dark:text-white font-inter text-base font-semibold truncate">
                        {team.teamName || 'Unnamed Team'}
                      </p>
                    </div>

                    <div className="relative hidden sm:block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(prev => (prev === team._id ? null : team._id));
                        }}
                        className="hover:scale-110 transition-transform p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <OptionIcon />
                      </button>

                      {openActionId === team._id && (
                        <div className="absolute z-50 right-0 mt-2">
                          <TeamActions
                            team={team}
                            fetchTeamsWithRetry={fetchTeamsWithRetry}
                            setEditTeam={setEditTeam}
                            selectedTeam={selectedTeam}
                            setSelectedTeam={setSelectedTeam}
                            setNotification={setNotification}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <p>
                      <span className="font-medium text-slate-700 dark:text-slate-200">Owner:</span>{' '}
                      {team.owner}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700 dark:text-slate-200">Shared With:</span>{' '}
                      {team.shareWith?.length > 0 ? team.shareWith.join(', ') : 'No one yet'}
                    </p>
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

export default TeamList;
