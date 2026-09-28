// All dates are handled as local calendar dates (no time zones involved).

export const BASE_ISO = '2025-01-05'; // first Sunday of the original sheet

export const MONTH_LABELS = [
  'JAN',
  'FEB.',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUG',
  'SEPT',
  'OCT',
  'NOV',
  'DEC',
];

const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const monthLabel = (d: Date) => MONTH_LABELS[d.getMonth()];

/** Gregorian Easter Sunday for a given year. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Label for holidays and church-calendar dates that fall on the given Sunday. */
export function specialSunday(d: Date): string {
  const y = d.getFullYear();
  const iso = toISO(d);
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const easter = easterSunday(y);
  if (iso === toISO(easter)) return 'Easter Sunday';
  if (iso === toISO(addDays(easter, -7))) return 'Palm Sunday';
  if (iso === toISO(addDays(easter, 49))) return 'Pentecost';

  if (month === 12 && day === 24) return 'Christmas Eve';
  if (month === 12 && day === 25) return 'Christmas Day';
  if (month === 1 && day === 1) return "New Year's Day";

  const christmas = new Date(y, 11, 25);
  const advent4 = addDays(christmas, -(christmas.getDay() === 0 ? 7 : christmas.getDay()));
  if (iso === toISO(advent4)) return 'Advent 4';
  if (iso === toISO(addDays(advent4, -7))) return 'Advent 3';
  if (iso === toISO(addDays(advent4, -14))) return 'Advent 2';
  if (iso === toISO(addDays(advent4, -21))) return 'Advent 1';

  const thursday = addDays(d, 4);
  if (thursday.getMonth() === 10 && thursday.getDate() >= 22 && thursday.getDate() <= 28) {
    return 'Thanksgiving Sunday';
  }

  if (month === 5 && day >= 8 && day <= 14) return "Mother's Day";
  if (month === 6 && day >= 15 && day <= 21) return "Father's Day";

  if (addDays(d, 1).getMonth() === 4 && addDays(d, 8).getMonth() === 5) return 'Memorial Day Weekend';
  const monday = addDays(d, 1);
  if (monday.getMonth() === 8 && monday.getDate() <= 7) return 'Labor Day Weekend';

  if (month === 7 && day === 4) return 'Independence Day';
  return '';
}

/**
 * The rolling window: from the 1st of the month `monthsBehind` months ago
 * through `monthsAhead` months from today.
 */
export function windowRange(today: Date, monthsBehind = 1, monthsAhead = 12) {
  const start = new Date(today.getFullYear(), today.getMonth() - monthsBehind, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + monthsAhead, today.getDate());
  return { start, end };
}

/** Every Sunday from start through end, inclusive. */
export function sundaysBetween(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  let d = startOfDay(start);
  while (d.getDay() !== 0) d = addDays(d, 1);
  while (d <= end) {
    out.push(d);
    d = addDays(d, 7);
  }
  return out;
}

/** The first Sunday on or after today. */
export function nextSunday(today: Date): Date {
  let d = startOfDay(today);
  while (d.getDay() !== 0) d = addDays(d, 1);
  return d;
}
