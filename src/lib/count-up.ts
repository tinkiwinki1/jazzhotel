// Shared metric-string parser used by both the React CountUp and the vanilla
// data-count-up animator in the Astro layout. Examples it handles:
//   "+124%"   → +124 with prefix "+", suffix "%"
//   "12,7%"   → 12.7 with comma separator
//   "$3,5 млн" → 3.5 with prefix "$", suffix " млн"
//   "2 183 м²" → 2183 with thin-space thousands, suffix " м²"
//   "2019"    → 2019, no decimals
//   "3 мин"   → 3 with suffix " мин"

export interface ParsedMetric {
  prefix: string;
  num: number | null;
  suffix: string;
  decimals: number;
  /** Decimal separator used in the source string. */
  sep: '.' | ',';
  /** Thousands grouping char, if any (space, narrow space, etc). */
  thousands: string;
}

const NUM_RE = /^(\D*?)(-?[\d.,   ]+)([\s\S]*)$/;

export function parseMetric(raw: string): ParsedMetric {
  const m = raw.match(NUM_RE);
  if (!m) return { prefix: '', num: null, suffix: raw, decimals: 0, sep: '.', thousands: '' };
  const [, prefix, body, suffix] = m;
  // Detect thousands separator (anything non-digit and non-decimal)
  const decSep: '.' | ',' = body.includes(',') && !body.match(/\d,\d{1,2}\b/)
    ? ','
    : body.includes(',') && body.match(/\d,\d{1,2}\b/)
    ? ','
    : '.';
  const cleaned = body.replace(new RegExp(`[\\s\\u00A0\\u202F]`, 'g'), '');
  const normalized = cleaned.replace(',', '.');
  const num = parseFloat(normalized);
  if (Number.isNaN(num)) return { prefix, num: null, suffix, decimals: 0, sep: '.', thousands: '' };
  const decPart = normalized.split('.')[1];
  const thousandsMatch = body.match(/\d([\s  ])\d{3}/);
  return {
    prefix,
    num,
    suffix,
    decimals: decPart ? decPart.length : 0,
    sep: decSep,
    thousands: thousandsMatch ? thousandsMatch[1] : '',
  };
}

export function formatMetric(num: number, p: ParsedMetric): string {
  const fixed = Math.abs(num) >= 1000 && p.decimals === 0
    ? Math.round(num).toString()
    : num.toFixed(p.decimals);
  let [intPart, decPart] = fixed.split('.');
  if (p.thousands && intPart.length > 3) {
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, p.thousands);
  }
  const numStr = decPart ? `${intPart}${p.sep}${decPart}` : intPart;
  return `${p.prefix}${numStr}${p.suffix}`;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
