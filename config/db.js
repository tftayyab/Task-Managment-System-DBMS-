const mysql = require('mysql2/promise');

let pool;

function buildSslOption() {
  if (process.env.MYSQL_SSL === 'false') return undefined;
  if (process.env.MYSQL_SSL === 'true' || process.env.NODE_ENV === 'production') {
    return {
      rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false',
    };
  }
  return undefined;
}

function parseDatabaseUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const dbName = u.pathname.replace(/^\//, '').split('?')[0];
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: dbName,
    };
  } catch {
    return null;
  }
}

function getPoolConfig() {
  const fromUrl =
    parseDatabaseUrl(process.env.DATABASE_URL) ||
    parseDatabaseUrl(process.env.MYSQL_URL) ||
    parseDatabaseUrl(process.env.MYSQLDATABASE_URL);

  if (fromUrl) {
    return { ...fromUrl, ssl: buildSslOption() };
  }

  return {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'task_management',
    ssl: buildSslOption(),
  };
}

async function initSchema(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      username VARCHAR(64) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      refresh_token TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_users_username (username),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      team_name VARCHAR(255) NOT NULL,
      owner VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_team_owner_name (owner, team_name),
      KEY idx_teams_owner (owner)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id INT UNSIGNED NOT NULL,
      username VARCHAR(64) NOT NULL,
      PRIMARY KEY (team_id, username),
      CONSTRAINT fk_tm_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      owner VARCHAR(64) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
      due_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_tasks_owner (owner)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS task_team (
      task_id INT UNSIGNED NOT NULL,
      team_id INT UNSIGNED NOT NULL,
      PRIMARY KEY (task_id, team_id),
      CONSTRAINT fk_tt_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
      CONSTRAINT fk_tt_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS task_shared_user (
      task_id INT UNSIGNED NOT NULL,
      username VARCHAR(64) NOT NULL,
      PRIMARY KEY (task_id, username),
      CONSTRAINT fk_tsu_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function getPool() {
  if (pool) return pool;
  const cfg = getPoolConfig();
  pool = mysql.createPool({
    ...cfg,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 10),
    enableKeepAlive: true,
  });
  const conn = await pool.getConnection();
  try {
    await initSchema(conn);
  } finally {
    conn.release();
  }
  return pool;
}

function getPoolSync() {
  if (!pool) throw new Error('Database not initialized. Call getPool() first.');
  return pool;
}

module.exports = { getPool, getPoolSync, initSchema };
