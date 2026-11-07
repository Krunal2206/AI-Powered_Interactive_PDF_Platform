export function isTimestampLike(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  );
}

export function convertTimestamp(value: unknown): Date {
  if (value instanceof Date) return value;
  if (isTimestampLike(value)) return value.toDate();
  return new Date();
}
