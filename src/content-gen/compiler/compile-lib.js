import crypto from "crypto";
import { GRAMMAR_RULES } from "../../data/rules.js";
import { applyMutation } from "../../utils/grammar.js";
import { expandTemplate, matchesConstraints, serializeEvidenceRefs } from "../schema/content-schema.js";
import { applyBoundaryContractions } from "../schema/welsh-surface.js";

const CSV_COLUMNS = [
  "CardId",
  "Course",
  "RuleId",
  "RuleFamily",
  "RuleCategory",
  "Trigger",
  "Base",
  "Before",
  "After",
  "Answer",
  "Outcome",
  "TranslateSent",
  "Why",
  "WhyCym",
  "Level",
  "Dialect",
  "PatternId",
  "Focus",
  "QaStatus",
  "EvidenceRefs",
];

function stableString(parts) {
  return parts.map((part) => String(part ?? "").trim()).join("|");
}

function makeCardId(parts) {
  return `gen-${crypto.createHash("sha1").update(stableString(parts)).digest("hex").slice(0, 12)}`;
}

function dedupeEvidenceRefs(refs) {
  const output = [];
  const seen = new Set();

  for (const ref of refs || []) {
    const key = stableString([ref?.sourceId, ref?.page, ref?.boxLabel, ref?.note]);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push({
      sourceId: ref.sourceId,
      page: ref.page,
      boxLabel: ref.boxLabel,
      note: ref.note || "",
    });
  }

  return output;
}

function slotEnglishValue(candidate, slotConstraint) {
  let value = String(candidate.en || "");
  if (slotConstraint?.type === "verbnoun") {
    value = value.replace(/^to\s+/i, "");
  }
  return value;
}

function inferCategory(pattern, slotConstraint) {
  if (pattern.category) return pattern.category;

  const type = slotConstraint?.type;
  if (type === "place") return "PlaceName";
  if (type === "number") return "Number";
  if (type === "preposition") return "Preposition";
  if (type === "verbnoun") return "Phrase";
  if (type === "adj") return "Adjective";
  if (type === "noun") return "Noun";
  return "Phrase";
}

function inferTrigger(pattern, template) {
  if (pattern.trigger) return pattern.trigger;
  const slotToken = `{${template.slot}}`;
  const before = String(template.cy || "").split(slotToken)[0] || "";
  const trimmed = before.trim();
  if (!trimmed) return "(template)";
  return trimmed;
}

function inferNoneExplanation(pattern) {
  const template = Array.isArray(pattern.templates) && pattern.templates.length > 0
    ? pattern.templates[0]
    : null;
  const slot = template?.slot || null;
  const slotConstraint = slot ? pattern.constraints?.[slot] : null;
  const slotType = slotConstraint?.type || null;
  const slotToken = slot ? `{${slot}}` : "";
  const beforeRaw = template?.cy ? String(template.cy).split(slotToken)[0] : "";
  const before = beforeRaw.trim().toLowerCase();
  const beforeNormalized = before.replace(/\u2019/g, "'");

  const bodYnPattern = /\b(dw|dwi|rydw|rydw i|mae|wyt|ydy|rydym|rydyn)\b.*(?:'n)\s*$/.test(
    beforeNormalized
  );
  if (bodYnPattern && slotType === "adj") {
    return {
      why: "Using `bod + yn` with an adjective does not mutate the adjective in this pattern.",
      whyCym:
        "Wrth ddefnyddio `bod + yn` gydag ansoddair, dydy'r ansoddair ddim yn treiglo yn y patrwm hwn.",
    };
  }

  if (bodYnPattern && slotType === "verbnoun") {
    return {
      why: "Using `bod + yn` with a verbnoun keeps the verbnoun in base form (no mutation).",
      whyCym:
        "Wrth ddefnyddio `bod + yn` gyda berfenw, mae'r ferfenw yn aros yn y ffurf sylfaenol (dim treiglad).",
    };
  }

  if (/\byn\s*$/.test(beforeNormalized) && slotType === "place") {
    return {
      why: "In this frame, the place word stays in base form; no mutation is applied here.",
      whyCym:
        "Yn y ffrâm hon, mae'r gair lle yn aros yn y ffurf sylfaenol; does dim treiglad yn cael ei gymhwyso yma.",
    };
  }

  if (/\bi'r\s*$/.test(beforeNormalized) || /\bo'r\s*$/.test(beforeNormalized)) {
    return {
      why: "After the contracted preposition+article form (`i'r`/`o'r`), this item is kept unmutated in this pattern.",
      whyCym:
        "Ar ôl y ffurf gryno arddodiad+banod (`i'r`/`o'r`), cedwir yr eitem hon heb dreiglad yn y patrwm hwn.",
    };
  }

  return {
    why: "No mutation applies in this frame, so keep the target word in its base form.",
    whyCym: "Nid oes treiglad yn y ffrâm hon, felly cadwch y gair targed yn ei ffurf sylfaenol.",
  };
}

