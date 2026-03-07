function parseJsonSafely(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function requestAdmin(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api/admin/${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
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

export async function getAdminSession() {
  return requestAdmin("session", { method: "GET" });
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
