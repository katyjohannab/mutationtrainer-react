// src/components/PracticeCard.jsx
import { useEffect, useMemo, useState } from "react";
import { checkAnswer } from "../utils/checkAnswer";
import { useI18n } from "../i18n/I18nContext";
import { playPollyForCard } from "../services/ttsPolly";
import PracticeCardFeedback from "./PracticeCardFeedback";
import PracticeCardFront from "./PracticeCardFront";
import PracticeCardChoices from "./PracticeCardChoices";
import { cn } from "../lib/cn";
import { Card } from "./ui/card";

function buildSentence(row) {
  const before = row?.before ?? row?.Before ?? "";
  const after = row?.after ?? row?.After ?? "";
  const base = row?.base ?? row?.Base ?? "";
  return { before, after, base };
}

const CARD_STATES = {
  FRONT: "front",
  FEEDBACK: "feedback",
};

function normalizeChoice(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getAnswerValue(row) {
  return String(row?.answer ?? row?.Answer ?? "").trim();
}

function getGroupKey(row) {
  const candidates = [
    row?.family ?? row?.Family,
    row?.category ?? row?.Category,
    row?.outcome ?? row?.Outcome,
    row?.trigger ?? row?.Trigger,
    row?.wordCategory ?? row?.WordCategory,
  ];
  for (const value of candidates) {
    const cleaned = String(value ?? "").trim();
    if (cleaned) return cleaned;
  }
  return "";
}

function normalizeBase(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function splitFirstWord(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return ["", ""];
  const match = trimmed.match(/^(\S+)([\s\S]*)$/);
  if (!match) return [trimmed, ""];
  return [match[1], match[2] || ""];
}

function applyCase(original, mutated) {
  if (!original || !mutated) return mutated;
  if (original[0] === original[0].toUpperCase()) {
    return mutated[0].toUpperCase() + mutated.slice(1);
  }
  return mutated;
}

function mutateWord(base, kind) {
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

function applyMutation(base, kind) {
  const [first, rest] = splitFirstWord(base);
  if (!first) return "";
  const mutatedFirst = mutateWord(first, kind);
  return `${mutatedFirst}${rest}`;
}

function shuffleArray(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickUniqueAnswers(rows, excludeSet, limit) {
  const picks = [];
  for (const row of shuffleArray(rows)) {
    const value = getAnswerValue(row);
    const key = normalizeChoice(value);
    if (!key || excludeSet.has(key)) continue;
    excludeSet.add(key);
    picks.push(value);
    if (picks.length >= limit) break;
  }
  return picks;
}

function applyMutationSequence(base, kinds) {
  if (!Array.isArray(kinds) || kinds.length === 0) return "";
  let current = base;
  for (const kind of kinds) {
    current = applyMutation(current, kind);
  }
  return current;
}

function makeChoices(currentRow, deckRows, sent) {
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

export default function PracticeCard({
  row,
  onResult,
  answerMode = "type",
  deckRows = [],
}) {
  const { t, lang } = useI18n();

  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [cardState, setCardState] = useState(CARD_STATES.FRONT);
  const [last, setLast] = useState(null);

  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState("");

  // Derived state must be defined before effects using it
  const isFeedback = cardState === CARD_STATES.FEEDBACK;
  const answer = row?.answer ?? row?.Answer ?? "";
  const sent = useMemo(() => buildSentence(row), [row]);
  
  // Get card ID for stable dependency
  const cardId = row?.cardId ?? row?.CardId ?? "";

  // Reset when card ID changes (not object reference)
  useEffect(() => {
    setGuess("");
    setShowHint(false);
    setCardState(CARD_STATES.FRONT);
    setLast(null);
    setTtsError("");
    setTtsLoading(false);
  }, [cardId]);

  const goNext = () => {
    onResult?.({ result: "next" });
  };

  const onCheck = (forcedGuess) => {
    if (isFeedback) {
      goNext();
      return;
    }

    const nextGuess = typeof forcedGuess === "string" ? forcedGuess : guess;
    if (typeof forcedGuess === "string") {
      setGuess(forcedGuess);
    }
    const ok = checkAnswer(row, nextGuess);
    const result = ok ? "correct" : "wrong";

    setCardState(CARD_STATES.FEEDBACK);
    setLast(result);
    onResult?.({ result, guess: nextGuess, expected: answer });
  };

  const onReveal = () => {
    if (isFeedback) return;

    setCardState(CARD_STATES.FEEDBACK);
    setLast("revealed");
    onResult?.({ result: "revealed", guess, expected: answer });
  };

  const onSkip = () => {
    if (isFeedback) return;

    setCardState(CARD_STATES.FEEDBACK);
    setLast("skipped");
    onResult?.({ result: "skipped", guess: "", expected: answer });
  };

  const onHear = async () => {
    if (!isFeedback || ttsLoading) return;
    setTtsError("");
    setTtsLoading(true);
    try {
      await playPollyForCard(row, "cy");
    } catch (e) {
      setTtsError(e?.message || "TTS failed.");
    } finally {
      setTtsLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (isFeedback) {
          goNext();
        } else {
          onCheck();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFeedback, guess, row]); // onCheck changes every render, rely on closure or include it.

  if (!row) return null;

  const whyEn = row?.why ?? row?.Why ?? "";
  const whyCy = row?.whyCym ?? row?.["Why-Cym"] ?? row?.WhyCym ?? "";
  const translateSent = row?.translateSent ?? row?.TranslateSent ?? "";
  const showTranslate = lang === "en" && Boolean(translateSent);
  const tooltipTranslate = row?.translate ?? row?.Translate ?? "";
  const wordCategory = row?.wordCategory ?? row?.WordCategory ?? "";
  const firstLetter = (String(answer).trim()[0] || "").toUpperCase();
  const hintText = firstLetter ? `${t("hint") || "Hint"}: ${firstLetter}...` : "";
  const disabledInput = isFeedback;

  const hearLabel = (t("hear") || "Hear").trim();
  const loadingLabel = (t("loading") || "Loading...").trim();
  const placeholder = t("placeholderType") || "Type the mutated form...";
  const instructionText = `${t("inputMode") || "Answer mode"}: ${
    answerMode === "tap" ? t("tapMode") || "Tap" : t("typeMode") || "Type"
  }`;

  const choiceKey = `${row?.cardId ?? row?.CardId ?? ""}|${answer}|${
    Array.isArray(deckRows) ? deckRows.length : 0
  }`;
  const choices = useMemo(() => {
    if (!sent) return [];
    return makeChoices(row, deckRows, sent);
  }, [choiceKey, row, deckRows, sent]);

  const cardClassName = cn(
    "surface-card-elev w-full max-w-full rounded-[var(--radius)] shadow-md"
  );

  return (
    <div className="relative w-full max-w-full">
      {!isFeedback && (
        <Card className={cardClassName}>
          <div className="p-6 sm:p-8">
            {answerMode === "tap" ? (
              <PracticeCardChoices
                sent={sent}
                answer={answer}
                cardState={cardState}
                choices={choices}
                disabled={disabledInput}
                showTranslate={showTranslate}
                translate={translateSent}
                hintText={hintText}
                showHint={showHint}
                onToggleHint={() => setShowHint((s) => !s)}
                onPick={(option) => onCheck(option)}
                onCheck={onCheck}
                onReveal={onReveal}
                onSkip={onSkip}
                onNext={goNext}
                t={t}
                tooltipTranslate={tooltipTranslate}
                tooltipWordCategory={wordCategory}
                instructionText={instructionText}
                guess={guess}
              />
            ) : (
              <PracticeCardFront
                sent={sent}
                answer={answer}
                cardState={cardState}
                guess={guess}
                setGuess={setGuess}
                disabledInput={disabledInput}
                showTranslate={showTranslate}
                translate={translateSent}
                placeholder={placeholder}
                hintText={hintText}
                showHint={showHint}
                onToggleHint={() => setShowHint((s) => !s)}
                onCheck={onCheck}
                onReveal={onReveal}
                onSkip={onSkip}
                onNext={goNext}
                t={t}
                tooltipTranslate={tooltipTranslate}
                tooltipWordCategory={wordCategory}
                instructionText={instructionText}
              />
            )}
          </div>
        </Card>
      )}

      {isFeedback && (
        <div className="practice-card-reveal">
          <Card className={cardClassName}>
            <div className="p-6 sm:p-8">
              <PracticeCardFeedback
                sent={sent}
                answer={answer}
                onHear={onHear}
                t={t}
                hearLabel={hearLabel}
                loadingLabel={loadingLabel}
                ttsLoading={ttsLoading}
                ttsError={ttsError}
                last={last}
                whyEn={whyEn}
                whyCy={whyCy}
                lang={lang}
                onNext={goNext}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
