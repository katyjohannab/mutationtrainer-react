// src/services/ttsPolly.js
// Fallback to existing Lambda URL for now.
const POLLY_FUNCTION_URL =
  import.meta.env.VITE_POLLY_FUNCTION_URL ||
  "https://pl6xqfeht2hhbruzlhm3imcpya0upied.lambda-url.eu-west-2.on.aws/";

const ttsCache = new Map(); // key: sentence string -> objectURL
let currentAudio = null;

export function buildCompleteSentence(card) {
  const before = String(card?.before ?? card?.Before ?? "").trimEnd();
  const answer = String(card?.answer ?? card?.Answer ?? "").trim();
  const after = String(card?.after ?? card?.After ?? "").trimStart();

  let s = [before, answer, after].filter(Boolean).join(" ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\s+([,.;:!?])/g, "$1");
  return s;
}

function getEnglishText(card) {
  // In your CSVs you already have TranslateSent (EN translation of the full sentence).
  // If it’s missing, we fall back to the Welsh sentence.
  const en = String(card?.translateSent ?? card?.TranslateSent ?? "").trim();
  return en || buildCompleteSentence(card);
}

export function getSpeakText(card, speakLang = "cy") {
  return speakLang === "en" ? getEnglishText(card) : buildCompleteSentence(card);
}

export async function playPollyText(sentence) {
  if (!sentence) throw new Error("No sentence to speak.");
  if (!POLLY_FUNCTION_URL) throw new Error("POLLY_FUNCTION_URL isn't set.");

  // If user taps repeatedly: stop previous audio first
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  const cachedUrl = ttsCache.get(sentence);
  if (cachedUrl) {
    const audio = new Audio(cachedUrl);
    currentAudio = audio;
    await audio.play();
    return;
  }

  const res = await fetch(POLLY_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Keep request shape the same as your old app: { text }
    body: JSON.stringify({ text: sentence }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `TTS failed (${res.status})`);
  }

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  let url = null;

  if (ct.includes("audio") || ct.includes("octet-stream")) {
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: "audio/mpeg" });
    url = URL.createObjectURL(blob);
  } else {
    const j = await res.json();
    if (j.url) url = j.url;
    else if (j.audioBase64 || j.audioContent) {
      const b64 = j.audioBase64 || j.audioContent;
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      url = URL.createObjectURL(blob);
    } else {
      throw new Error("TTS response had no audio payload (url/audioBase64/audioContent).");
    }
  }

  ttsCache.set(sentence, url);
  const audio = new Audio(url);
  currentAudio = audio;
  await audio.play();
}

export async function playPollyForCard(card, speakLang = "cy") {
  const text = getSpeakText(card, speakLang);
  return playPollyText(text);
}
