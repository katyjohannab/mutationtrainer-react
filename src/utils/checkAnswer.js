// src/utils/checkAnswer.js
function norm(s) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// Some datasets encode multiple acceptable answers like "fy nghi|nghi"
function splitAccepted(answer) {
  const raw = String(answer ?? "").trim();
  if (!raw) return [];
  return raw.split("|").map((x) => x.trim()).filter(Boolean);
}

export function checkAnswer(row, guess) {
  const accepted = splitAccepted(row?.answer ?? row?.Answer);
  const g = norm(guess);

  if (accepted.length === 0) {
    // fallback: compare directly to row.answer
    return g === norm(row?.answer ?? row?.Answer);
  }

  return accepted.some((a) => norm(a) === g);
}
