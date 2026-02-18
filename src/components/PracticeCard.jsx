// src/components/PracticeCard.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { checkAnswer } from "../utils/checkAnswer";
import { useI18n } from "../i18n/I18nContext";
import { playPollyForCard } from "../services/ttsPolly";
import PracticeCardFeedback from "./PracticeCardFeedback";
import PracticeCardFront from "./PracticeCardFront";
import PracticeCardChoices from "./PracticeCardChoices";
import { cn } from "../lib/cn";
import { Card } from "./ui/card";
import { makeChoices } from "../utils/grammar";

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

export default function PracticeCard({
  row,
  onResult,
  mode = "random",
  answerMode = "type",
  deckRows = [],
  onShuffle,
  showDysguBadges = false,
}) {
  const { t, lang } = useI18n();

  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [cardState, setCardState] = useState(CARD_STATES.FRONT);
  const [last, setLast] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [pendingReviewId, setPendingReviewId] = useState(null);

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
    setPendingResult(null);
    setPendingReviewId(null);
    setTtsError("");
    setTtsLoading(false);
  }, [cardId]);

  const goNext = useCallback(() => {
    if (mode === "smart") {
      onResult?.({
        result: "next",
        baseResult: pendingResult,
        reviewId: pendingReviewId,
      });
      return;
    }
    onResult?.({ result: "next" });
  }, [mode, onResult, pendingResult, pendingReviewId]);

  const onCheck = useCallback(
    (forcedGuess) => {
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
      if (mode === "smart") {
        setPendingResult(result);
        setPendingReviewId(`${cardId}-${Date.now()}`);
        return;
      }
      onResult?.({ result, guess: nextGuess, expected: answer });
    },
    [answer, cardId, goNext, guess, isFeedback, mode, onResult, row]
  );

  const onReveal = () => {
    if (isFeedback) return;

    setCardState(CARD_STATES.FEEDBACK);
    setLast("revealed");
    if (mode === "smart") {
      setPendingResult("revealed");
      setPendingReviewId(`${cardId}-${Date.now()}`);
      return;
    }
    onResult?.({ result: "revealed", guess, expected: answer });
  };

  const onSkip = () => {
    if (isFeedback) return;
    if (mode === "smart") {
      onResult?.({ result: "skipped" });
      return;
    }
    onResult?.({ result: "skipped", guess: "", expected: answer });
  };

  const onHear = useCallback(async () => {
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
  }, [isFeedback, row, ttsLoading]);

  const handleSmartResult = useCallback(
    (result) => {
      if (mode !== "smart" || !isFeedback || !onResult) return;
      onResult({
        result,
        baseResult: pendingResult,
        reviewId: pendingReviewId,
      });
    },
    [isFeedback, mode, onResult, pendingResult, pendingReviewId]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (isFeedback && mode === "smart") {
        if (key === "e") {
          e.preventDefault();
          handleSmartResult("easy");
          return;
        }
        if (key === "a") {
          e.preventDefault();
          handleSmartResult("again");
          return;
        }
      }

      if (isFeedback && (key === "h" || key === "p")) {
        e.preventDefault();
        onHear();
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
  }, [goNext, handleSmartResult, isFeedback, mode, onCheck, onHear]);

  const whyEn = row?.why ?? row?.Why ?? "";
  const whyCy = row?.whyCym ?? row?.["Why-Cym"] ?? row?.WhyCym ?? "";
  const translationSentence = row?.translateSent ?? row?.TranslateSent ?? "";
  const translationWord = row?.translate ?? row?.Translate ?? "";
  const translationCategory = row?.wordCategory ?? row?.WordCategory ?? "";
  const firstLetter = (String(answer).trim()[0] || "").toUpperCase();
  const hintText = firstLetter ? `${t("hint") || "Hint"}: ${firstLetter}...` : "";
  const disabledInput = isFeedback;

  const hearLabel = (t("hear") || "Hear").trim();
  const loadingLabel = (t("loading") || "Loading...").trim();
  const placeholder = t("placeholderType") || "Type the mutated form...";

  const choices = useMemo(() => {
    if (!sent) return [];
    return makeChoices(row, deckRows, sent);
  }, [row, deckRows, sent]);

  if (!row) return null;

  const cardClassName = cn(
    "w-full rounded-[var(--radius)] shadow-sm bg-card border border-border"
  );

  return (
    <div className="relative w-full max-w-2xl lg:max-w-3xl mx-auto">
      {!isFeedback && (
        <Card className={cardClassName}>
          <div className="p-5 sm:p-7 md:p-8 lg:p-10">
            {answerMode === "tap" ? (
              <PracticeCardChoices
                sent={sent}
                answer={answer}
                cardState={cardState}
                choices={choices}
                disabled={disabledInput}
                hintText={hintText}
                showHint={showHint}
                onToggleHint={() => setShowHint((s) => !s)}
                onPick={(option) => onCheck(option)}
                onCheck={onCheck}
                onReveal={onReveal}
                onSkip={onSkip}
                onShuffle={onShuffle}
                t={t}
                mode={mode}
                translationWord={translationWord}
                translationCategory={translationCategory}
                guess={guess}
                // New metadata props
                unit={row.unit}
                course={row.course || row.Course}
                level={row.level || row.Level}
                sourceFile={row.__source}
                showDysguBadges={showDysguBadges}
              />
            ) : (
              <PracticeCardFront
                sent={sent}
                cardState={cardState}
                cardId={cardId}
                guess={guess}
                setGuess={setGuess}
                disabledInput={disabledInput}
                placeholder={placeholder}
                hintText={hintText}
                showHint={showHint}
                onToggleHint={() => setShowHint((s) => !s)}
                onCheck={onCheck}
                onReveal={onReveal}
                onSkip={onSkip}
                onShuffle={onShuffle}
                t={t}
                mode={mode}
                translationWord={translationWord}
                translationCategory={translationCategory}
                // New metadata props
                unit={row.unit}
                course={row.course || row.Course}
                level={row.level || row.Level}
                sourceFile={row.__source}
                showDysguBadges={showDysguBadges}
              />
            )}
          </div>
        </Card>
      )}

      {isFeedback && (
        <div className="practice-card-reveal">
          <Card className={cardClassName}>
            <div className="p-5 sm:p-7 md:p-8 lg:p-10">
              <PracticeCardFeedback
                sent={sent}
                answer={answer}
                sentenceTranslation={translationSentence}
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
                onResult={onResult}
                mode={mode}
                pendingResult={pendingResult}
                pendingReviewId={pendingReviewId}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
