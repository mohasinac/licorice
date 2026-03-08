/**
 * Centralized fetch wrapper that automatically shows toast notifications
 * for common API errors (401, 403, 500) using react-hot-toast.
 *
 * Usage:
 *   const data = await apiFetch<MyType>("/api/some-endpoint", { method: "POST", body: JSON.stringify(payload) });
 *
 * Throws on non-2xx responses (toast is shown automatically unless `silent: true`).
 */

import toast from "react-hot-toast";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FetchOptions = RequestInit & {
  /** Suppress automatic error toasts — useful when the caller shows its own UI. */
  silent?: boolean;
};

export async function apiFetch<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
  const { silent = false, ...fetchOptions } = options;

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    let message: string;

    switch (res.status) {
      case 401:
        message = "Session expired — please log in again.";
        break;
      case 403:
        message = "You don't have permission to do that.";
        break;
      case 500:
        message = "Something went wrong on our end. Please try again.";
        break;
      default:
        try {
          const body = await res.clone().json();
          message = body.error ?? body.message ?? `Request failed (${res.status})`;
        } catch {
          message = `Request failed (${res.status})`;
        }
    }

    if (!silent) {
      toast.error(message);
    }

    throw new ApiError(message, res.status);
  }

  // 204 No Content or non-JSON
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
