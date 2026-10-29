export type AppErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "INVALID_REQUEST"
  | "VALIDATION_ERROR"
  | "FORM_NOT_FOUND"
  | "FORM_INACTIVE"
  | "INVALID_FORM_SECRET"
  | "LEAD_NOT_FOUND"
  | "WORKSPACE_NOT_FOUND"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_EXPIRED"
  | "INVITATION_REVOKED"
  | "ALREADY_INVITED"
  | "ALREADY_HAS_ACCESS"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "PLAN_LIMIT_REACHED"
  | "IDEMPOTENCY_CONFLICT"
  | "WEBHOOK_INVALID"
  | "NOT_CONFIGURED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

const STATUS: Record<AppErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  INVALID_REQUEST: 400,
  VALIDATION_ERROR: 422,
  FORM_NOT_FOUND: 404,
  FORM_INACTIVE: 409,
  INVALID_FORM_SECRET: 401,
  LEAD_NOT_FOUND: 404,
  WORKSPACE_NOT_FOUND: 404,
  INVITATION_NOT_FOUND: 404,
  INVITATION_EXPIRED: 410,
  INVITATION_REVOKED: 410,
  ALREADY_INVITED: 409,
  ALREADY_HAS_ACCESS: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RATE_LIMITED: 429,
  QUOTA_EXCEEDED: 402,
  PLAN_LIMIT_REACHED: 403,
  IDEMPOTENCY_CONFLICT: 409,
  WEBHOOK_INVALID: 400,
  NOT_CONFIGURED: 503,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(code: AppErrorCode, message?: string, fields?: Record<string, string>) {
    super(message ?? defaultMessage(code));
    this.name = "AppError";
    this.code = code;
    this.status = STATUS[code];
    this.fields = fields;
  }
}

function defaultMessage(code: AppErrorCode): string {
  switch (code) {
    case "UNAUTHENTICATED":
      return "You must be signed in to do that.";
    case "FORBIDDEN":
      return "You do not have access to this resource.";
    case "INVALID_REQUEST":
      return "The request is invalid.";
    case "VALIDATION_ERROR":
      return "Some fields need attention.";
    case "FORM_NOT_FOUND":
      return "The requested form could not be found.";
    case "FORM_INACTIVE":
      return "This form is paused and is not accepting submissions.";
    case "INVALID_FORM_SECRET":
      return "The form secret is invalid.";
    case "LEAD_NOT_FOUND":
      return "The requested lead could not be found.";
    case "WORKSPACE_NOT_FOUND":
      return "The workspace could not be found.";
    case "INVITATION_NOT_FOUND":
      return "This invitation could not be found.";
    case "INVITATION_EXPIRED":
      return "This invitation has expired.";
    case "INVITATION_REVOKED":
      return "This invitation has been revoked.";
    case "ALREADY_INVITED":
      return "There is already a pending invitation for this email and form.";
    case "ALREADY_HAS_ACCESS":
      return "This client already has access to the form.";
    case "PAYLOAD_TOO_LARGE":
      return "The request body is too large.";
    case "UNSUPPORTED_MEDIA_TYPE":
      return "The request must use Content-Type: application/json.";
    case "RATE_LIMITED":
      return "Too many requests. Please try again shortly.";
    case "QUOTA_EXCEEDED":
      return "The workspace has reached its monthly submission limit.";
    case "PLAN_LIMIT_REACHED":
      return "Your plan does not allow this. Upgrade to continue.";
    case "IDEMPOTENCY_CONFLICT":
      return "The idempotency key was already used with a different request.";
    case "WEBHOOK_INVALID":
      return "The webhook signature or payload is invalid.";
    case "NOT_CONFIGURED":
      return "This integration is not configured.";
    case "NOT_FOUND":
      return "Not found.";
    case "INTERNAL_ERROR":
      return "Something went wrong. Please try again.";
  }
}

/** Maps a database/RPC error onto a structured application error. */
export function mapDatabaseError(message: string | undefined): AppError {
  const text = message ?? "";
  if (text.includes("SUBMISSION_LIMIT_REACHED")) return new AppError("QUOTA_EXCEEDED");
  if (text.includes("FORM_PAUSED")) return new AppError("FORM_INACTIVE");
  if (text.includes("FORM_NOT_FOUND")) return new AppError("FORM_NOT_FOUND");
  if (text.includes("RATE_LIMITED")) return new AppError("RATE_LIMITED");
  if (text.includes("INVITATION_EXPIRED")) return new AppError("INVITATION_EXPIRED");
  if (text.includes("INVITATION_REVOKED")) return new AppError("INVITATION_REVOKED");
  if (text.includes("INVITATION_NOT_FOUND")) return new AppError("INVITATION_NOT_FOUND");
  if (text.includes("INVITATION_ALREADY_ACCEPTED")) {
    return new AppError("INVITATION_REVOKED", "This invitation has already been used.");
  }
  if (text.includes("EMAIL_MISMATCH")) {
    return new AppError("FORBIDDEN", "Sign in with the email address this invitation was sent to.");
  }
  if (text.includes("VIEWER_LIMIT_REACHED")) {
    return new AppError("PLAN_LIMIT_REACHED", "Your plan's client viewer limit has been reached.");
  }
  if (text.includes("ACTIVE_CLIENT_EXISTS")) {
    return new AppError("ALREADY_HAS_ACCESS", "This form is already shared with a client.");
  }
  if (text.includes("INVALID_PAYLOAD") || text.includes("INVALID_ARGUMENTS")) {
    return new AppError("VALIDATION_ERROR");
  }
  return new AppError("INTERNAL_ERROR");
}

export function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
