import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Normalizes user input to E.164 ("+995599123456") or returns null when the
// value is not a real dialable number (unknown country code or wrong digit
// count for that country). Shared by the form island and the API route so
// client and server accept exactly the same numbers.
export function normalizePhone(raw: string): string | null {
  let value = raw.trim();
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return null;

  if (!value.startsWith('+')) {
    if (digits.startsWith('00')) {
      // "00" international prefix → "+"
      value = '+' + digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('8')) {
      // Russian domestic format "8 9XX XXX-XX-XX"
      value = '+7' + digits.slice(1);
    } else if (digits.length === 9 && digits.startsWith('5')) {
      // Georgian mobile without country code: 5XX XXX XXX
      value = '+995' + digits;
    } else {
      // Country code typed without "+" (e.g. "995599…", "79261234567")
      value = '+' + digits;
    }
  }

  const parsed = parsePhoneNumberFromString(value);
  return parsed?.isValid() ? parsed.number : null;
}
