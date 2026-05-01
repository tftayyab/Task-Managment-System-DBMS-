import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const formatDateKey = (dateStr) => new Date(dateStr).toISOString().split('T')[0];
const formatLabel = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
const resolveStatusDateKey = (task) => {
  if (task?.dueDate) return formatDateKey(task.dueDate);
  return formatDateKey(task.updatedAt || task.createdAt);
};

const TasksOverTimeChart = ({ tasks, fillHeight = false }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const chartData = useMemo(() => {
    const createdMap = {}, pendingMap = {}, completedMap = {}, inProgressMap = {};

    tasks.forEach((task) => {
      const key = formatDateKey(task.createdAt);
      createdMap[key] = (createdMap[key] || 0) + 1;

      const updatedKey = resolveStatusDateKey(task);
      if (task.status === 'Pending') {
        pendingMap[updatedKey] = (pendingMap[updatedKey] || 0) + 1;
      }
      if (task.status === 'Completed') {
        completedMap[updatedKey] = (completedMap[updatedKey] || 0) + 1;
      }
      if (task.status === 'In Progress') {
        inProgressMap[updatedKey] = (inProgressMap[updatedKey] || 0) + 1;
      }
    });

    const allKeys = Array.from(new Set([
      ...Object.keys(createdMap),
      ...Object.keys(pendingMap),
      ...Object.keys(completedMap),
      ...Object.keys(inProgressMap),
    ])).sort((a, b) => new Date(a) - new Date(b));

    return {
      labels: allKeys.map(formatLabel),
      datasets: [
        {
          label: 'Created',
          data: allKeys.map(k => createdMap[k] || 0),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          pointBackgroundColor: '#f97316',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'In Progress',
          data: allKeys.map(k => inProgressMap[k] || 0),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          pointBackgroundColor: '#0ea5e9',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Pending',
          data: allKeys.map(k => pendingMap[k] || 0),
          borderColor: '#facc15',
          backgroundColor: 'rgba(250, 204, 21, 0.12)',
          pointBackgroundColor: '#facc15',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Completed',
          data: allKeys.map(k => completedMap[k] || 0),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#10b981',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [tasks]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
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
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 13, family: 'Inter' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          color: isDark ? '#e2e8f0' : '#334155',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: { size: 13 },
          color: isDark ? '#94a3b8' : '#64748b',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0,0,0,0.04)',
          lineWidth: 1,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (value) => Number.isInteger(value) ? value : null,
        },
        title: {
          display: true,
          text: 'Tasks',
          font: { size: 13 },
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
    <div className="w-full rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm p-4 h-full transition-all hover:shadow-md">
      <div className={`w-full relative ${fillHeight ? 'h-full' : 'aspect-[16/9]'}`}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TasksOverTimeChart;
