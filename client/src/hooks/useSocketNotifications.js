import { useEffect } from 'react';
import socket from '../utils/socket';

function useSocketNotifications(setNotification) {
  useEffect(() => {
    const joinTeamRoom = (teamId) => {
      if (teamId == null || teamId === '') return;
      socket.emit('join_teams', [String(teamId)]);
    };

    const handleTeamAdded = (data) => {
      setNotification(data.message);
      joinTeamRoom(data.teamId);
    };

    const handleTeamUpdated = (data) => {
      setNotification(data.message);
      joinTeamRoom(data.teamId);
    };

    const handleTaskCreated = (data) => {
      setNotification(data.message);
      joinTeamRoom(data.teamId);
    };

    const handleTaskUpdated = (data) => {
      setNotification(data.message);
      joinTeamRoom(data.teamId);
    };

    socket.on('team_added', handleTeamAdded);
    socket.on('team_updated', handleTeamUpdated);
    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);

    return () => {
      socket.off('team_added', handleTeamAdded);
      socket.off('team_updated', handleTeamUpdated);
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
    };
  }, [setNotification]);
}

export default useSocketNotifications;
