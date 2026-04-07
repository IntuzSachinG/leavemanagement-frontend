import { ApiResponse, ValidationErrorItem } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type RequestConfig = RequestInit;

interface BackendError {
  message?: string;
  errors?: ValidationErrorItem[];
}

function buildHeaders(config: RequestConfig) {
  const headers = new Headers(config.headers);

  if (!headers.has("Content-Type") && config.body) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function resolveErrorMessage(payload: BackendError | null, status: number) {
  if (payload?.message) {
    return payload.message;
  }

  if (payload?.errors?.length) {
    return payload.errors
      .map((error) => error.msg ?? error.message)
      .filter(Boolean)
      .join(", ");
  }

  if (status === 401) {
    return "Your session expired.Please log in again to get workspace.";
  }

  return "Something went wrong please try after sometime or contact admin.";
}

export async function apiRequest<T>(path: string, config: RequestConfig = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...config,
    credentials: "include",
    headers: buildHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: BackendError | null = null;

    try {
      payload = (await response.json()) as BackendError;
    } catch {
      payload = null;
    }

    throw new Error(resolveErrorMessage(payload, response.status));
  }

  return (await response.json()) as ApiResponse<T>;
}
