export function validateId(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^[\w\-]+$/.test(value)) {
    throw new Error(`Invalid ${field}: must contain only letters, digits, hyphens, and underscores`);
  }
  return value;
}
