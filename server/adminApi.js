import crypto from "node:crypto";
import path from "node:path";
import { normaliseRow, serializeCardSource } from "../src/services/cardFormat.js";
import { updateSource } from "./contentRepository.js";
import { ALL_RUNTIME_DATA_FILES } from "../src/data/csvSources.js";
import {
  ADMIN_EDITABLE_FIELDS,
  buildCanonicalHeaderMap,
  normalizeOutcomeValue,
  toOutcomeCode,
} from "../src/services/csvFieldMap.js";

const SESSION_COOKIE = "wm_admin_session";
const DEFAULT_SESSION_TTL_HOURS = 12;
const MAX_BODY_BYTES = 1024 * 1024;

const adminSessions = new Map();
const allowedSources = new Set(ALL_RUNTIME_DATA_FILES.map((entry) => normalizeSource(entry)));

function normalizeSource(source) {
  return String(source || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
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
  return String(process.env.WM_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "").trim();
}

function getSessionTtlMs() {
  const raw = String(process.env.WM_ADMIN_SESSION_TTL_HOURS || "").trim();
  if (!raw) return DEFAULT_SESSION_TTL_HOURS * 60 * 60 * 1000;

  const hours = Number(raw);
  if (!Number.isFinite(hours) || hours <= 0) {
    return DEFAULT_SESSION_TTL_HOURS * 60 * 60 * 1000;
  }

  const clampedHours = Math.min(168, Math.max(0.25, hours));
  return Math.round(clampedHours * 60 * 60 * 1000);
}

function getForwardedProto(req) {
  const raw = String(req.headers["x-forwarded-proto"] || "").trim().toLowerCase();
  if (!raw) return "";
  return raw
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);
}

function shouldUseSecureCookie(req) {
  const proto = getForwardedProto(req);
  return proto === "https" || process.env.NODE_ENV === "production";
}

function buildCookieValue(token, req, maxAgeSec) {
  const secure = shouldUseSecureCookie(req);
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
  const secure = shouldUseSecureCookie(req);
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

export function mapSaveOperationalError(error, sourcePath, stage) {
  const code = String(error?.code || "").toUpperCase();

  if (code === "ENOENT") {
    return Object.assign(
      new Error(`Source file is missing on server: ${sourcePath}.`),
      { statusCode: 404 }
    );
  }

  if (code === "EACCES" || code === "EPERM" || code === "EROFS") {
    return Object.assign(
      new Error(
        `Server cannot write to ${sourcePath}. Ensure public/data is writable for the service user.`
      ),
      { statusCode: 500 }
    );
  }

  if (code === "ENOSPC") {
    return Object.assign(
      new Error(`Server disk is full while trying to ${stage} ${sourcePath}.`),
      { statusCode: 500 }
    );
  }

  return Object.assign(
    new Error(`Failed to ${stage} source file (${sourcePath}): ${error?.message || "Unknown error"}`),
    { statusCode: 500 }
  );
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

export async function saveCardPatch({ rootDir, dataDir, revisionDir, source, rowIndex, expectedCardId, expectedSourceRevision, rawPatch }) {
  const normalizedSource = normalizeSource(source);
  if (!allowedSources.has(normalizedSource)) throw Object.assign(new Error("Unsupported source file."), { statusCode: 400 });
  if (!Number.isInteger(rowIndex) || rowIndex < 0) throw Object.assign(new Error("rowIndex must be a non-negative integer."), { statusCode: 400 });
  if (!expectedCardId) throw Object.assign(new Error("Expected card ID is required."), { statusCode: 400 });
  try {
    const result = await updateSource({ rootDir, dataDir, revisionDir, source: normalizedSource, expectedSourceRevision }, ({ raw, parsed }) => {
      const targetRow = parsed.rows[rowIndex];
      if (!targetRow) throw Object.assign(new Error("rowIndex is out of range for source file."), { statusCode: 400 });
      const canonicalToHeader = buildCanonicalHeaderMap(parsed.headers);
      const sourceCardId = getCanonicalValue(targetRow, canonicalToHeader, "cardId");
      if (normalizeCardId(sourceCardId) !== normalizeCardId(expectedCardId)) throw Object.assign(new Error("Card mismatch. Source row no longer matches expected card."), { statusCode: 409 });
      const patch = sanitizePatch(rawPatch);
      // Compare against the displayed model, so an unchanged form preserves source whitespace.
      const current = normaliseRow(targetRow, normalizedSource, rowIndex);
      for (const field of Object.keys(patch)) {
        if (String(current[field] ?? "") === patch[field]) delete patch[field];
        else if (!canonicalToHeader.has(field) && !(["before", "after"].includes(field) && canonicalToHeader.has("sentenceWithGap"))) {
          throw Object.assign(new Error("This source has no editable column for " + field + "."), { statusCode: 422 });
        }
      }
      if (!Object.keys(patch).length) return raw;
      applyPatchToParsedRow({ row: targetRow, canonicalToHeader, patch });
      return serializeCardSource(parsed, normalizedSource, raw);
    });
    return { source: normalizedSource, rowIndex, sourceRevision: result.sourceRevision, previousRevision: result.previousRevision, changed: result.changed,
      updatedRow: { ...result.parsed.cards[rowIndex], __sourceRevision: result.sourceRevision } };
  } catch (error) {
    if (error.statusCode) throw error;
    throw mapSaveOperationalError(error, path.join(dataDir || rootDir || ".", normalizedSource), "save");
  }
}

export function createAdminApiMiddleware({ rootDir, dataDir, revisionDir }) {
  const root = rootDir || process.cwd();
  const sessionTtlMs = getSessionTtlMs();

  return async function adminApiMiddleware(req, res, next) {
    const url = new URL(req.url || "/", "http://localhost");
    const pathname = String(url.pathname || "");
    const marker = "/api/admin";
    const markerIndex = pathname.indexOf(marker);

    if (markerIndex < 0) {
      return next();
    }

    const afterMarker = pathname.slice(markerIndex + marker.length);
    if (afterMarker && !afterMarker.startsWith("/")) {
      return next();
    }

    const adminPath = `${marker}${afterMarker}`;

    if (req.method === "GET" && adminPath === "/api/admin/session") {
      sendJson(res, 200, {
        authenticated: isAuthenticated(req),
        configured: Boolean(getConfiguredPassword()),
        sessionTtlHours: Number((sessionTtlMs / (60 * 60 * 1000)).toFixed(2)),
      });
      return;
    }

    if (req.method === "POST" && adminPath === "/api/admin/login") {
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
        adminSessions.set(token, { expiresAt: Date.now() + sessionTtlMs });
        res.setHeader("Set-Cookie", buildCookieValue(token, req, Math.floor(sessionTtlMs / 1000)));
        sendJson(res, 200, { authenticated: true });
        return;
      } catch (error) {
        sendJson(res, 400, { error: error.message || "Unable to process login." });
        return;
      }
    }

    if (req.method === "POST" && adminPath === "/api/admin/logout") {
      const token = getSessionToken(req);
      if (token) adminSessions.delete(token);
      res.setHeader("Set-Cookie", clearCookieValue(req));
      sendJson(res, 200, { authenticated: false });
      return;
    }

    if (req.method === "POST" && adminPath === "/api/admin/save-card") {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin authentication required." });
        return;
      }

      try {
        const body = await parseJsonBody(req);
        const result = await saveCardPatch({
          rootDir: root,
          dataDir,
          revisionDir,
          source: body?.source,
          rowIndex: body?.rowIndex,
          expectedCardId: body?.expectedCardId,
          expectedSourceRevision: body?.expectedSourceRevision,
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
