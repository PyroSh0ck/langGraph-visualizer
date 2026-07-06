export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

/**
 * Validates a response schema.
 * Must be a non-empty array of objects with non-empty name and description fields.
 */
export function validateResponseSchema(
  input: string
): ValidationResult<unknown> {
  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return { ok: false, errors: ["Invalid JSON"] };
  }

  const errors: string[] = [];

  // Must be an array
  if (!Array.isArray(parsed)) {
    return { ok: false, errors: ["Root must be an array"] };
  }

  // Must not be empty
  if (parsed.length === 0) {
    return { ok: false, errors: ["Array must not be empty"] };
  }

  // Track names for duplicate detection
  const seenNames = new Set<string>();

  // Validate each item
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];

    if (!item || typeof item !== "object") {
      errors.push(`Item [${i}] is not an object`);
      continue;
    }

    const { name, description } = item as Record<string, unknown>;

    // Check name
    if (typeof name !== "string" || name.trim() === "") {
      errors.push(`Item [${i}] has missing or empty name`);
    } else if (seenNames.has(name)) {
      errors.push(`Duplicate name: "${name}"`);
    } else {
      seenNames.add(name);
    }

    // Check description
    if (typeof description !== "string" || description.trim() === "") {
      errors.push(`Item [${i}] has missing or empty description`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: parsed };
}

/**
 * Validates a context schema.
 * Root must be a non-null, non-array object.
 * Accepts either a typed map or a JSON-Schema-like object.
 */
export function validateContextSchema(
  input: string
): ValidationResult<unknown> {
  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return { ok: false, errors: ["Invalid JSON"] };
  }

  const errors: string[] = [];

  // Root must be a non-null, non-array object
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      errors: ["Root must be a non-null, non-array object"],
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Check if it's a typed map (every value is a string type name)
  const isTypedMap = Object.values(obj).every(
    (val) =>
      val === "string" ||
      val === "number" ||
      val === "boolean" ||
      val === "object" ||
      val === "array"
  );

  if (isTypedMap) {
    // Validate typed map
    for (const [key, value] of Object.entries(obj)) {
      if (
        value !== "string" &&
        value !== "number" &&
        value !== "boolean" &&
        value !== "object" &&
        value !== "array"
      ) {
        errors.push(
          `Key "${key}" has invalid type value "${value}". Must be one of: string, number, boolean, object, array`
        );
      }
    }

    if (errors.length > 0) {
      return { ok: false, errors };
    }

    return { ok: true, value: parsed };
  }

  // Otherwise, check if it's JSON-Schema-like
  const hasType = "type" in obj && typeof obj.type === "string";
  const hasProperties = "properties" in obj && typeof obj.properties === "object";

  if (!hasType && !hasProperties) {
    return {
      ok: false,
      errors: [
        "Must be either a typed map or a JSON-Schema-like object with 'type' and/or 'properties'",
      ],
    };
  }

  return { ok: true, value: parsed };
}
