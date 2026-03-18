export function fmtTime(ts: string) {
  // Extract HH:MM directly from the stored timestamp string to avoid
  // server/client timezone mismatch (server is UTC, browser is local time).
  const match = ts.match(/T(\d{2}:\d{2})/)
  return match ? match[1] : ts
}
