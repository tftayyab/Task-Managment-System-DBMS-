import api from '../api';

// 🧩 Handle team creation
export const handleTeamSubmit = async ({
  teamData,
  fetchTasksWithRetry,
  onClose,
  taskData = null,
  setNotification, // ✅ added
}) => {
  try {
    const payload = {
      teamName: teamData.teamName,
      usernames: teamData.members.filter(Boolean),
    };

    await api.post('/teams', payload);

    if (taskData) {
      await api.put(`/task/${taskData._id}/share`, payload);
    }

    if (fetchTasksWithRetry) fetchTasksWithRetry();
    if (onClose) onClose();
    if (setNotification) setNotification("✅ Team created successfully!");
  } catch (error) {
    console.error("❌ Team submit (with share) failed:", error);
    if (setNotification) setNotification("❌ Failed to create team");
  }
};

// ♻️ Handle team update (share task with team)
export const handleTeamUpdate = async ({
  teamData,
  taskData,
  fetchTasksWithRetry,
  onClose,
  setNotification, // ✅
}) => {
  try {
    const payload = {
      teamName: teamData.teamName,
      usernames: teamData.members.filter(Boolean),
      teamId: teamData._id,
    };

    await api.put(`/task/${taskData._id}/share`, payload);

    if (fetchTasksWithRetry) fetchTasksWithRetry();
    if (onClose) onClose();
    if (setNotification) setNotification("✅ Task shared with team!");
  } catch (error) {
    console.error("❌ Team update failed:", error);
    if (setNotification) setNotification("❌ Failed to update team");
  }
};

// ✏️ Real team edit (not task sharing)
export const handleTeamEditDirect = async ({
  teamData,
  fetchTasksWithRetry,
  onClose,
  setNotification, // ✅
}) => {
  try {
    const payload = {
      teamName: teamData.teamName,
      usernames: teamData.members.filter(Boolean),
    };

    await api.put(`/teams/${teamData._id}`, payload);

    if (fetchTasksWithRetry) fetchTasksWithRetry();
    if (onClose) onClose();
    if (setNotification) setNotification("✏️ Team updated!");
  } catch (err) {
    console.error("❌ Failed to edit team:", err);
    if (setNotification) setNotification("❌ Team update failed");
  }
};

// ❌ Delete a team
export const handleTeamDelete = async ({
  teamId,
  selectedTeam,
  setSelectedTeam,
  fetchTeamsWithRetry,
  setNotification, // ✅
}) => {
  try {
    await api.delete(`/teams/${teamId}`);

    if (selectedTeam && selectedTeam._id === teamId) {
      setSelectedTeam(null);
    }

    if (fetchTeamsWithRetry) fetchTeamsWithRetry();
    if (setNotification) setNotification("🗑️ Team deleted");
  } catch (error) {
    console.error('❌ Failed to delete team:', error);
    if (setNotification) setNotification("❌ Failed to delete team");
  }
};

// 🧠 Update one member in the team
export const handleMemberChange = (idx, value, teamData, setTeamData) => {
  const updatedMembers = [...teamData.members];
  updatedMembers[idx] = value;
  setTeamData({ ...teamData, members: updatedMembers });
};

// 🔁 Fetch all user teams (for share)
export const fetchTeams = async (setUserTeams, setNotification = null) => {
  try {
    const res = await api.get('/tasks/shared');
    setUserTeams(res.data.teams || []);
  } catch (err) {
    console.error('❌ Failed to fetch teams:', err);
    if (setNotification) setNotification("❌ Couldn't load teams");
  }
};

// 📌 Share a task with an existing team
export const handleAddToTeam = async ({
  team,
  taskData,
  fetchTasksWithRetry,
  onClose,
  setNotification, // ✅
}) => {
  try {
    const payload = {
      teamName: team.teamName,
      usernames: team.shareWith,
    };

    await api.put(`/task/${taskData._id}/share`, payload);

    if (fetchTasksWithRetry) fetchTasksWithRetry();
    if (onClose) onClose();
    if (setNotification) setNotification(`Task shared to "${team.teamName}"`);
  } catch (err) {
    console.error('❌ Failed to share task with team:', err);
    if (setNotification) setNotification("❌ Failed to share task");
  }
};
