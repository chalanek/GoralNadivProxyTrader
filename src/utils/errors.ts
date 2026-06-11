/**
 * Extracts a human-readable message from an unknown caught value.
 * @param error - The caught value from a catch block
 * @param fallback - Message to return when the value is not an Error instance
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