function resolveExplanation(pattern, mutation, ruleId) {
  if (pattern.explanationOverride) {
    return {
      why: pattern.explanationOverride.en,
      whyCym: pattern.explanationOverride.cy,
    };
  }

  const rule = GRAMMAR_RULES[ruleId];
  if (rule) {
    return {
      why: rule.en,
      whyCym: rule.cy,
    };
  }

  if (mutation === "none" || ruleId === "none") {
    return inferNoneExplanation(pattern);
  }

  if (!rule) {
    return {
      why: "Missing grammar explanation. Check ruleId mapping.",
      whyCym: "Esboniad gramadeg ar goll. Gwiriwch fapio ruleId.",
    };
  }
}

function resolveQaStatus(cardId, approvalRecord) {
  if (!approvalRecord) return "pending";

  const rejected = new Set(approvalRecord.rejectedCardIds || []);
  if (rejected.has(cardId)) return "rejected";

  const approved = new Set(approvalRecord.approvedCardIds || []);
  if (approved.has(cardId)) return "approved";

  if (approvalRecord.status === "approved" && approved.size === 0 && rejected.size === 0) {
    return "approved";
  }

  return "pending";
}

function pickCandidates(vocab, constraint, cardLimit) {
  const candidates = vocab
    .filter((item) => matchesConstraints(item, constraint))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (cardLimit && Number.isInteger(cardLimit) && cardLimit > 0) {
    return candidates.slice(0, cardLimit);
  }
  return candidates;
}

