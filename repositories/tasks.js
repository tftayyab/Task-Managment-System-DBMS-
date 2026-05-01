const { getPoolSync } = require('../config/db');
const { formatTask } = require('./serialize');
const { getTeamsByIds, findTeamsWithMembersForUser } = require('./teams');

async function loadTaskRelations(taskId) {
  const pool = getPoolSync();
  const [teamRows] = await pool.execute(`SELECT team_id FROM task_team WHERE task_id = ?`, [taskId]);
  const [shareRows] = await pool.execute(`SELECT username FROM task_shared_user WHERE task_id = ?`, [
    taskId,
  ]);
  return {
    teamIds: teamRows.map((r) => r.team_id),
    shareWith: shareRows.map((r) => r.username),
  };
}

async function formatTaskRow(row) {
  if (!row) return null;
  const rel = await loadTaskRelations(row.id);
  return formatTask(row, rel.teamIds, rel.shareWith);
}

async function findById(taskId) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(`SELECT * FROM tasks WHERE id = ? LIMIT 1`, [taskId]);
  if (!rows[0]) return null;
  return formatTaskRow(rows[0]);
}

async function findForUser(username) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(
    `
    SELECT DISTINCT t.*
    FROM tasks t
    LEFT JOIN task_shared_user tsu ON tsu.task_id = t.id AND tsu.username = ?
    WHERE t.owner = ? OR tsu.username IS NOT NULL
    ORDER BY t.updated_at DESC
    `,
    [username, username]
  );
  const out = [];
  for (const row of rows) {
    out.push(await formatTaskRow(row));
  }
  return out;
}

async function findByTeamIds(teamIds) {
  if (!teamIds || teamIds.length === 0) return [];
  const pool = getPoolSync();
  const placeholders = teamIds.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `
    SELECT DISTINCT t.*
    FROM tasks t
    INNER JOIN task_team tt ON tt.task_id = t.id
    WHERE tt.team_id IN (${placeholders})
    ORDER BY t.updated_at DESC
    `,
    teamIds
  );
  const out = [];
  for (const row of rows) {
    out.push(await formatTaskRow(row));
  }
  return out;
}

async function sharedTeamsAndTasks(username) {
  const teamsRaw = await findTeamsWithMembersForUser(username);
  const teamIds = teamsRaw.map((t) => Number(t._id));
  const tasks = teamIds.length ? await findByTeamIds(teamIds) : [];
  return { teams: teamsRaw, tasks };
}

async function createTask(
  { title, description, status, dueDate, createdAt },
  owner,
  teamIds,
  shareWith
) {
  const pool = getPoolSync();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const statusVal = status || 'Pending';
    let due = null;
    if (dueDate) {
      const d = new Date(dueDate);
      due = Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    }

    let taskId;
    if (createdAt) {
      const c = new Date(createdAt);
      if (!Number.isNaN(c.getTime())) {
        const [ins] = await conn.execute(
          `INSERT INTO tasks (owner, title, description, status, due_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [owner, title, description || '', statusVal, due, c, c]
        );
        taskId = ins.insertId;
      } else {
        const [ins] = await conn.execute(
          `INSERT INTO tasks (owner, title, description, status, due_date) VALUES (?, ?, ?, ?, ?)`,
          [owner, title, description || '', statusVal, due]
        );
        taskId = ins.insertId;
      }
    } else {
      const [ins] = await conn.execute(
        `INSERT INTO tasks (owner, title, description, status, due_date) VALUES (?, ?, ?, ?, ?)`,
        [owner, title, description || '', statusVal, due]
      );
      taskId = ins.insertId;
    }

    const numericTeamIds = (teamIds || []).map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    for (const tid of numericTeamIds) {
      await conn.execute(`INSERT IGNORE INTO task_team (task_id, team_id) VALUES (?, ?)`, [taskId, tid]);
    }
    const share = [...new Set(shareWith || [])].filter((u) => u && u !== owner);
    for (const u of share) {
      await conn.execute(`INSERT INTO task_shared_user (task_id, username) VALUES (?, ?)`, [taskId, u]);
    }

    await conn.commit();
    const [rows] = await pool.execute(`SELECT * FROM tasks WHERE id = ?`, [taskId]);
    return formatTaskRow(rows[0]);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function updateTask(
  taskId,
  owner,
  { title, description, status, dueDate },
  teamIds,
  shareWith
) {
  const pool = getPoolSync();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [own] = await conn.execute(`SELECT id FROM tasks WHERE id = ? AND owner = ? LIMIT 1`, [
      taskId,
      owner,
    ]);
    if (!own.length) {
      await conn.rollback();
      return null;
    }

    const [prevRow] = await conn.execute(`SELECT due_date FROM tasks WHERE id = ? LIMIT 1`, [taskId]);
    let due = prevRow[0]?.due_date ?? null;
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        due = null;
      } else {
        const d = new Date(dueDate);
        due = Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      }
    }

    await conn.execute(
      `UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ?`,
      [title, description || '', status, due, taskId]
    );

    await conn.execute(`DELETE FROM task_team WHERE task_id = ?`, [taskId]);
    await conn.execute(`DELETE FROM task_shared_user WHERE task_id = ?`, [taskId]);

    const numericTeamIds = (teamIds || []).map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    for (const tid of numericTeamIds) {
      await conn.execute(`INSERT INTO task_team (task_id, team_id) VALUES (?, ?)`, [taskId, tid]);
    }
    const share = [...new Set(shareWith || [])].filter((u) => u && u !== owner);
    for (const u of share) {
      await conn.execute(`INSERT INTO task_shared_user (task_id, username) VALUES (?, ?)`, [taskId, u]);
    }

    await conn.commit();
    const [rows] = await pool.execute(`SELECT * FROM tasks WHERE id = ?`, [taskId]);
    return formatTaskRow(rows[0]);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function deleteTask(taskId, owner) {
  const pool = getPoolSync();
  const [r] = await pool.execute(`DELETE FROM tasks WHERE id = ? AND owner = ?`, [taskId, owner]);
  return r.affectedRows > 0;
}

module.exports = {
  findById,
  findForUser,
  findByTeamIds,
  sharedTeamsAndTasks,
  createTask,
  updateTask,
  deleteTask,
};
