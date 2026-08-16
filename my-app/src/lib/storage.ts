export function readStoredJson<T>(
  key: string,
  isValid: (value: unknown) => value is T
): T | null {
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!isValid(parsed)) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}
