// ✅ useSocketNotifications.js
import { useEffect } from 'react';
import socket from '../utils/socket'; // NOT `import  socket` (no extra space)

function useSocketNotifications(setNotification) {
  useEffect(() => {
    const joinTeamRoom = (teamId) => {
      if (!teamId) return;
      socket.emit('join_teams', [teamId]);
    };

    const handleTeamAdded = (data) => {
      setNotification(data.message);
      joinTeamRoom(data.teamId);
    };

    const handleTeamUpdated = (data) => {
      setNotification(data.message);
      joinTeamRoom(data.teamId);
    };

    const handleTaskCreated = (data) => setNotification(data.message);

    socket.on('team_added', handleTeamAdded);
    socket.on('team_updated', handleTeamUpdated);
    socket.on('task_created', handleTaskCreated);

    return () => {
      socket.off('team_added', handleTeamAdded);
      socket.off('team_updated', handleTeamUpdated);
      socket.off('task_created', handleTaskCreated);
    };
  }, [setNotification]);
}

export default useSocketNotifications;
