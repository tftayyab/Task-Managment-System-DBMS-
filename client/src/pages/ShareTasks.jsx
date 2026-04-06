// ShareTasks.jsx
import TeamForm from '../components/TeamForm';

function ShareTasks({ taskData, onClose, fetchTasksWithRetry, setNotification }) {
  return (
    <TeamForm
      mode="share"
      taskData={taskData}
      onClose={onClose}
      fetchTasksWithRetry={fetchTasksWithRetry}
      setNotification={setNotification}
    />
  );
}

export default ShareTasks;
