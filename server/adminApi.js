import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { ALL_RUNTIME_DATA_FILES } from "../src/data/csvSources.js";
import {
  ADMIN_EDITABLE_FIELDS,
  buildCanonicalHeaderMap,
  getMappedKeyFromHeader,
  normalizeOutcomeValue,
  toOutcomeCode,
} from "../src/services/csvFieldMap.js";
import { mutateWord } from "../src/utils/grammar.js";

const SESSION_COOKIE = "wm_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 1024 * 1024;

const adminSessions = new Map();
const allowedSources = new Set(ALL_RUNTIME_DATA_FILES.map((entry) => normalizeSource(entry)));

function normalizeSource(source) {
  return String(source || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
}

function fallbackCardId(source, rowIndex) {
  const sourceKey = normalizeSource(source)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${sourceKey || "csv"}-r${rowIndex + 2}`;
}

function parseCookies(cookieHeader) {
  const out = {};
  const raw = String(cookieHeader || "");
  if (!raw) return out;

  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    out[key] = decodeURIComponent(rest.join("=") || "");
  }
  return out;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, record] of adminSessions.entries()) {
    if (!record || record.expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(text));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", (error) => reject(error));
  });
}

function getConfiguredPassword() {
  return String(process.env.WM_ADMIN_PASSWORD || "").trim();
}

function buildCookieValue(token, req, maxAgeSec) {
  const proto = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  const secure = proto === "https" || process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function clearCookieValue(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  const secure = proto === "https" || process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE] || "";
}

function isAuthenticated(req) {
  cleanupExpiredSessions();
  const token = getSessionToken(req);
  if (!token) return false;
  const record = adminSessions.get(token);
  if (!record) return false;
  if (record.expiresAt <= Date.now()) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

function normalizeCardId(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getCanonicalValue(row, canonicalToHeader, key) {
  const header = canonicalToHeader.get(key);
  if (!header) return "";
  return String(row[header] ?? "").trim();
}

function splitSentenceWithGap(sentenceWithGap) {
  const markerRegex = /\[\s*\]/;
  const sentence = String(sentenceWithGap ?? "");
  if (!sentence) return { before: "", after: "" };

  const markerMatch = sentence.match(markerRegex);
  if (!markerMatch) {
    return { before: sentence.trim(), after: "" };
  }

  const markerIndex = markerMatch.index || 0;
  const markerText = markerMatch[0];
  const before = sentence.slice(0, markerIndex).replace(/\s+$/, "");
  const after = sentence.slice(markerIndex + markerText.length).replace(/^\s+/, "");
  return { before, after };
}

function buildSentenceWithGap(before, after) {
  const left = String(before ?? "").trim();
  const right = String(after ?? "").trim();
  if (!left && !right) return "[ ]";
  if (!right) return `${left} [ ]`;
  if (!left) return `[ ] ${right}`;
  return `${left} [ ] ${right}`;
}

function sanitizePatch(rawPatch) {
  const out = {};
  if (!rawPatch || typeof rawPatch !== "object") return out;

  for (const field of ADMIN_EDITABLE_FIELDS) {
    if (!(field in rawPatch)) continue;
    const value = rawPatch[field];
    out[field] = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  }

  if (out.outcome) {
    out.outcome = normalizeOutcomeValue(out.outcome);
  }

  return out;
}

function normalizeSavedRow(row, source, rowIndex) {
  const out = {
    __source: source,
    __rowIndex: rowIndex,
    __fileType: source.toLowerCase().endsWith(".tsv") ? "tsv" : "csv",
  };

  for (const [header, value] of Object.entries(row || {})) {
    const cleanVal = typeof value === "string" ? value.trim() : value;
    const mapped = getMappedKeyFromHeader(header);
    if (mapped && cleanVal !== "") out[mapped] = cleanVal;
  }

  if (out.outcome) out.outcome = normalizeOutcomeValue(out.outcome);

  if (out.sentenceWithGap && !out.before && !out.after) {
    const { before, after } = splitSentenceWithGap(out.sentenceWithGap);
    out.before = before;
    out.after = after;
    out.sentenceWithGap = `${before}${after ? ` ${after}` : ""}`;
  }

  if (!out.answer && out.base && out.outcome) {
    out.answer = mutateWord(out.base, out.outcome);
  }

  if (!out.cardId) out.cardId = fallbackCardId(source, rowIndex);

  return out;
}

export function applyPatchToParsedRow({ row, canonicalToHeader, patch }) {
  const setByCanonical = (canonicalKey, value) => {
    const header = canonicalToHeader.get(canonicalKey);
    if (!header) return false;
    row[header] = value;
    return true;
  };

  const getBeforeAfterFallback = () => {
    const before = getCanonicalValue(row, canonicalToHeader, "before");
    const after = getCanonicalValue(row, canonicalToHeader, "after");

    if (before || after) return { before, after };

    const sentenceWithGapHeader = canonicalToHeader.get("sentenceWithGap");
    if (!sentenceWithGapHeader) return { before: "", after: "" };

    return splitSentenceWithGap(row[sentenceWithGapHeader]);
  };

  const hasBeforePatch = Object.prototype.hasOwnProperty.call(patch, "before");
  const hasAfterPatch = Object.prototype.hasOwnProperty.call(patch, "after");

  if (hasBeforePatch || hasAfterPatch) {
    const current = getBeforeAfterFallback();
    const nextBefore = hasBeforePatch ? patch.before : current.before;
    const nextAfter = hasAfterPatch ? patch.after : current.after;

    const wroteBefore = setByCanonical("before", nextBefore);
    const wroteAfter = setByCanonical("after", nextAfter);

    if (!wroteBefore || !wroteAfter) {
      const sentenceWithGapHeader = canonicalToHeader.get("sentenceWithGap");
      if (sentenceWithGapHeader) {
        row[sentenceWithGapHeader] = buildSentenceWithGap(nextBefore, nextAfter);
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(patch, "base")) {
    setByCanonical("base", patch.base);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "answer")) {
    setByCanonical("answer", patch.answer);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "outcome")) {
    setByCanonical("outcome", toOutcomeCode(patch.outcome));
  }
  if (Object.prototype.hasOwnProperty.call(patch, "trigger")) {
    setByCanonical("trigger", patch.trigger);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "category")) {
    setByCanonical("category", patch.category);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "translate")) {
    setByCanonical("translate", patch.translate);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "translateSent")) {
    setByCanonical("translateSent", patch.translateSent);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "why")) {
    setByCanonical("why", patch.why);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "whyCym")) {
    setByCanonical("whyCym", patch.whyCym);
  }
}

export async function saveCardPatch({
  rootDir,
  source,
  rowIndex,
  expectedCardId,
  rawPatch,
}) {
  const normalizedSource = normalizeSource(source);
  if (!allowedSources.has(normalizedSource)) {
    throw Object.assign(new Error("Unsupported source file."), { statusCode: 400 });
  }

  if (!Number.isInteger(rowIndex) || rowIndex < 0) {
    throw Object.assign(new Error("rowIndex must be a non-negative integer."), { statusCode: 400 });
  }

  const sourcePath = path.resolve(rootDir, "public", "data", normalizedSource);
  const dataRoot = path.resolve(rootDir, "public", "data");

  if (!sourcePath.startsWith(dataRoot)) {
    throw Object.assign(new Error("Invalid source path."), { statusCode: 400 });
  }

  const raw = await fs.readFile(sourcePath, "utf8");
  const delimiter = normalizedSource.toLowerCase().endsWith(".tsv") ? "\t" : ",";
  const newline = raw.includes("\r\n") ? "\r\n" : "\n";

  const parsed = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });

  if (parsed.errors?.length) {
    throw Object.assign(new Error(`Source parse failed: ${parsed.errors[0].message}`), { statusCode: 500 });
  }

  const rows = parsed.data || [];
  const headers = parsed.meta?.fields || Object.keys(rows[0] || {});

  if (!headers.length || !rows.length) {
    throw Object.assign(new Error("Source file has no editable rows."), { statusCode: 400 });
  }

  if (rowIndex >= rows.length) {
    throw Object.assign(new Error("rowIndex is out of range for source file."), { statusCode: 400 });
  }

  const targetRow = rows[rowIndex];
  const canonicalToHeader = buildCanonicalHeaderMap(headers);
  const sourceCardId =
    getCanonicalValue(targetRow, canonicalToHeader, "cardId") || fallbackCardId(normalizedSource, rowIndex);

  if (expectedCardId && normalizeCardId(sourceCardId) !== normalizeCardId(expectedCardId)) {
    throw Object.assign(new Error("Card mismatch. Source row no longer matches expected card."), {
      statusCode: 409,
    });
  }

  const patch = sanitizePatch(rawPatch);
  applyPatchToParsedRow({ row: targetRow, canonicalToHeader, patch });

  const output = Papa.unparse(
    {
      fields: headers,
      data: rows,
    },
    {
      delimiter,
      newline,
    }
  );

  await fs.writeFile(sourcePath, output, "utf8");

  return {
    source: normalizedSource,
    rowIndex,
    updatedRow: normalizeSavedRow(targetRow, normalizedSource, rowIndex),
  };
}

export function createAdminApiMiddleware({ rootDir }) {
  const root = rootDir || process.cwd();

  return async function adminApiMiddleware(req, res, next) {
    const url = new URL(req.url || "/", "http://localhost");
    if (!url.pathname.startsWith("/api/admin")) {
      next();
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/session") {
      sendJson(res, 200, {
        authenticated: isAuthenticated(req),
        configured: Boolean(getConfiguredPassword()),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/login") {
      const configuredPassword = getConfiguredPassword();
      if (!configuredPassword) {
        sendJson(res, 503, {
          error: "Admin password is not configured on this server.",
          configured: false,
        });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const provided = String(body?.password || "");
        if (!provided || provided !== configuredPassword) {
          sendJson(res, 401, { error: "Invalid password." });
          return;
        }

        const token = crypto.randomBytes(32).toString("hex");
        adminSessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS });
        res.setHeader("Set-Cookie", buildCookieValue(token, req, SESSION_TTL_MS / 1000));
        sendJson(res, 200, { authenticated: true });
        return;
      } catch (error) {
        sendJson(res, 400, { error: error.message || "Unable to process login." });
        return;
      }
    }

    if (req.method === "POST" && url.pathname === "/api/admin/logout") {
      const token = getSessionToken(req);
      if (token) adminSessions.delete(token);
      res.setHeader("Set-Cookie", clearCookieValue(req));
      sendJson(res, 200, { authenticated: false });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/save-card") {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin authentication required." });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const result = await saveCardPatch({
          rootDir: root,
          source: body?.source,
          rowIndex: body?.rowIndex,
          expectedCardId: body?.expectedCardId,
          rawPatch: body?.patch,
        });
        sendJson(res, 200, result);
        return;
      } catch (error) {
        const statusCode = Number(error?.statusCode) || 500;
        sendJson(res, statusCode, {
          error: error?.message || "Failed to save card changes.",
        });
        return;
      }
    }

    sendJson(res, 404, { error: "Not found." });
  };
}


