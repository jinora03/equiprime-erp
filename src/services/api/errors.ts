export type FieldErrors = Record<string, string[]>;

/** Error payload shape accepted from Laravel/FastAPI and normalized for the UI. */
export interface ApiErrorPayload {
  code?: string;
  message?: string;
  fieldErrors?: FieldErrors;
  /** Laravel validation errors use `errors` by default. */
  errors?: FieldErrors;
  /** FastAPI commonly returns a string or validation-detail array. */
  detail?: unknown;
}

export interface AppErrorOptions {
  code: string;
  message: string;
  status?: number;
  fieldErrors?: FieldErrors;
  cause?: unknown;
}

/** Stable frontend error contract used by both mock services and HTTP APIs. */
export class AppError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly fieldErrors?: FieldErrors;
  override readonly cause?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors;
    this.cause = options.cause;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asFieldErrors(value: unknown): FieldErrors | undefined {
  if (!isRecord(value)) return undefined;

  const normalized: FieldErrors = {};
  for (const [field, messages] of Object.entries(value)) {
    if (Array.isArray(messages)) {
      const strings = messages.filter(
        (message): message is string => typeof message === "string",
      );
      if (strings.length > 0) normalized[field] = strings;
    } else if (typeof messages === "string") {
      normalized[field] = [messages];
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}


function asFastApiFieldErrors(value: unknown): FieldErrors | undefined {
  if (!Array.isArray(value)) return undefined;

  const normalized: FieldErrors = {};
  for (const detail of value) {
    if (!isRecord(detail) || typeof detail.msg !== "string") continue;
    const loc = Array.isArray(detail.loc) ? detail.loc : [];
    const path = loc
      .filter((part): part is string | number =>
        typeof part === "string" || typeof part === "number",
      )
      .filter((part) => part !== "body" && part !== "query" && part !== "path")
      .join(".");
    const field = path || "request";
    normalized[field] = [...(normalized[field] ?? []), detail.msg];
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function codeForStatus(status?: number): string {
  switch (status) {
    case 401:
      return "AUTHENTICATION_REQUIRED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_ERROR";
    case 429:
      return "RATE_LIMITED";
    default:
      return status && status >= 500 ? "SERVER_ERROR" : "REQUEST_FAILED";
  }
}

/**
 * Normalize unknown errors from mock services or Axios-like HTTP errors into a
 * single UI contract. This intentionally supports Laravel's `{ message, errors }`
 * validation shape as well as Equiprime's future `{ code, message, fieldErrors }`.
 */
export function normalizeAppError(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): AppError {
  if (error instanceof AppError) return error;

  if (isRecord(error)) {
    const response = isRecord(error.response) ? error.response : undefined;
    const status =
      response && typeof response.status === "number"
        ? response.status
        : undefined;
    const payload = response && isRecord(response.data) ? response.data : undefined;

    if (payload) {
      const message =
        typeof payload.message === "string" && payload.message.trim()
          ? payload.message
          : typeof payload.detail === "string" && payload.detail.trim()
            ? payload.detail
            : Array.isArray(payload.detail)
              ? "Request validation failed."
              : fallbackMessage;
      const code =
        typeof payload.code === "string" && payload.code.trim()
          ? payload.code
          : codeForStatus(status);
      const fieldErrors =
        asFieldErrors(payload.fieldErrors) ??
        asFieldErrors(payload.errors) ??
        asFastApiFieldErrors(payload.detail);

      return new AppError({
        code,
        message,
        status,
        fieldErrors,
        cause: error,
      });
    }
  }

  if (isRecord(error) && error.code === "ERR_NETWORK") {
    return new AppError({
      code: "NETWORK_ERROR",
      message:
        error instanceof Error && error.message
          ? error.message
          : "Unable to reach the server.",
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new AppError({
      code: "CLIENT_ERROR",
      message: error.message || fallbackMessage,
      cause: error,
    });
  }

  return new AppError({
    code: "UNKNOWN_ERROR",
    message: fallbackMessage,
    cause: error,
  });
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): string {
  return normalizeAppError(error, fallbackMessage).message;
}
