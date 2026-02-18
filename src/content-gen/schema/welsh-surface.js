export function findUncontractedPrepositionArticle(text) {
  const source = String(text || "");
  const issues = [];

  const checks = [
    {
      regex: /\bi\s+(?:yr|y)\b/gi,
      suggestion: "Use contracted form `i'r` instead of `i y/yr`.",
    },
    {
      regex: /\bo\s+(?:yr|y)\b/gi,
      suggestion: "Use contracted form `o'r` instead of `o y/yr`.",
    },
  ];

  for (const check of checks) {
    let match = check.regex.exec(source);
    while (match) {
      issues.push({
        phrase: match[0],
        index: match.index,
        suggestion: check.suggestion,
      });
      match = check.regex.exec(source);
    }
  }

  return issues;
}

export function applyBoundaryContractions(before, answer) {
  let nextBefore = String(before || "");
  let nextAnswer = String(answer || "");

  if (!/^(?:yr|y)\s+/i.test(nextAnswer)) {
    return { before: nextBefore, answer: nextAnswer };
  }

  if (/\bi\s*$/i.test(nextBefore)) {
    nextBefore = nextBefore.replace(/\bi\s*$/i, (match) =>
      match[0] === "I" ? "I'r " : "i'r "
    );
    nextAnswer = nextAnswer.replace(/^(?:yr|y)\s+/i, "");
    return { before: nextBefore, answer: nextAnswer };
  }

  if (/\bo\s*$/i.test(nextBefore)) {
    nextBefore = nextBefore.replace(/\bo\s*$/i, (match) =>
      match[0] === "O" ? "O'r " : "o'r "
    );
    nextAnswer = nextAnswer.replace(/^(?:yr|y)\s+/i, "");
    return { before: nextBefore, answer: nextAnswer };
  }

  return { before: nextBefore, answer: nextAnswer };
}
