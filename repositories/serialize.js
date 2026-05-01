function toIso(d) {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    email: row.email,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function formatTeam(row, shareWith) {
  if (!row) return null;
  return {
    _id: String(row.id),
    teamName: row.team_name,
    owner: row.owner,
    shareWith: shareWith || [],
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function formatDueDate(due) {
  if (!due) return null;
  if (typeof due === 'string' && /^\d{4}-\d{2}-\d{2}/.test(due)) {
    return due.slice(0, 10);
  }
  const t = new Date(due);
  return Number.isNaN(t.getTime()) ? null : t.toISOString().slice(0, 10);
}

function formatTask(row, teamIds, shareWith) {
  if (!row) return null;
  const due = row.due_date;
  return {
    _id: String(row.id),
    owner: row.owner,
    title: row.title,
    description: row.description || '',
    status: row.status,
    dueDate: formatDueDate(due),
    teamIds: (teamIds || []).map((id) => String(id)),
    shareWith: shareWith || [],
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

module.exports = { formatUser, formatTeam, formatTask, toIso };
