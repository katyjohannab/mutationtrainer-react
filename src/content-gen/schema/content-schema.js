import { GRAMMAR_RULES } from "../../data/rules.js";
import {
  ALLOWED_SEMANTIC_STATUS,
  KNOWN_SEMANTIC_CLASSES,
  isCanonicalSemanticClass,
} from "./semantic-class-catalog.js";
import { findUncontractedPrepositionArticle } from "./welsh-surface.js";

export const ALLOWED_TYPES = new Set([
  "noun",
  "place",
  "person",
  "verbnoun",
  "adj",
  "number",
  "preposition",
  "other",
]);
export const ALLOWED_LEVELS = new Set(["mynediad", "sylfaen", "canolradd", "uwch"]);
export const ALLOWED_DIALECTS = new Set(["north", "south"]);

export const ALLOWED_MUTATIONS = new Set(["none", "soft", "nasal", "aspirate"]);
export const ALLOWED_GENDER = new Set(["m", "f", "null"]);
export const ALLOWED_COUNTABILITY = new Set(["count", "mass", "collective", "proper"]);
export const ALLOWED_ARTICLE_BEHAVIOUR = new Set(["bare", "definite", "either", "fixed"]);
export const ALLOWED_PLACE_PREP = new Set(["yn-bare", "yn-article", "i-bare", "i-article"]);
export const ALLOWED_FOCUS = new Set(["mutation", "contrast-none"]);
export const ALLOWED_RULE_PROPOSAL_STATUS = new Set(["proposed", "approved", "rejected"]);

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function canonical(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function assertString(errors, label, value) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${label} must be a non-empty string.`);
  }
}

function assertPositiveInt(errors, label, value) {
  if (!Number.isInteger(value) || value <= 0) {
    errors.push(`${label} must be a positive integer.`);
  }
}

export function inferUnitMetaFromPath(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  const match = normalized.match(/unit-data\/([^/]+)\/([^/]+)\/unit(\d+)\.js$/);
  if (!match) return null;
  return {
    level: match[1],
    dialect: match[2],
    unit: Number(match[3]),
  };
}

export function extractSlots(template) {
  if (typeof template !== "string") return [];
  const matches = template.match(/\{[a-zA-Z0-9_]+\}/g) || [];
  return matches.map((token) => token.slice(1, -1));
}

export function serializeEvidenceRefs(refs) {
  return JSON.stringify(refs || []);
}

function validateEvidenceRefs(errors, label, refs) {
  if (!Array.isArray(refs) || refs.length === 0) {
    errors.push(`${label} must be a non-empty array.`);
    return;
  }

  refs.forEach((ref, index) => {
    const prefix = `${label}[${index}]`;
    if (!isObject(ref)) {
      errors.push(`${prefix} must be an object.`);
      return;
    }
    assertString(errors, `${prefix}.sourceId`, ref.sourceId);
    if (typeof ref.page !== "number" || ref.page <= 0) {
      errors.push(`${prefix}.page must be a positive number.`);
    }
    assertString(errors, `${prefix}.boxLabel`, ref.boxLabel);
    if (ref.note !== undefined && typeof ref.note !== "string") {
      errors.push(`${prefix}.note must be a string when present.`);
    }
  });
}

function validateConstraint(errors, label, constraintValue) {
  if (!isObject(constraintValue)) {
    errors.push(`${label} must be an object.`);
    return;
  }

  if (constraintValue.type !== undefined && !ALLOWED_TYPES.has(constraintValue.type)) {
    errors.push(`${label}.type '${constraintValue.type}' is invalid.`);
  }

  if (constraintValue.semanticClass !== undefined) {
    if (!isCanonicalSemanticClass(constraintValue.semanticClass)) {
      errors.push(
        `${label}.semanticClass '${constraintValue.semanticClass}' must use canonical format (e.g. place.town).`
      );
    }
  }
}

function validateSemanticClass(errors, label, item) {
  if (item.semanticClass === undefined) return;

  if (typeof item.semanticClass !== "string" || !item.semanticClass.trim()) {
    errors.push(`${label}.semanticClass must be a non-empty string when present.`);
    return;
  }

  if (!isCanonicalSemanticClass(item.semanticClass)) {
    errors.push(
      `${label}.semanticClass '${item.semanticClass}' must use canonical format (e.g. place.town).`
    );
  }

  if (
    item.semanticClassStatus !== undefined &&
    !ALLOWED_SEMANTIC_STATUS.has(item.semanticClassStatus)
  ) {
    errors.push(`${label}.semanticClassStatus '${item.semanticClassStatus}' is invalid.`);
  }

  const known = KNOWN_SEMANTIC_CLASSES.has(item.semanticClass);
  const status = item.semanticClassStatus;

  if (known && status === "provisional") {
    errors.push(
      `${label}.semanticClassStatus should not be 'provisional' for known class '${item.semanticClass}'.`
    );
  }

  if (!known) {
    if (status !== "provisional") {
      errors.push(
        `${label}.semanticClass '${item.semanticClass}' is unknown; set semanticClassStatus to 'provisional'.`
      );
    }
    if (typeof item.semanticClassNotes !== "string" || !item.semanticClassNotes.trim()) {
      errors.push(
        `${label}.semanticClassNotes must be provided for provisional semantic classes.`
      );
    }
  } else if (
    item.semanticClassNotes !== undefined &&
    (typeof item.semanticClassNotes !== "string" || !item.semanticClassNotes.trim())
  ) {
    errors.push(`${label}.semanticClassNotes must be a non-empty string when present.`);
  }
}

function validateVocabItem(errors, filePath, item, index, inferredMeta) {
  const label = `${filePath}: vocab[${index}]`;
  if (!isObject(item)) {
    errors.push(`${label} must be an object.`);
    return;
  }

  assertString(errors, `${label}.id`, item.id);
  assertString(errors, `${label}.base`, item.base);
  assertString(errors, `${label}.en`, item.en);
  assertString(errors, `${label}.level`, item.level);
  assertString(errors, `${label}.dialect`, item.dialect);
  assertPositiveInt(errors, `${label}.unit`, item.unit);

  if (!ALLOWED_TYPES.has(item.type)) {
    errors.push(`${label}.type '${item.type}' is invalid.`);
  }

  if (!ALLOWED_LEVELS.has(item.level)) {
    errors.push(`${label}.level '${item.level}' is invalid.`);
  }

  if (!ALLOWED_DIALECTS.has(item.dialect)) {
    errors.push(`${label}.dialect '${item.dialect}' is invalid.`);
  }

  if (item.gender !== undefined && !ALLOWED_GENDER.has(item.gender)) {
    errors.push(`${label}.gender '${item.gender}' is invalid.`);
  }

  if (item.countability !== undefined && !ALLOWED_COUNTABILITY.has(item.countability)) {
    errors.push(`${label}.countability '${item.countability}' is invalid.`);
  }

  if (
    item.articleBehaviour !== undefined &&
    !ALLOWED_ARTICLE_BEHAVIOUR.has(item.articleBehaviour)
  ) {
    errors.push(`${label}.articleBehaviour '${item.articleBehaviour}' is invalid.`);
  }

  if (item.placePrep !== undefined) {
    if (!isObject(item.placePrep)) {
      errors.push(`${label}.placePrep must be an object.`);
    } else {
      if (!ALLOWED_PLACE_PREP.has(item.placePrep.yn)) {
        errors.push(`${label}.placePrep.yn '${item.placePrep.yn}' is invalid.`);
      }
      if (!ALLOWED_PLACE_PREP.has(item.placePrep.i)) {
        errors.push(`${label}.placePrep.i '${item.placePrep.i}' is invalid.`);
      }
    }
  }

  if (item.tags !== undefined) {
    if (!Array.isArray(item.tags) || item.tags.some((tag) => typeof tag !== "string")) {
      errors.push(`${label}.tags must be an array of strings when present.`);
    }
  }

  validateSemanticClass(errors, label, item);

  validateEvidenceRefs(errors, `${label}.evidenceRefs`, item.evidenceRefs);

  if (inferredMeta) {
    if (canonical(item.level) !== canonical(inferredMeta.level)) {
      errors.push(`${label}.level must match unit path level '${inferredMeta.level}'.`);
    }
    if (canonical(item.dialect) !== canonical(inferredMeta.dialect)) {
      errors.push(`${label}.dialect must match unit path dialect '${inferredMeta.dialect}'.`);
    }
    if (item.unit !== inferredMeta.unit) {
      errors.push(`${label}.unit must match unit path unit '${inferredMeta.unit}'.`);
    }
  }
}

function validatePatternItem(errors, filePath, item, index, inferredMeta) {
  const label = `${filePath}: patterns[${index}]`;
  if (!isObject(item)) {
    errors.push(`${label} must be an object.`);
    return;
  }

  assertString(errors, `${label}.id`, item.id);
  assertString(errors, `${label}.course`, item.course);
  assertPositiveInt(errors, `${label}.unit`, item.unit);
  assertString(errors, `${label}.name`, item.name);
  assertString(errors, `${label}.focus`, item.focus);

  if (!ALLOWED_MUTATIONS.has(item.mutation)) {
    errors.push(`${label}.mutation '${item.mutation}' is invalid.`);
  }

  if (!ALLOWED_LEVELS.has(item.course)) {
    errors.push(`${label}.course '${item.course}' is invalid.`);
  }

  if (!ALLOWED_FOCUS.has(item.focus)) {
    errors.push(`${label}.focus '${item.focus}' is invalid.`);
  }

  if (item.focus === "contrast-none" && item.mutation !== "none") {
    errors.push(`${label}.focus 'contrast-none' requires mutation 'none'.`);
  }

  if (item.mutation === "none") {
    if (item.ruleId === "none") {
      if (item.explanationOverride === undefined) {
        errors.push(
          `${label}.ruleId 'none' requires explanationOverride. Prefer a specific none-* ruleId from src/data/rules.js.`
        );
      }
    } else {
      if (!GRAMMAR_RULES[item.ruleId]) {
        errors.push(`${label}.ruleId '${item.ruleId}' not found in src/data/rules.js.`);
      } else if (!String(item.ruleId).startsWith("none-")) {
        errors.push(
          `${label}.ruleId '${item.ruleId}' must start with 'none-' when mutation is 'none'.`
        );
      }
    }
  } else if (!GRAMMAR_RULES[item.ruleId]) {
    errors.push(`${label}.ruleId '${item.ruleId}' not found in src/data/rules.js.`);
  }

  if (!Array.isArray(item.templates) || item.templates.length === 0) {
    errors.push(`${label}.templates must be a non-empty array.`);
  } else {
    item.templates.forEach((template, templateIndex) => {
      const tLabel = `${label}.templates[${templateIndex}]`;
      if (!isObject(template)) {
        errors.push(`${tLabel} must be an object.`);
        return;
      }

      assertString(errors, `${tLabel}.cy`, template.cy);
      assertString(errors, `${tLabel}.en`, template.en);
      assertString(errors, `${tLabel}.slot`, template.slot);

      const contractionIssues = findUncontractedPrepositionArticle(template.cy);
      contractionIssues.forEach((issue) => {
        errors.push(
          `${tLabel}.cy contains uncontracted phrase '${issue.phrase}'. ${issue.suggestion}`
        );
      });

      const cySlots = extractSlots(template.cy);
      const enSlots = extractSlots(template.en);
      if (cySlots.length !== 1) {
        errors.push(`${tLabel}.cy must contain exactly one slot token.`);
      }
      if (enSlots.length !== 1) {
        errors.push(`${tLabel}.en must contain exactly one slot token.`);
      }
      if (cySlots.length === 1 && template.slot !== cySlots[0]) {
        errors.push(`${tLabel}.slot must match cy slot token.`);
      }
      if (enSlots.length === 1 && template.slot !== enSlots[0]) {
        errors.push(`${tLabel}.slot must match en slot token.`);
      }
      if (!isObject(item.constraints) || !item.constraints[template.slot]) {
        errors.push(`${label}.constraints missing key for slot '${template.slot}'.`);
      }
    });
  }

  if (!isObject(item.constraints)) {
    errors.push(`${label}.constraints must be an object.`);
  } else {
    Object.entries(item.constraints).forEach(([slot, constraint]) => {
      validateConstraint(errors, `${label}.constraints.${slot}`, constraint);
    });
  }

  if (item.explanationOverride !== undefined) {
    if (!isObject(item.explanationOverride)) {
      errors.push(`${label}.explanationOverride must be an object when present.`);
    } else {
      assertString(errors, `${label}.explanationOverride.en`, item.explanationOverride.en);
      assertString(errors, `${label}.explanationOverride.cy`, item.explanationOverride.cy);
    }
  }

  if (item.notes !== undefined && typeof item.notes !== "string") {
    errors.push(`${label}.notes must be a string when present.`);
  }

  validateSemanticClass(errors, label, item);

  if (item.cardLimit !== undefined) {
    assertPositiveInt(errors, `${label}.cardLimit`, item.cardLimit);
  }

  validateEvidenceRefs(errors, `${label}.evidenceRefs`, item.evidenceRefs);

  if (inferredMeta) {
    if (canonical(item.course) !== canonical(inferredMeta.level)) {
      errors.push(`${label}.course must match unit path level '${inferredMeta.level}'.`);
    }
    if (item.unit !== inferredMeta.unit) {
      errors.push(`${label}.unit must match unit path unit '${inferredMeta.unit}'.`);
    }
  }
}

function validateRuleProposalItem(errors, filePath, item, index, inferredMeta) {
  const label = `${filePath}: ruleProposals[${index}]`;
  if (!isObject(item)) {
    errors.push(`${label} must be an object.`);
    return;
  }

  assertString(errors, `${label}.id`, item.id);
  assertString(errors, `${label}.proposedRuleId`, item.proposedRuleId);
  assertString(errors, `${label}.triggerContext`, item.triggerContext);
  assertString(errors, `${label}.en`, item.en);
  assertString(errors, `${label}.cy`, item.cy);
  assertString(errors, `${label}.rationale`, item.rationale);
  assertString(errors, `${label}.course`, item.course);
  assertPositiveInt(errors, `${label}.unit`, item.unit);
  assertString(errors, `${label}.status`, item.status);

  if (!ALLOWED_MUTATIONS.has(item.mutation)) {
    errors.push(`${label}.mutation '${item.mutation}' is invalid.`);
  }
  if (item.mutation === "none") {
    errors.push(`${label}.mutation should be soft|nasal|aspirate for new rule proposals.`);
  }
  if (!ALLOWED_LEVELS.has(item.course)) {
    errors.push(`${label}.course '${item.course}' is invalid.`);
  }
  if (!ALLOWED_RULE_PROPOSAL_STATUS.has(item.status)) {
    errors.push(`${label}.status '${item.status}' is invalid.`);
  }

  validateEvidenceRefs(errors, `${label}.evidenceRefs`, item.evidenceRefs);

  if (inferredMeta) {
    if (canonical(item.course) !== canonical(inferredMeta.level)) {
      errors.push(`${label}.course must match unit path level '${inferredMeta.level}'.`);
    }
    if (item.unit !== inferredMeta.unit) {
      errors.push(`${label}.unit must match unit path unit '${inferredMeta.unit}'.`);
    }
  }
}

function hasDuplicateIds(items) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of items) {
    const id = String(item?.id ?? "").trim();
    if (!id) continue;
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return Array.from(duplicates.values()).sort();
}

export function validateUnitModuleExports(moduleExports, filePath) {
  const errors = [];
  const inferred = inferUnitMetaFromPath(filePath);

  const exportNames = Object.keys(moduleExports || {});
  const vocabExports = exportNames.filter((name) => /^u\d+_vocab$/.test(name));
  const patternExports = exportNames.filter((name) => /^u\d+_patterns$/.test(name));
  const proposalExports = exportNames.filter((name) => /^u\d+_ruleProposals$/.test(name));

  if (vocabExports.length !== 1) {
    errors.push(`${filePath}: expected exactly one u<N>_vocab export.`);
  }
  if (patternExports.length !== 1) {
    errors.push(`${filePath}: expected exactly one u<N>_patterns export.`);
  }
  if (proposalExports.length > 1) {
    errors.push(`${filePath}: expected at most one u<N>_ruleProposals export.`);
  }

  const vocabName = vocabExports[0];
  const patternName = patternExports[0];
  const proposalName = proposalExports[0];
  const vocab = moduleExports[vocabName];
  const patterns = moduleExports[patternName];
  const proposals = proposalName ? moduleExports[proposalName] : [];

  if (!Array.isArray(vocab)) {
    errors.push(`${filePath}: ${vocabName || "u<N>_vocab"} must be an array.`);
  } else {
    vocab.forEach((item, index) => validateVocabItem(errors, filePath, item, index, inferred));
    const duplicates = hasDuplicateIds(vocab);
    duplicates.forEach((id) => errors.push(`${filePath}: duplicate vocab id '${id}'.`));
  }

  if (!Array.isArray(patterns)) {
    errors.push(`${filePath}: ${patternName || "u<N>_patterns"} must be an array.`);
  } else {
    patterns.forEach((item, index) =>
      validatePatternItem(errors, filePath, item, index, inferred)
    );
    const duplicates = hasDuplicateIds(patterns);
    duplicates.forEach((id) => errors.push(`${filePath}: duplicate pattern id '${id}'.`));
  }

  if (proposalName !== undefined) {
    if (!Array.isArray(proposals)) {
      errors.push(`${filePath}: ${proposalName} must be an array.`);
    } else {
      proposals.forEach((item, index) =>
        validateRuleProposalItem(errors, filePath, item, index, inferred)
      );
      const duplicates = hasDuplicateIds(proposals);
      duplicates.forEach((id) => errors.push(`${filePath}: duplicate rule proposal id '${id}'.`));
    }
  }

  if (Array.isArray(vocab) && Array.isArray(patterns)) {
    patterns.forEach((pattern, pIndex) => {
      if (!Array.isArray(pattern.templates)) return;
      pattern.templates.forEach((template, tIndex) => {
        const slot = template?.slot;
        if (!slot || !isObject(pattern.constraints) || !pattern.constraints[slot]) return;
        const constraint = pattern.constraints[slot];
        const candidateCount = vocab.filter((item) => matchesConstraints(item, constraint)).length;
        if (candidateCount === 0) {
          errors.push(
            `${filePath}: patterns[${pIndex}].templates[${tIndex}] slot '${slot}' has zero matching vocab candidates.`
          );
        }
      });
    });
  }

  return { errors, inferred, vocabName, patternName, proposalName };
}

function constraintMatchesValue(expected, actual) {
  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }
  return expected === actual;
}

export function matchesConstraints(item, constraint) {
  if (!isObject(constraint)) return false;
  return Object.entries(constraint).every(([key, expected]) => {
    if (key === "tags") {
      if (!Array.isArray(item.tags)) return false;
      const expectedTags = Array.isArray(expected) ? expected : [expected];
      return expectedTags.every((tag) => item.tags.includes(tag));
    }
    return constraintMatchesValue(expected, item[key]);
  });
}

export function expandTemplate(template, slot, value) {
  const token = `{${slot}}`;
  const rawCy = String(template.cy || "");
  const rawEn = String(template.en || "");
  const pieces = rawCy.split(token);
  const cy = rawCy.replace(token, value.base);
  const en = rawEn.replace(token, value.en);
  if (pieces.length === 2) {
    return {
      cy,
      en,
      before: pieces[0],
      after: pieces[1],
    };
  }
  return {
    cy,
    en,
    before: "",
    after: "",
  };
}