export function compileUnit({ level, dialect, unit, vocab, patterns, approvalRecord = null }) {
  const cards = [];
  const failures = [];

  const sortedPatterns = [...patterns].sort((a, b) => a.id.localeCompare(b.id));

  for (const pattern of sortedPatterns) {
    const templates = [...pattern.templates];
    for (let templateIndex = 0; templateIndex < templates.length; templateIndex += 1) {
      const template = templates[templateIndex];
      const slot = template.slot;
      const slotConstraint = pattern.constraints?.[slot];
      if (!slotConstraint) {
        failures.push(`Pattern '${pattern.id}' missing constraints for slot '${slot}'.`);
        continue;
      }

      const candidates = pickCandidates(vocab, slotConstraint, pattern.cardLimit);
      if (candidates.length === 0) {
        failures.push(
          `Pattern '${pattern.id}' has no vocab candidates for slot '${slot}' with current constraints.`
        );
        continue;
      }

      for (const candidate of candidates) {
        const mutation = pattern.focus === "contrast-none" ? "none" : pattern.mutation;
        const rawAnswer = applyMutation(candidate.base, mutation);
        const expanded = expandTemplate(template, slot, {
          ...candidate,
          en: slotEnglishValue(candidate, slotConstraint),
        });
        const contracted = applyBoundaryContractions(expanded.before, rawAnswer);
        const explanation = resolveExplanation(pattern, mutation, pattern.ruleId);
        const sourceRefs = dedupeEvidenceRefs([
          ...(pattern.evidenceRefs || []),
          ...(candidate.evidenceRefs || []),
        ]);

        const cardId = makeCardId([
          level,
          dialect,
          unit,
          pattern.id,
          templateIndex,
          candidate.id,
          mutation,
        ]);

        cards.push({
          cardId,
          level,
          dialect,
          course: pattern.course,
          unit: pattern.unit,
          patternId: pattern.id,
          ruleId: pattern.ruleId,
          mutation,
          focus: pattern.focus,
          family: mutation,
          category: inferCategory(pattern, slotConstraint),
          trigger: inferTrigger(pattern, template),
          base: candidate.base,
          before: contracted.before,
          after: expanded.after,
          answer: contracted.answer,
          translateSent: expanded.en,
          why: explanation.why,
          whyCym: explanation.whyCym,
          sourceRefs,
          qaStatus: resolveQaStatus(cardId, approvalRecord),
        });
      }
    }
  }

  const deterministicCards = [...cards].sort((a, b) => a.cardId.localeCompare(b.cardId));
  return { cards: deterministicCards, failures };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

export function toReviewCsv(cards) {
  const lines = [CSV_COLUMNS.join(",")];

  for (const card of cards) {
    const row = {
      CardId: card.cardId,
      Course: card.course,
      RuleId: card.ruleId,
      RuleFamily: card.family,
      RuleCategory: card.category,
      Trigger: card.trigger,
      Base: card.base,
      Before: card.before,
      After: card.after,
      Answer: card.answer,
      Outcome: card.mutation,
      TranslateSent: card.translateSent,
      Why: card.why,
      WhyCym: card.whyCym,
      Level: card.level,
      Dialect: card.dialect,
      PatternId: card.patternId,
      Focus: card.focus,
      QaStatus: card.qaStatus,
      EvidenceRefs: serializeEvidenceRefs(card.sourceRefs),
    };

    const line = CSV_COLUMNS.map((col) => csvEscape(row[col])).join(",");
    lines.push(line);
  }

  return `${lines.join("\n")}\n`;
}

function countBy(cards, key) {
  return cards.reduce((acc, card) => {
    const bucket = card[key] || "unknown";
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
}

function renderCountRows(counter) {
  return Object.entries(counter)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n");
}

export function toQaReport({ level, dialect, unit, cards, failures, approvalPath }) {
  const byMutation = countBy(cards, "mutation");
  const byStatus = countBy(cards, "qaStatus");
  const byFocus = countBy(cards, "focus");
  const byRule = countBy(cards, "ruleId");

  return `# QA Report

Last updated: ${new Date().toISOString().slice(0, 10)}

## Unit
- Level: ${level}
- Dialect: ${dialect}
- Unit: ${unit}
- Approval file: ${approvalPath || "not found"}

## Card Counts
- Total cards: ${cards.length}

### By Mutation
${renderCountRows(byMutation) || "- none: 0"}

### By Focus
${renderCountRows(byFocus) || "- none: 0"}

### By QA Status
${renderCountRows(byStatus) || "- pending: 0"}

### By Rule ID
${renderCountRows(byRule) || "- none: 0"}

## Compiler Failures
${failures.length ? failures.map((msg) => `- ${msg}`).join("\n") : "- none"}
`;
}

export function summarizeRules(cards) {
  const map = new Map();

  for (const card of cards) {
    const key = card.ruleId || "none";
    if (!map.has(key)) {
      map.set(key, {
        ruleId: key,
        cardCount: 0,
        mutationFamilies: new Set(),
        focuses: new Set(),
        patternIds: new Set(),
        whyEn: card.why || "",
        whyCy: card.whyCym || "",
      });
    }

    const bucket = map.get(key);
    bucket.cardCount += 1;
    bucket.mutationFamilies.add(card.mutation || "none");
    bucket.focuses.add(card.focus || "unknown");
    bucket.patternIds.add(card.patternId || "unknown");
    if (!bucket.whyEn && card.why) bucket.whyEn = card.why;
    if (!bucket.whyCy && card.whyCym) bucket.whyCy = card.whyCym;
  }

  return Array.from(map.values())
    .map((entry) => ({
      ruleId: entry.ruleId,
      cardCount: entry.cardCount,
      mutationFamilies: Array.from(entry.mutationFamilies).sort((a, b) => a.localeCompare(b)),
      focuses: Array.from(entry.focuses).sort((a, b) => a.localeCompare(b)),
      patternIds: Array.from(entry.patternIds).sort((a, b) => a.localeCompare(b)),
      whyEn: entry.whyEn,
      whyCy: entry.whyCy,
    }))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
}
