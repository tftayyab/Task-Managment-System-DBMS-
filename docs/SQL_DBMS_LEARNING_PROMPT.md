# Prompt: SQL & DBMS concepts in the Task Management System (for beginner learners)

Copy everything below the line into another AI chat. It assumes the AI knows **nothing** about this project.

---

You are helping a **beginner** learn **relational databases, SQL, and how a real web app uses them**. The case study is a **Task Management System** backend (Node.js + **MySQL** via **mysql2**), not the UI.

## 1. Big picture (DBMS)

- The app stores data in **MySQL**, a **relational DBMS**: data is organized in **tables** with **rows** (records) and **columns** (fields).
- The server opens a **connection pool** (`mysql2/promise` `createPool`) so many requests can reuse connections efficiently instead of opening a new connection every time.
- On startup, the app can **create tables if they do not exist** (`CREATE TABLE IF NOT EXISTS`) so the schema is self-initialized (see “Schema” below).

## 2. Tables and relationships (what exists in this project)

**`users`** — one row per registered user.

- **Primary key**: `id` (`INT UNSIGNED`, `AUTO_INCREMENT`): uniquely identifies each user.
- **Uniqueness**: `username` and `email` each have a **UNIQUE** constraint so two users cannot share the same login or email.
- Typical columns: `first_name`, `last_name`, `username`, `email`, `password` (stored **hashed**, not plain text), `refresh_token`, timestamps.

**`teams`** — a named group owned by a user.

- **Primary key**: `id`.
- **Business rule**: `(owner, team_name)` is **UNIQUE** — the same owner cannot create two teams with the same name.
- `owner` stores the **username** of the creator (string key into the user namespace used across the app).

**`team_members`** — **many-to-many** link: which usernames belong to which team.

- **Composite primary key**: `(team_id, username)`.
- **Foreign key**: `team_id` references `teams(id)` with **`ON DELETE CASCADE`**: if a team is deleted, its membership rows disappear automatically.

**`tasks`** — a task owned by a user.

- **Primary key**: `id`.
- Columns include `owner`, `title`, `description`, **`status`** as an **ENUM** (`'Pending' | 'In Progress' | 'Completed'`), `due_date` (`DATE`), `created_at`, `updated_at`.
- **Index** on `owner` to speed up “all tasks for this user” queries.

**`task_team`** — **many-to-many**: a task can be linked to several teams, a team can have many tasks.

- **Composite primary key**: `(task_id, team_id)`.
- **Foreign keys** to `tasks` and `teams`, with **`ON DELETE CASCADE`** on the task side so deleting a task cleans up links.

**`task_shared_user`** — which other usernames a task is **shared with** (aside from owner/teams).

- **Composite primary key**: `(task_id, username)`.
- **Foreign key** to `tasks` with **`ON DELETE CASCADE`**.

Together, this illustrates **normalization**, **keys**, **junction tables** (`task_team`, `team_members`, `task_shared_user`), and **referential integrity**.

## 3. SQL operations the app actually uses (by concept)

### SELECT (read data)

- **Single row by id**: `SELECT * FROM tasks WHERE id = ? LIMIT 1` — **parameterized** `?` placeholders (prepared statements) to avoid SQL injection.
- **Filtering**: `WHERE owner = ?`, `WHERE id = ? AND owner = ?` (authorization: only owner can change/delete).
- **JOINs**:
  - **`LEFT JOIN`** tasks with `task_shared_user` so the app can list tasks **owned by** a user **or** **shared with** them in one query.
  - **`INNER JOIN`** tasks with `task_team` to find tasks belonging to given **team ids**.
- **`DISTINCT`**: avoids duplicate task rows when joins could repeat the same task.
- **`ORDER BY updated_at DESC`**: show newest activity first.
- **Dynamic `IN` lists**: `WHERE team_id IN (?,?,...)` with a list of placeholders built from an array of ids.

### INSERT (create data)

- **Insert user**: `INSERT INTO users (...) VALUES (...)`.
- **Insert task**: `INSERT INTO tasks (...) VALUES (...)`, then read back `id` (auto-increment).
- **Link rows**: `INSERT INTO task_team (task_id, team_id)`, `INSERT INTO task_shared_user (task_id, username)`.
- **`INSERT IGNORE`**: used where duplicate links might be attempted — ignore if the row already exists (depends on keys).

### UPDATE (change data)

- **Update task fields**: `UPDATE tasks SET title = ?, ... WHERE id = ?`.
- **Update refresh token**: `UPDATE users SET refresh_token = ? WHERE id = ?`.
- **Team name / members**: update `teams`, then replace `team_members` rows (delete + re-insert pattern).

### DELETE (remove data)

- **Delete task**: `DELETE FROM tasks WHERE id = ? AND owner = ?` (owner check).
- **Delete team**: `DELETE FROM teams WHERE id = ? AND owner = ?`.
- **CASCADE**: deleting a **task** or **team** automatically removes related rows in `task_team`, `task_shared_user`, `team_members` where defined.

## 4. Transactions (ACID idea)

For operations that must **all succeed or all fail** (e.g. create a task and then insert many `task_team` / `task_shared_user` rows), the code uses:

- `connection.beginTransaction()`
- several `execute` calls on the **same** connection
- `commit()` on success or `rollback()` on error

This is the beginner-friendly introduction to **transactions** and **consistency**: either the whole “create task + links” completes, or nothing is left half-written.

## 5. Security & good practices shown

- **Prepared statements** (`?` parameters) for user-supplied values.
- Passwords are **not** stored as plain SQL literals; they are hashed before `INSERT` (application layer).
- **Ownership checks** in `WHERE` clauses (`owner = ?`) before update/delete.

## 6. What you (the AI tutor) should do with a student

- Map each **table** to a **real-world entity** (user, team, task).
- Draw or describe **one-to-many** (owner → tasks) vs **many-to-many** (tasks ↔ teams).
- Walk through **one** `SELECT` with a `JOIN` and explain **why** `JOIN` is needed instead of multiple queries.
- Explain **`PRIMARY KEY`**, **`FOREIGN KEY`**, **`UNIQUE`**, **`ENUM`**, **`ON DELETE CASCADE`**, **`INDEX`**, **`TRANSACTION`** using the examples above.
- Optionally contrast **SQL** with “saving to files” or ad-hoc storage to motivate the **DBMS** role.

**Important:** If you need exact column names or query text, say that they follow the patterns above and match a Node **mysql2** repository layer (`repositories/*.js`) and schema initialization (`config/db.js`), but you do not have the live database—only this conceptual map.

---

*End of prompt.*
