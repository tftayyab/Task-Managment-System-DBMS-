const { getPoolSync } = require('../config/db');
const { formatTeam } = require('./serialize');

async function getMembers(teamId) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(
    `SELECT username FROM team_members WHERE team_id = ? ORDER BY username`,
    [teamId]
  );
  return rows.map((r) => r.username);
}

async function getTeamById(teamId) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(`SELECT * FROM teams WHERE id = ? LIMIT 1`, [teamId]);
  if (!rows[0]) return null;
  const members = await getMembers(teamId);
  return formatTeam(rows[0], members);
}

async function getTeamsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const pool = getPoolSync();
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.execute(`SELECT * FROM teams WHERE id IN (${placeholders})`, ids);
  const out = [];
  for (const row of rows) {
    const members = await getMembers(row.id);
    out.push(formatTeam(row, members));
  }
  return out;
}

async function upsertTeamAddMembers(owner, teamName, newUsernames) {
  const pool = getPoolSync();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [existing] = await conn.execute(
      `SELECT id FROM teams WHERE owner = ? AND team_name = ? LIMIT 1`,
      [owner, teamName]
    );
    let teamId;
    if (existing.length === 0) {
      const [ins] = await conn.execute(
        `INSERT INTO teams (owner, team_name) VALUES (?, ?)`,
        [owner, teamName]
      );
      teamId = ins.insertId;
    } else {
      teamId = existing[0].id;
    }

    const [cur] = await conn.execute(`SELECT username FROM team_members WHERE team_id = ?`, [teamId]);
    const merged = new Set(cur.map((c) => c.username));
    (newUsernames || []).forEach((u) => merged.add(u));

    await conn.execute(`DELETE FROM team_members WHERE team_id = ?`, [teamId]);
    for (const u of merged) {
      await conn.execute(`INSERT INTO team_members (team_id, username) VALUES (?, ?)`, [teamId, u]);
    }

    await conn.commit();
    const [rows] = await pool.execute(`SELECT * FROM teams WHERE id = ?`, [teamId]);
    const members = await getMembers(teamId);
    return formatTeam(rows[0], members);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function updateTeam(teamId, owner, teamName, usernames) {
  const pool = getPoolSync();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(`SELECT id FROM teams WHERE id = ? AND owner = ? LIMIT 1`, [
      teamId,
      owner,
    ]);
    if (!rows.length) {
      await conn.rollback();
      return null;
    }
    await conn.execute(`UPDATE teams SET team_name = ? WHERE id = ?`, [teamName, teamId]);
    await conn.execute(`DELETE FROM team_members WHERE team_id = ?`, [teamId]);
    for (const u of usernames || []) {
      await conn.execute(`INSERT INTO team_members (team_id, username) VALUES (?, ?)`, [teamId, u]);
    }
    await conn.commit();
    const [t] = await pool.execute(`SELECT * FROM teams WHERE id = ?`, [teamId]);
    const members = await getMembers(teamId);
    return formatTeam(t[0], members);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function deleteTeam(teamId, ownerUsername) {
  const pool = getPoolSync();
  const [r] = await pool.execute(`DELETE FROM teams WHERE id = ? AND owner = ?`, [teamId, ownerUsername]);
  return r.affectedRows > 0;
}

/** Teams where user is owner or member, and has at least one member (for /tasks/shared list) */
async function findTeamsWithMembersForUser(username) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(
    `
    SELECT DISTINCT t.id
    FROM teams t
    INNER JOIN team_members tm ON tm.team_id = t.id
    WHERE t.owner = ? OR EXISTS (
      SELECT 1 FROM team_members m2 WHERE m2.team_id = t.id AND m2.username = ?
    )
    `,
    [username, username]
  );
  const ids = rows.map((r) => r.id);
  if (!ids.length) return [];
  return getTeamsByIds(ids);
}

module.exports = {
  getTeamById,
  getTeamsByIds,
  getMembers,
  upsertTeamAddMembers,
  updateTeam,
  deleteTeam,
  findTeamsWithMembersForUser,
};
