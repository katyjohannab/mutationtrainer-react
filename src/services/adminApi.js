function parseJsonSafely(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function getAdminApiCandidates(path) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const baseUrl = String(import.meta.env.BASE_URL || "/");
  const basePrefix = baseUrl.replace(/\/+$/, "");

  const preferred = `${basePrefix || ""}/api/admin/${cleanPath}`;
  const fallback = `/api/admin/${cleanPath}`;

  if (preferred === fallback) return [fallback];
  return [preferred, fallback];
}

async function requestAdminOnce(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  const contentType = String(res.headers.get("content-type") || "").toLowerCase();

  if (!contentType.includes("application/json")) {
    const error = new Error(
      "Admin API unavailable. Run the app with the Node server (npm run start:prod), not static hosting."
    );
    error.code = "ADMIN_API_UNAVAILABLE";
    error.status = res.status;
    throw error;
  }

  const payload = parseJsonSafely(text);

  if (!res.ok) {
    const message = payload?.error || `Admin API request failed (${res.status}).`;
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function requestAdmin(path, options = {}) {
  const candidates = getAdminApiCandidates(path);
  let lastError = null;

  for (const url of candidates) {
    try {
      return await requestAdminOnce(url, options);
    } catch (error) {
      lastError = error;
      const isRetryablePathError =
        error?.code === "ADMIN_API_UNAVAILABLE" || Number(error?.status) === 404;
      if (!isRetryablePathError) break;
    }
  }

  throw lastError || new Error("Admin API request failed.");
}

export async function getAdminSession() {
  const payload = await requestAdmin("session", { method: "GET" });
  if (typeof payload?.authenticated !== "boolean" || typeof payload?.configured !== "boolean") {
    throw new Error("Admin API unavailable. Check that Node server admin routes are enabled.");
  }
  return payload;
}

export async function loginAdmin(password) {
  return requestAdmin("login", {
    method: "POST",
    body: { password },
  });
}

export async function logoutAdmin() {
  return requestAdmin("logout", { method: "POST" });
}

export async function saveAdminCard({ source, rowIndex, expectedCardId, patch }) {
  return requestAdmin("save-card", {
    method: "POST",
    body: {
      source,
      rowIndex,
      expectedCardId,
      patch,
    },
  });
}
