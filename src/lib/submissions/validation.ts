import { AppError } from "@/lib/errors";
import type { Json } from "@/lib/supabase/database.types";

const MAX_FIELDS = 100;
const MAX_FIELD_NAME = 100;
const MAX_STRING_VALUE = 10_000;

/** Reserved helper fields accepted from HTML and JSON integrations. */
export const RESERVED_FIELDS = new Set([
  "_redirect",
  "_idempotency_key",
  "_gotcha",
  "_honey",
  "_subject",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJsonValue(value: unknown, depth: number): Json {
  if (depth > 5) {
    throw new AppError("VALIDATION_ERROR", "Submitted data is nested too deeply.");
  }
  if (value === null || typeof value === "boolean" || typeof value === "number") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new AppError("VALIDATION_ERROR", "Submitted numbers must be finite.");
    }
    return value;
  }
  if (typeof value === "string") {
    if (value.length > MAX_STRING_VALUE) {
      throw new AppError("VALIDATION_ERROR", "A submitted value is too long.");
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 100) {
      throw new AppError("VALIDATION_ERROR", "A submitted list is too long.");
    }
    return value.map((item) => toJsonValue(item, depth + 1));
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length > MAX_FIELDS) {
      throw new AppError("VALIDATION_ERROR", "Too many fields were submitted.");
    }
    const result: Record<string, Json> = {};
    for (const [key, item] of entries) {
      if (key.length === 0 || key.length > MAX_FIELD_NAME) {
        throw new AppError("VALIDATION_ERROR", "A field name is invalid.");
      }
      result[key] = toJsonValue(item, depth + 1);
    }
    return result;
  }
  throw new AppError("VALIDATION_ERROR", "Submitted values must be JSON.");
}

export type NormalizedSubmission = {
  data: Record<string, Json>;
  metadata: Record<string, Json>;
};

/**
 * Accepts both documented shapes:
 *   { "data": { ... }, "metadata": { ... } }   (explicit)
 *   { "name": "Ada", "email": "..." }          (flat JSON / HTML fields)
 *
 * V1 has no per-form field schema; it accepts any JSON object within size,
 * depth, field and value limits. Reserved helper fields are stripped.
 */
export function parseSubmissionPayload(raw: unknown): NormalizedSubmission {
  if (!isPlainObject(raw)) {
    throw new AppError("VALIDATION_ERROR", "The request body must be a JSON object.");
  }

  const hasDataObject = isPlainObject(raw.data);
  const source: Record<string, unknown> = hasDataObject
    ? (raw.data as Record<string, unknown>)
    : raw;

  const dataEntries = Object.entries(source).filter(
    ([key]) => !RESERVED_FIELDS.has(key) && key !== "metadata" && key !== "data",
  );

  if (dataEntries.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Submit at least one field.", {
      data: "At least one field is required.",
    });
  }

  const data = toJsonValue(Object.fromEntries(dataEntries), 0);
  if (!isPlainObject(data)) {
    throw new AppError("VALIDATION_ERROR", 'The "data" field must be an object.');
  }

  let metadata: Record<string, Json> = {};
  if (raw.metadata !== undefined && raw.metadata !== null) {
    if (!isPlainObject(raw.metadata)) {
      throw new AppError("VALIDATION_ERROR", 'The "metadata" field must be an object.');
    }
    const converted = toJsonValue(raw.metadata, 0);
    if (!isPlainObject(converted)) {
      throw new AppError("VALIDATION_ERROR", 'The "metadata" field must be an object.');
    }
    metadata = converted as Record<string, Json>;
  }

  return { data: data as Record<string, Json>, metadata };
}

/** Converts HTML form fields into the same object shape the JSON path accepts. */
export function formEntriesToPayload(entries: Iterable<[string, string]>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (key in result) {
      const current = result[key];
      result[key] = Array.isArray(current) ? [...current, value] : [current, value];
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function readHelperField(raw: unknown, key: string): string | null {
  if (!isPlainObject(raw)) return null;
  const value = raw[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Validates a user-supplied redirect target for HTML integrations. */
export function safeRedirectTarget(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
