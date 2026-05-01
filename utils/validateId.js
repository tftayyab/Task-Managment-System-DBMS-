/** Validates numeric task/team id (MySQL BIGINT/INT string or number). */
function isValidIdParam(id) {
  if (id === undefined || id === null) return false;
  const s = String(id).trim();
  if (!/^\d+$/.test(s)) return false;
  const n = Number(s);
  return n > 0 && n <= Number.MAX_SAFE_INTEGER;
}

module.exports = isValidIdParam;
