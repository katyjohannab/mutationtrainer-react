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
  const exclude = new Set(normalizedCorrect ? [normalizedCorrect] : []);

  const allRows = Array.isArray(deckRows) ? deckRows : [];
  const baseWord = sent?.base || currentRow?.base || currentRow?.Base || "";
  const baseKey = normalizeBase(baseWord);

  const distractors = [];
  const takeFromList = (list) => {
    for (const item of list) {
      if (distractors.length >= 2) break;
      distractors.push(item);
    }
  };

  // 1. Try to find other correct answers for the SAME word in the deck
  // (e.g. if 'ci' appears multiple times, use those real answers as distractors)
  if (baseKey) {
    const sameBaseAnswers = [];
    for (const row of allRows) {
      const rowBase = row?.base ?? row?.Base ?? "";
      if (normalizeBase(rowBase) !== baseKey) continue;
      const value = getAnswerValue(row);
      const key = normalizeChoice(value);
      if (!key || exclude.has(key) || !value) continue;
      exclude.add(key);
      sameBaseAnswers.push(value);
    }
    takeFromList(sameBaseAnswers);
  }

  // 2. If we need more distractors, generate them algorithmically
  if (distractors.length < 2) {
    const mutationSequences = [
      ["soft"],
      ["aspirate"],
      ["nasal"],
      ["soft", "nasal"],
      ["aspirate", "nasal"],
      ["soft", "aspirate"],
      ["nasal", "soft"],
    ];
    const variants = [];
    for (const seq of mutationSequences) {
      const mutated = applyMutationSequence(baseWord, seq);
      const key = normalizeChoice(mutated);
      if (!mutated || !key || exclude.has(key)) continue;
      exclude.add(key);
      variants.push(mutated);
    }
    takeFromList(variants);
  }

  // 3. Fallback: just add prefixes if we are desperate
  if (distractors.length < 2 && baseWord) {
    const fallback = [];
    const prefixVariants = ["h", "rh", "gh"];
    for (const prefix of prefixVariants) {
      const mutated = `${prefix}${baseWord}`;
      const key = normalizeChoice(mutated);
      if (!key || exclude.has(key)) continue;
      exclude.add(key);
      fallback.push(mutated);
    }
    takeFromList(fallback);
  }

  const choices = [correct, ...distractors].filter((value) => value);
  return shuffleArray(choices);
}
