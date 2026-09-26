import { requireValidSource, duplicateIdDiagnostics, ContentValidationError } from "./cardFormat.js";

export async function sourceRevision(text) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

export async function loadCsvFromPublicData(filename) {
  const base = import.meta.env.BASE_URL || "/";
  const url = `${base.endsWith("/") ? base : `${base}/`}data/${filename}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new ContentValidationError([{ source: filename, code: "fetch", message: `Unable to load source (HTTP ${res.status}).` }]);
  // Keep an optional UTF-8 BOM in the revision: Response.text() strips it.
  const text = res.arrayBuffer ? new TextDecoder("utf-8", { ignoreBOM: true }).decode(await res.arrayBuffer()) : await res.text();
  const parsed = requireValidSource(text, filename);
  const revision = globalThis.crypto?.subtle ? await sourceRevision(text) : "";
  return parsed.cards.map(card => ({ ...card, __sourceRevision: revision }));
}

export async function loadManyCsvFiles(filenames) {
  const chunks = await Promise.all(filenames.map(loadCsvFromPublicData));
  const cards = chunks.flat();
  const errors = duplicateIdDiagnostics(cards);
  if (errors.length) throw new ContentValidationError(errors);
  return cards;
}
