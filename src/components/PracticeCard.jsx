// src/components/PracticeCard.jsx
import { useEffect, useMemo, useState } from "react";
import { checkAnswer } from "../utils/checkAnswer";
import { useI18n } from "../i18n/I18nContext";
import { playPollyForCard } from "../services/ttsPolly";
import PracticeCardFeedback from "./PracticeCardFeedback";
import PracticeCardFront from "./PracticeCardFront";

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

export default function PracticeCard({ row, onResult }) {
  const { t, lang } = useI18n();

  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [cardState, setCardState] = useState(CARD_STATES.FRONT);
  const [last, setLast] = useState(null);

  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState("");

  const sent = useMemo(() => buildSentence(row), [row]);

  useEffect(() => {
    setGuess("");
    setShowHint(false);
    setCardState(CARD_STATES.FRONT);
    setLast(null);
    setTtsError("");
    setTtsLoading(false);
  }, [row]);

  if (!row) return null;

  const answer = row?.answer ?? row?.Answer ?? "";
  const whyEn = row?.why ?? row?.Why ?? "";
  const whyCy = row?.whyCym ?? row?.["Why-Cym"] ?? row?.WhyCym ?? "";
  const translateSent = row?.translateSent ?? row?.TranslateSent ?? "";
  const showTranslate = lang === "en" && Boolean(translateSent);

  const tooltipTranslate = row?.translate ?? row?.Translate ?? "";
  const wordCategory = row?.wordCategory ?? row?.WordCategory ?? "";

  const firstLetter = (String(answer).trim()[0] || "").toUpperCase();
  const hintText = firstLetter ? `${t("hint") || "Hint"}: ${firstLetter}...` : "";

  const isFeedback = cardState === CARD_STATES.FEEDBACK;
  const disabledInput = isFeedback;

  const goNext = () => {
    onResult?.({ result: "next" });
  };

  const onCheck = () => {
    if (isFeedback) {
      goNext();
      return;
    }

    const ok = checkAnswer(row, guess);
    const result = ok ? "correct" : "wrong";

    setCardState(CARD_STATES.FEEDBACK);
    setLast(result);
    onResult?.({ result, guess, expected: answer });
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

  const hearLabel = (t("hear") || "Hear").trim();
  const loadingLabel = (t("loading") || "Loading...").trim();
  const placeholder = t("placeholderType") || "Type the mutated form...";

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        backgroundColor: "#ffffff",
        color: "#111",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
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
      />

      {isFeedback ? (
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
        />
      ) : null}
    </div>
  );
}
