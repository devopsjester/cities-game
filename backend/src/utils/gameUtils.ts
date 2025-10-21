/**
 * Normalizes city name input for validation
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes special characters but keeps basic punctuation
 */
export function normalizeCityName(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Extracts the next starting letter from a city name
 * Handles the special "city" suffix rule
 */
export function extractNextLetter(cityName: string): string {
  const normalized = cityName.trim().toLowerCase();

  // Handle "city" suffix rule
  const cityRegex = /^(.+)\s+city$/i;
  const match = normalized.match(cityRegex);

  const baseName = match ? match[1] : normalized;

  // Get the last character that is a letter
  for (let i = baseName.length - 1; i >= 0; i--) {
    const char = baseName[i];
    if (/[a-z]/i.test(char)) {
      return char.toUpperCase();
    }
  }

  return '';
}

/**
 * Generates a random 4-letter game code
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing characters
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Checks if a city name starts with the required letter
 */
export function startsWithLetter(cityName: string, letter: string): boolean {
  const normalized = normalizeCityName(cityName);
  return normalized.length > 0 && normalized[0].toLowerCase() === letter.toLowerCase();
}
