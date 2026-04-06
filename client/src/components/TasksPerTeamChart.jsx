import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const getTeamName = (teams, teamId) => {
  const team = teams.find((t) => t._id === teamId);
  return team ? team.teamName : 'Unknown';
};

const TasksPerTeamChart = ({ tasks, teams }) => {
  const isDark = document.documentElement.classList.contains('dark');

  const chartData = useMemo(() => {
    const teamStatusMap = {};

    tasks.forEach((task) => {
      if (!Array.isArray(task.teamIds)) return;

      task.teamIds.forEach((teamId) => {
        if (!teamStatusMap[teamId]) {
          teamStatusMap[teamId] = {
            Pending: 0,
            'In Progress': 0,
            Completed: 0,
          };
        }
        if (task.status in teamStatusMap[teamId]) {
          teamStatusMap[teamId][task.status]++;
        }
      });
    });

    const teamIds = Object.keys(teamStatusMap);
    const labels = teamIds.map((id) => getTeamName(teams, id));

    const pendingData = teamIds.map((id) => teamStatusMap[id].Pending || 0);
    const inProgressData = teamIds.map((id) => teamStatusMap[id]['In Progress'] || 0);
    const completedData = teamIds.map((id) => teamStatusMap[id].Completed || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Pending',
          data: pendingData,
          backgroundColor: '#f59e0b',
          borderRadius: 6,
        },
        {
          label: 'In Progress',
          data: inProgressData,
          backgroundColor: '#0ea5e9',
          borderRadius: 6,
        },
        {
          label: 'Completed',
          data: completedData,
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
      ],
    };
  }, [tasks, teams]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 10 },
          boxWidth: 12,
          padding: 16,
          color: isDark ? '#e2e8f0' : '#334155',
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#fff',
        titleColor: isDark ? '#f1f5f9' : '#334155',
        bodyColor: isDark ? '#cbd5e1' : '#64748b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        titleFont: { weight: 'bold' },
        bodyFont: { size: 12 },
        boxPadding: 6,
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Teams',
          font: { size: 10, family: 'Inter' },
          color: isDark ? '#94a3b8' : '#64748b',
        },
        ticks: {
          font: { family: 'Inter' },
          color: isDark ? '#94a3b8' : '#64748b',
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0,0,0,0.04)',
          lineWidth: 1,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          font: { family: 'Inter' },
          color: isDark ? '#94a3b8' : '#64748b',
        },
        title: {
          display: true,
          text: 'Tasks',
          font: { size: 10, family: 'Inter' },
          color: isDark ? '#94a3b8' : '#64748b',
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0,0,0,0.04)',
          lineWidth: 1,
        },
      },
    },
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 flex flex-col transition-shadow hover:shadow-md">
      <div className="min-w-[280px] w-full h-52 sm:h-56 md:h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TasksPerTeamChart;
