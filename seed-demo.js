require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.SEED_API_URL || `http://localhost:${process.env.PORT || 3000}`;
const PASSWORD = 'Harry.123';

const users = [
  {
    firstName: 'Muhammad',
    lastName: 'Tayyab',
    username: 'tftayyab',
    email: 'tftayyab@example.com',
    password: PASSWORD,
  },
  {
    firstName: 'Ali',
    lastName: 'Ahmed',
    username: 'aliahmed',
    email: 'aliahmed@example.com',
    password: PASSWORD,
  },
];

const teams = [
  { teamName: 'Core Product Team', usernames: ['aliahmed'] },
  { teamName: 'QA Sprint Team', usernames: ['aliahmed'] },
  { teamName: 'Client Demo Team', usernames: ['aliahmed'] },
];

const tasksForPresentation = [
  {
    title: 'Project kickoff plan',
    description: 'Define goals, scope, milestones, and timeline for the final delivery.',
    status: 'Completed',
    dueDate: '2026-03-05',
    createdAt: '2026-02-20T09:15:00.000Z',
  },
  {
    title: 'Wireframes for dashboard',
    description: 'Create desktop and mobile wireframes for dashboard screens.',
    status: 'Completed',
    dueDate: '2026-03-10',
    createdAt: '2026-02-22T10:10:00.000Z',
  },
  {
    title: 'Design system setup',
    description: 'Set typography scale, spacing tokens, and reusable UI styles.',
    status: 'Completed',
    dueDate: '2026-03-12',
    createdAt: '2026-02-24T11:00:00.000Z',
  },
  {
    title: 'Auth API integration',
    description: 'Connect login and register forms with backend token flow.',
    status: 'Completed',
    dueDate: '2026-03-14',
    createdAt: '2026-02-26T09:40:00.000Z',
  },
  {
    title: 'Socket notification events',
    description: 'Implement real-time notifications for team and task actions.',
    status: 'In Progress',
    dueDate: '2026-04-10',
    createdAt: '2026-03-01T12:20:00.000Z',
    teamName: 'Core Product Team',
  },
  {
    title: 'Task filters and search',
    description: 'Add filtering by status and search by title, text, and date.',
    status: 'Completed',
    dueDate: '2026-03-18',
    createdAt: '2026-03-02T14:00:00.000Z',
  },
  {
    title: 'Dark mode polish',
    description: 'Improve dark theme contrast and readability across pages.',
    status: 'In Progress',
    dueDate: '2026-04-08',
    createdAt: '2026-03-04T15:15:00.000Z',
  },
  {
    title: 'Mobile header redesign',
    description: 'Improve mobile spacing, icon tap areas, and title alignment.',
    status: 'Completed',
    dueDate: '2026-03-21',
    createdAt: '2026-03-05T10:50:00.000Z',
  },
  {
    title: 'Sidebar desktop alignment',
    description: 'Fix content overlap and spacing near desktop sidebar.',
    status: 'Completed',
    dueDate: '2026-03-22',
    createdAt: '2026-03-06T09:00:00.000Z',
  },
  {
    title: 'Chart data cleanup',
    description: 'Improve chart labels, scales, and tooltip consistency.',
    status: 'Pending',
    dueDate: '2026-04-15',
    createdAt: '2026-03-08T13:25:00.000Z',
    teamName: 'QA Sprint Team',
  },
  {
    title: 'Team sharing workflow',
    description: 'Refine share-to-team flow and improve user feedback.',
    status: 'In Progress',
    dueDate: '2026-04-16',
    createdAt: '2026-03-10T08:40:00.000Z',
    teamName: 'Core Product Team',
  },
  {
    title: 'Seed demo content',
    description: 'Prepare demo users, tasks, and teams for final presentation.',
    status: 'Completed',
    dueDate: '2026-04-01',
    createdAt: '2026-03-12T16:00:00.000Z',
  },
  {
    title: 'Accessibility pass',
    description: 'Fix focus states and color contrast for accessibility.',
    status: 'Pending',
    dueDate: '2026-04-20',
    createdAt: '2026-03-15T10:10:00.000Z',
    teamName: 'QA Sprint Team',
  },
  {
    title: 'Performance audit',
    description: 'Review bundle size and optimize heavy routes.',
    status: 'Pending',
    dueDate: '2026-04-25',
    createdAt: '2026-03-18T11:45:00.000Z',
  },
  {
    title: 'Final presentation prep',
    description: 'Prepare slides, walkthrough, and key demo points.',
    status: 'In Progress',
    dueDate: '2026-04-28',
    createdAt: '2026-03-20T12:35:00.000Z',
    teamName: 'Client Demo Team',
  },
  {
    title: 'Regression test pass',
    description: 'Run a complete test pass before release.',
    status: 'Pending',
    dueDate: '2026-04-18',
    createdAt: '2026-03-22T09:25:00.000Z',
    teamName: 'QA Sprint Team',
  },
  {
    title: 'Deploy checklist',
    description: 'Validate production environment and release checklist.',
    status: 'Pending',
    dueDate: '2026-04-29',
    createdAt: '2026-03-24T14:10:00.000Z',
    teamName: 'Client Demo Team',
  },
  {
    title: 'Client handover notes',
    description: 'Write implementation notes and known limitations for handover.',
    status: 'Pending',
    dueDate: '2026-04-30',
    createdAt: '2026-03-26T17:20:00.000Z',
    teamName: 'Client Demo Team',
  },
];

