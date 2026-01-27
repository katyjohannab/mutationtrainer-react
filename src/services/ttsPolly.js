// src/services/ttsPolly.js

const POLLY_FUNCTION_URL =
  "https://pl6xqfeht2hhbruzlhm3imcpya0upied.lambda-url.eu-west-2.on.aws/";

// Simple in-memory cache: sentence -> object URL
const ttsCache = new Map();
const MAX_CACHE = 60; // stop unbounded growth

function cacheSet(key, url) {
  if (ttsCache.has(key)) ttsCache.delete(key); // refresh insertion order
  ttsCache.set(key, url);
  while (ttsCache.size > MAX_CACHE) {
    const oldestKey = ttsCache.keys().next().value;
    const oldestUrl = ttsCache.get(oldestKey);
    ttsCache.delete(oldestKey);
    // Revoke to free memory
    try {
      if (oldestUrl && oldestUrl.startsWith("blob:")) URL.revokeObjectURL(oldestUrl);
    } catch {}
  }
}

// Build a clean sentence string: before + answer + after with punctuation spacing fixed.
// Works with canonical keys OR original CSV headers.
export function buildCompleteSentenceFromRow(row) {
  const before = (row?.before ?? row?.Before ?? "").trimEnd();
  const answer = (row?.answer ?? row?.Answer ?? "").trim();
  const after = (row?.after ?? row?.After ?? "").trimStart();

  let s = [before, answer, after].filter(Boolean).join(" ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\s+([,.;:!?])/g, "$1");
  return s;
}

async function toAudioUrlFromResponse(res) {
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  // Lambda returns raw audio
  if (ct.includes("audio") || ct.includes("octet-stream")) {
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }

  // Or Lambda returns JSON
  const j = await res.json();

  if (j.url) return j.url;

  const b64 = j.audioBase64 || j.audioContent;
  if (b64) {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }

  throw new Error("TTS response wasn't audio and didn't include url/audioBase64/audioContent.");
}

export async function playPollySentence(sentence) {
  if (!sentence) throw new Error("No sentence to speak.");
  if (!POLLY_FUNCTION_URL) throw new Error("POLLY_FUNCTION_URL isn't set.");

  const key = sentence.trim();
  const cachedUrl = ttsCache.get(key);
  if (cachedUrl) {
    const audio = new Audio(cachedUrl);
    await audio.play();
    return;
  }

  const res = await fetch(POLLY_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: key }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `TTS failed (${res.status})`);
  }

  const url = await toAudioUrlFromResponse(res);
  cacheSet(key, url);

  const audio = new Audio(url);
  await audio.play();
}
