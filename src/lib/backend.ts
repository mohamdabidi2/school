const FALLBACK_URL = "http://localhost:4000";

function normalizeBaseUrl(raw?: string) {
  if (!raw || raw.trim() === "") {
    return FALLBACK_URL;
  }
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export const backendBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_BACKEND_URL
);

export function buildBackendUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (!path.startsWith("/")) {
    return `${backendBaseUrl}/${path}`;
  }
  return `${backendBaseUrl}${path}`;
}

export function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = buildBackendUrl(path);
  const mergedOptions: RequestInit = {
    credentials: "include",
    ...options,
  };

  // Ensure headers object exists so callers can still override
  const headers = new Headers(options.headers || {});
  if (
    options.body &&
    !headers.has("Content-Type") &&
    typeof options.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }
  mergedOptions.headers = headers;

  return fetch(url, mergedOptions);
}


