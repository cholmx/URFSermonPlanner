import { describe, expect, it } from 'vitest';
import {
  fromISO,
  easterSunday,
  monthLabel,
  nextSunday,
  specialSunday,
  sundaysBetween,
  toISO,
  windowRange,
} from './dates';

describe('easterSunday', () => {
  it('matches known dates', () => {
    expect(toISO(easterSunday(2025))).toBe('2025-04-20');
    expect(toISO(easterSunday(2026))).toBe('2026-04-05');
    expect(toISO(easterSunday(2027))).toBe('2027-03-28');
    expect(toISO(easterSunday(2028))).toBe('2028-04-16');
  });
});

describe('specialSunday', () => {
  it('labels the 2025 Sundays', () => {
    const found: Record<string, string> = {};
    for (const d of sundaysBetween(fromISO('2025-01-01'), fromISO('2025-12-31'))) {
      const label = specialSunday(d);
      if (label) found[toISO(d)] = label;
    }
    expect(found).toEqual({
      '2025-04-13': 'Palm Sunday',
      '2025-04-20': 'Easter Sunday',
      '2025-05-11': "Mother's Day",
      '2025-05-25': 'Memorial Day Weekend',
      '2025-06-08': 'Pentecost',
      '2025-06-15': "Father's Day",
      '2025-08-31': 'Labor Day Weekend',
      '2025-11-23': 'Thanksgiving Sunday',
      '2025-11-30': 'Advent 1',
      '2025-12-07': 'Advent 2',
      '2025-12-14': 'Advent 3',
      '2025-12-21': 'Advent 4',
    });
  });

  it('handles Christmas and New Year on a Sunday', () => {
    expect(specialSunday(fromISO('2022-12-25'))).toBe('Christmas Day');
    expect(specialSunday(fromISO('2023-12-24'))).toBe('Christmas Eve');
    expect(specialSunday(fromISO('2023-01-01'))).toBe("New Year's Day");
    expect(specialSunday(fromISO('2022-12-18'))).toBe('Advent 4');
  });

  it('marks Independence Day only when July 4 is a Sunday', () => {
    expect(specialSunday(fromISO('2027-07-04'))).toBe('Independence Day');
    expect(specialSunday(fromISO('2027-07-11'))).toBe('');
  });
});

describe('rolling window', () => {
  const today = fromISO('2026-09-28');

  it('starts on the 1st of last month and ends one year out', () => {
    const { start, end } = windowRange(today);
    expect(toISO(start)).toBe('2026-08-01');
    expect(toISO(end)).toBe('2027-09-28');
  });

  it('lists only Sundays, first in August, last on 2027-09-26', () => {
    const { start, end } = windowRange(today);
    const days = sundaysBetween(start, end);
    expect(days.every((d) => d.getDay() === 0)).toBe(true);
    expect(toISO(days[0])).toBe('2026-08-02');
    expect(toISO(days[days.length - 1])).toBe('2027-09-26');
    expect(days.length).toBe(61);
  });

  it('picks the next Sunday on or after today', () => {
    expect(toISO(nextSunday(today))).toBe('2026-10-04');
    expect(toISO(nextSunday(fromISO('2026-10-04')))).toBe('2026-10-04');
    expect(toISO(nextSunday(fromISO('2026-10-05')))).toBe('2026-10-11');
  });

  it('keeps the sheet month spellings', () => {
    expect(monthLabel(fromISO('2026-02-01'))).toBe('FEB.');
    expect(monthLabel(fromISO('2026-03-01'))).toBe('MARCH');
    expect(monthLabel(fromISO('2026-09-01'))).toBe('SEPT');
  });
});
