import axios from 'axios';

const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30_000;

/** User-facing message from a failed API call (axios or network). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. The server or database may be slow—please try again.';
  }

  if (!error.response) {
    return 'Cannot reach the server. Check that the API is running and VITE_API_URL is correct.';
  }

  const { status, data } = error.response;
  const detail = data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const first = detail[0];
    if (typeof first === 'object' && first !== null && 'msg' in first) {
      const entry = first as { loc?: unknown[]; msg?: string };
      const field = Array.isArray(entry.loc)
        ? String(entry.loc[entry.loc.length - 1])
        : 'field';
      return `${field} ${entry.msg ?? 'is invalid'}`;
    }
    return detail.map((item) => String(item)).join(' ');
  }

  if (status === 503) {
    return 'Service temporarily unavailable. The database may be waking up—please try again.';
  }

  if (status === 504) {
    return 'The request took too long. Please try again.';
  }

  return fallback;
}

export { DEFAULT_TIMEOUT_MS };