const tasksForAli = [
  {
    title: 'Review assigned tasks',
    description: 'Check shared tasks and update progress statuses.',
    status: 'In Progress',
    dueDate: '2026-04-09',
    createdAt: '2026-03-28T09:30:00.000Z',
  },
  {
    title: 'Prepare QA notes',
    description: 'Document bugs and edge cases from team testing.',
    status: 'Pending',
    dueDate: '2026-04-12',
    createdAt: '2026-03-29T11:20:00.000Z',
  },
  {
    title: 'Demo support checklist',
    description: 'Prepare assistance checklist for live demo session.',
    status: 'Pending',
    dueDate: '2026-04-14',
    createdAt: '2026-03-30T15:40:00.000Z',
  },
];

async function registerUser(client, user) {
  try {
    await client.post('/register', user);
    console.log(`Created user: ${user.username}`);
  } catch (err) {
    if (err.response?.status === 409) {
      console.log(`User already exists: ${user.username}`);
      return;
    }
    throw err;
  }
}

async function login(client, username, password) {
  const res = await client.post('/login', { username, password });
  return res.data?.accessToken;
}

async function createTeam(client, token, team) {
  await client.post('/teams', team, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`Team ensured: ${team.teamName}`);
}

async function getTeamIdByName(client, token, teamName) {
  const res = await client.get('/tasks/shared', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const matched = (res.data?.teams || []).find((t) => t.teamName === teamName);
  return matched?._id || null;
}

async function createTask(client, token, task, teamId = null) {
  const payload = {
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    teamIds: teamId ? [teamId] : [],
  };

  const res = await client.post('/tasks', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.task || null;
}

async function shareTaskToTeam(client, token, taskId, teamName) {
  await client.put(
    `/task/${taskId}/share`,
    { teamName, usernames: ['aliahmed'] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function seed() {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    withCredentials: true,
  });

  console.log(`Seeding demo data via API: ${API_BASE_URL}`);

  for (const user of users) {
    await registerUser(client, user);
  }

  const tftayyabToken = await login(client, 'tftayyab', PASSWORD);
  const aliToken = await login(client, 'aliahmed', PASSWORD);

  if (!tftayyabToken || !aliToken) {
    throw new Error('Failed to login seed users. Check server and credentials.');
  }

  for (const team of teams) {
    await createTeam(client, tftayyabToken, team);
  }

  const teamIdMap = {};
  for (const team of teams) {
    teamIdMap[team.teamName] = await getTeamIdByName(client, tftayyabToken, team.teamName);
  }

  const createdTasks = [];
  for (const task of tasksForPresentation) {
    const teamId = task.teamName ? teamIdMap[task.teamName] : null;
    const created = await createTask(client, tftayyabToken, task, teamId);
    if (created?._id) {
      createdTasks.push({ id: created._id, ...task });
      console.log(`Task created for tftayyab: ${task.title}`);
    }
  }

  for (const task of tasksForAli) {
    await createTask(client, aliToken, task);
    console.log(`Task created for aliahmed: ${task.title}`);
  }

  const shareTaskTitles = new Set([
    'Socket notification events',
    'Team sharing workflow',
    'Regression test pass',
    'Final presentation prep',
  ]);

  for (const task of createdTasks) {
    if (!shareTaskTitles.has(task.title)) continue;
    const teamName = task.teamName || 'Core Product Team';
    await shareTaskToTeam(client, tftayyabToken, task.id, teamName);
    console.log(`Task shared to team "${teamName}": ${task.title}`);
  }

  console.log('Demo seeding completed successfully.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.response?.data || err.message || err);
  process.exit(1);
});
