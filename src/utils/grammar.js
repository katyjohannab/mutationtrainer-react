export function applyCase(original, mutated) {
  if (!original || !mutated) return mutated;
  if (original[0] === original[0].toUpperCase()) {
    return mutated[0].toUpperCase() + mutated.slice(1);
  }
  return mutated;
}

export function mutateWord(base, kind) {
  if (!base) return "";
  if (kind === "none") return base;
  const lower = base.toLowerCase();

  if (kind === "soft") {
    if (lower.startsWith("ll")) {
      return applyCase(base, `l${base.slice(2)}`);
    }
    if (lower.startsWith("rh")) {
      return applyCase(base, `r${base.slice(2)}`);
    }
    const softMap = {
      p: "b",
      t: "d",
      c: "g",
      b: "f",
      d: "dd",
      g: "",
      m: "f",
    };
    const first = lower[0];
    if (softMap[first] !== undefined) {
      return applyCase(base, `${softMap[first]}${base.slice(1)}`);
    }
  }

  if (kind === "aspirate") {
    const aspirateMap = {
      p: "ph",
      t: "th",
      c: "ch",
    };
    const first = lower[0];
    if (aspirateMap[first]) {
      return applyCase(base, `${aspirateMap[first]}${base.slice(1)}`);
    }
  }

  if (kind === "nasal") {
    const nasalMap = {
      p: "mh",
      t: "nh",
      c: "ngh",
      b: "m",
      d: "n",
      g: "ng",
    };
    const first = lower[0];
    if (nasalMap[first]) {
      return applyCase(base, `${nasalMap[first]}${base.slice(1)}`);
    }
  }

  return base;
}

// ------------------------------------------------------------------
// Internal Helpers
// ------------------------------------------------------------------

function normalize(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeChoice(value) {
  return normalize(value);
}

function normalizeBase(value) {
  return normalize(value);
}

function getAnswerValue(row) {
  return String(row?.answer ?? row?.Answer ?? "").trim();
}

function splitFirstWord(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return ["", ""];
  const match = trimmed.match(/^(\S+)([\s\S]*)$/);
  if (!match) return [trimmed, ""];
  return [match[1], match[2] || ""];
}

function shuffleArray(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ------------------------------------------------------------------
// Exported Logic
// ------------------------------------------------------------------

export function applyMutation(base, kind) {
  const [first, rest] = splitFirstWord(base);
  if (!first) return "";
  const mutatedFirst = mutateWord(first, kind);
  return `${mutatedFirst}${rest}`;
}

export function applyMutationSequence(base, kinds) {
  if (!Array.isArray(kinds) || kinds.length === 0) return "";
  let current = base;
  for (const kind of kinds) {
    current = applyMutation(current, kind);
  }
  return current;
}

export function makeChoices(currentRow, deckRows, sent) {
  const correct = getAnswerValue(currentRow);
  const normalizedCorrect = normalizeChoice(correct);
  const allRows = Array.isArray(deckRows) ? deckRows : [];
  const baseWord = String(sent?.base || currentRow?.base || currentRow?.Base || "").trim();
  const baseKey = normalizeBase(baseWord);

  const choices = [];
  const seen = new Set();
  const addChoice = (value) => {
    const trimmed = String(value ?? "").trim();
    const key = normalizeChoice(trimmed);
    if (!trimmed || !key || seen.has(key)) return false;
    seen.add(key);
    choices.push(trimmed);
    return true;
  };

  // 1) Always include correct answer
  addChoice(correct);

  // 2) Always include baseword if it differs from the correct form
  if (baseWord && normalizeChoice(baseWord) !== normalizedCorrect) {
    addChoice(baseWord);
  }

  // 3) Use real alternatives from same base in deck order
  if (baseKey && choices.length < 3) {
    for (const row of allRows) {
      if (choices.length >= 3) break;
      const rowBase = row?.base ?? row?.Base ?? "";
      if (normalizeBase(rowBase) !== baseKey) continue;
      addChoice(getAnswerValue(row));
    }
  }

  // 4) Fill from canonical plausible variants only
  if (baseWord && choices.length < 3) {
    const canonicalKinds = ["none", "soft", "nasal", "aspirate"];
    for (const kind of canonicalKinds) {
      if (choices.length >= 3) break;
      const candidate = kind === "none" ? baseWord : applyMutation(baseWord, kind);
      addChoice(candidate);
    }
  }

  return shuffleArray(choices.slice(0, 3));
}
