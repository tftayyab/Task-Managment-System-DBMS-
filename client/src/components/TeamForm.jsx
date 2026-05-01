import { useEffect, useState } from 'react';
import { CrossIcon } from '../components/svg';
import {
  handleTeamSubmit,
  handleTeamEditDirect,
  handleMemberChange,
  fetchTeams,
  handleAddToTeam,
} from '../utils/handleTeams';
import { motion } from 'framer-motion';

function TeamForm({ mode = 'add', taskData = null, onClose, fetchTasksWithRetry, setNotification }) {
  const [originalTitle, setOriginalTitle] = useState(document.title);
  const [teamData, setTeamData] = useState({
    teamName: '',
    members: ['', '', '', '', ''],
    _id: null,
  });
  const [userTeams, setUserTeams] = useState([]);
  const [step, setStep] = useState('select');

  useEffect(() => {
    setOriginalTitle(document.title);

    if (mode === 'edit' && taskData) {
      const existingMembers = taskData.shareWith || [];
      const paddedMembers = [...existingMembers, ...Array(5 - existingMembers.length).fill('')];

      setTeamData({
        teamName: taskData.teamName || '',
        members: paddedMembers,
        _id: taskData._id || null,
      });

      document.title = 'Edit Team';
    } else if (mode === 'add') {
      document.title = 'Add Team';
    } else if (mode === 'share') {
      document.title = 'Share Task';
      fetchTeams(setUserTeams);
    }

    return () => {
      document.title = originalTitle;
    };
  }, [mode, taskData]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative w-full sm:w-[90vw] max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-700"
      >
        {/* Close */}
        <div
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <CrossIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
        </div>

        {/* Header */}
        <div className="text-center">
          <p className="text-slate-800 dark:text-white font-bold text-xl sm:text-2xl">
            {mode === 'edit'
              ? 'Edit Team'
              : mode === 'share'
              ? 'Share Task'
              : 'Add New Team'}
          </p>
          <div className="mt-2 mx-auto w-12 sm:w-20 h-1 bg-indigo-500 rounded-full" />
        </div>

        {/* Share Mode Select */}
        {mode === 'share' && step === 'select' && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              Choose how you want to share the task:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setStep('create')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                + Create New Team
              </button>
              <button
                onClick={() => setStep('list')}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                Add to Existing Team
              </button>
            </div>
          </div>
        )}

        {/* Team List */}
        {mode === 'share' && step === 'list' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-white text-center">
              Select a team to share this task with:
            </p>
            <ul className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 scrollbar-hide">
              {userTeams.length === 0 ? (
                <p className="text-slate-400 text-center dark:text-slate-500">No teams available</p>
              ) : (
                userTeams.map((team) => (
                  <li
                    key={team._id}
                    onClick={() =>
                      handleAddToTeam({ team, taskData, fetchTasksWithRetry, onClose, setNotification })
                    }
                    className="cursor-pointer px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700
                               hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm
                               transition-all"
                  >
                    <p className="text-sm font-semibold text-slate-700 dark:text-white">{team.teamName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Shared with: {team.shareWith.join(', ') || 'None'}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {/* Form */}
        {(mode === 'add' || mode === 'edit' || step === 'create') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Team Name</label>
              <input
                type="text"
                placeholder="Enter team name"
                value={teamData.teamName}
                onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white
                           hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                           transition-all"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Team Members (Max 5)</p>
              {teamData.members.map((member, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Member ${idx + 1}`}
                  value={member}
                  onChange={(e) =>
                    handleMemberChange(idx, e.target.value, teamData, setTeamData)
                  }
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white
                             hover:border-indigo-300 dark:hover:border-indigo-600 focus:border-indigo-500
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                             transition-all"
                />
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (mode === 'edit') {
                    handleTeamEditDirect({ teamData, fetchTasksWithRetry, onClose, setNotification });
                  } else {
                    handleTeamSubmit({ teamData, fetchTasksWithRetry, onClose, taskData, setNotification });
                  }
                }}
                disabled={!teamData.teamName}
                className={`bg-indigo-500 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                  ${!teamData.teamName && 'opacity-50 cursor-not-allowed'}`}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default TeamForm;
