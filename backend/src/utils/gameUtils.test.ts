import {
  normalizeCityName,
  extractNextLetter,
  generateGameCode,
  startsWithLetter,
} from './gameUtils';

describe('gameUtils', () => {
  describe('normalizeCityName', () => {
    it('should convert to lowercase and trim', () => {
      expect(normalizeCityName('  New York  ')).toBe('new york');
      expect(normalizeCityName('LONDON')).toBe('london');
    });
  });

  describe('extractNextLetter', () => {
    it('should extract last letter', () => {
      expect(extractNextLetter('London')).toBe('N');
      expect(extractNextLetter('Aberdeen')).toBe('N');
    });

    it('should handle "city" suffix', () => {
      expect(extractNextLetter('New York City')).toBe('K');
      expect(extractNextLetter('Kansas City')).toBe('S');
      expect(extractNextLetter('Mexico City')).toBe('O');
    });

    it('should handle case insensitivity', () => {
      expect(extractNextLetter('KANSAS CITY')).toBe('S');
      expect(extractNextLetter('kansas city')).toBe('S');
    });
  });

  describe('generateGameCode', () => {
    it('should generate 4-character code', () => {
      const code = generateGameCode();
      expect(code).toHaveLength(4);
    });

    it('should generate uppercase code', () => {
      const code = generateGameCode();
      expect(code).toMatch(/^[A-Z0-9]{4}$/);
    });
  });

  describe('startsWithLetter', () => {
    it('should check if city starts with letter', () => {
      expect(startsWithLetter('London', 'L')).toBe(true);
      expect(startsWithLetter('London', 'l')).toBe(true);
      expect(startsWithLetter('London', 'N')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(startsWithLetter('LONDON', 'l')).toBe(true);
      expect(startsWithLetter('london', 'L')).toBe(true);
    });
  });
});
