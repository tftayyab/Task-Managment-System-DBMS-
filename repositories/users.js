const { getPoolSync } = require('../config/db');
const { formatUser } = require('./serialize');

async function findByUsername(username) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, username, email, password, refresh_token, created_at, updated_at
     FROM users WHERE username = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

async function findById(id) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, username, email, password, refresh_token, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findExistingByEmailOrUsername(email, username) {
  const pool = getPoolSync();
  const [rows] = await pool.execute(
    `SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1`,
    [email, username]
  );
  return rows[0] || null;
}

async function createUser({ firstName, lastName, username, email, passwordHash }) {
  const pool = getPoolSync();
  const [result] = await pool.execute(
    `INSERT INTO users (first_name, last_name, username, email, password, refresh_token)
     VALUES (?, ?, ?, ?, ?, NULL)`,
    [firstName, lastName, username, email, passwordHash]
  );
  const [rows] = await pool.execute(
    `SELECT id, first_name, last_name, username, email, created_at, updated_at FROM users WHERE id = ?`,
    [result.insertId]
  );
  return formatUser(rows[0]);
}

async function updateRefreshToken(userId, refreshToken) {
  const pool = getPoolSync();
  await pool.execute(`UPDATE users SET refresh_token = ? WHERE id = ?`, [refreshToken, userId]);
}

module.exports = {
  findByUsername,
  findById,
  findExistingByEmailOrUsername,
  createUser,
  updateRefreshToken,
};
