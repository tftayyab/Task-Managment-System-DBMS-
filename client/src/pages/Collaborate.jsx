import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import TeamList from '../components/TeamList';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import TeamForm from '../components/TeamForm';
import ShareTasks from './ShareTasks';
import api from '../api';
import useAuthToken from '../utils/useAuthToken';
import { motion } from 'framer-motion';

function Collaborate() {
  const { searchTerm, setNotification } = useOutletContext();

  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareTask, setShareTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTeam, setEditTeam] = useState(null);

  useAuthToken();

  useEffect(() => {
    fetchSharedData();
  }, []);

  const fetchSharedData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/shared');
      const updatedTeams = res.data.teams || [];
      setTeams(updatedTeams);
      setTasks(res.data.tasks || []);

      if (
        selectedTeam &&
        updatedTeams.some((team) => team._id === selectedTeam._id)
      ) {
        setSelectedTeam(updatedTeams.find((team) => team._id === selectedTeam._id));
      } else if (updatedTeams.length > 0) {
        setSelectedTeam(updatedTeams[0]);
      } else {
        setSelectedTeam(null);
      }
    } catch (err) {
      console.error("Failed to load shared data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = selectedTeam
    ? tasks.filter(task =>
        Array.isArray(task.teamIds) &&
        task.teamIds.some(id => id.toString() === selectedTeam._id)
      )
    : [];

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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-4 sm:p-6 h-full flex flex-col gap-y-5 sm:flex-row sm:gap-6 transition-all duration-300">

          {/* Team List */}
          <div className="order-1 sm:h-full w-full h-full sm:w-1/2 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 sm:p-6 overflow-y-auto scrollbar-hide">
            <TeamList
              teams={teams}
              onTeamClick={(teamId) => {
                const team = teams.find((t) => t._id === teamId);
                setSelectedTeam(team);
              }}
              onAddTeamClick={() => setShowTeamForm(true)}
              fetchTeamsWithRetry={fetchSharedData}
              setEditTeam={setEditTeam}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              loading={loading}
              setNotification={setNotification}
            />
          </div>

          {/* Task List */}
          <div className="order-2 min-h-[240px] sm:min-h-0 sm:h-full w-full sm:w-1/2 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 sm:p-6 overflow-y-auto scrollbar-hide">
            <TaskList
              tasks={filteredTasks}
              statuses={["Pending", "In Progress", "Completed"]}
              setEditTask={setEditTask}
              fetchTasksWithRetry={fetchSharedData}
              setShareTask={setShareTask}
              onTaskClick={(taskId) => navigate(`/viewtask/${taskId}`)}
              onAddTaskClick={() => setShowTaskForm(true)}
              searchTerm={searchTerm}
              loading={loading}
              setNotification={setNotification}
            />
          </div>
        </div>
      </motion.div>

      {showTaskForm && (
        <TaskForm
          mode="add"
          team={selectedTeam}
          onClose={() => setShowTaskForm(false)}
          setNotification={setNotification}
          fetchTasksWithRetry={() => {
            fetchSharedData();
            setNotification("Task added to team");
          }}
        />
      )}

      {editTask && (
        <TaskForm
          mode="edit"
          taskData={editTask}
          team={selectedTeam}
          onClose={() => setEditTask(null)}
          setNotification={setNotification}
          fetchTasksWithRetry={() => {
            fetchSharedData();
            setNotification("Task updated");
          }}
        />
      )}

      {showTeamForm && (
        <TeamForm
          mode="add"
          onClose={() => setShowTeamForm(false)}
          setNotification={setNotification}
          fetchTasksWithRetry={() => {
            fetchSharedData();
            setNotification("Team created successfully");
          }}
        />
      )}

      {editTeam && (
        <TeamForm
          mode="edit"
          taskData={editTeam}
          onClose={() => setEditTeam(null)}
          setNotification={setNotification}
          fetchTasksWithRetry={() => {
            fetchSharedData();
            setNotification("Team updated");
          }}
        />
      )}

      {shareTask && (
        <ShareTasks
          taskData={shareTask}
          onClose={() => setShareTask(null)}
          fetchTasksWithRetry={() => {
            fetchSharedData();
            setNotification("Task shared with team");
          }}
        />
      )}
    </motion.div>
  );
}

export default Collaborate;
