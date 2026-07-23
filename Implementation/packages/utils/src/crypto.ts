export function generateId(prefix = 'id'): string {
  const randomHex = Math.random().toString(36).substring(2, 10);
  const timeHex = Date.now().toString(36);
  return `${prefix}_${timeHex}${randomHex}`;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
