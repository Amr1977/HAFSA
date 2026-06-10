import { describe, it, expect } from 'vitest';
import { calculateIddahEndsAt } from '../utils/iddah';

describe('calculateIddahEndsAt', () => {
  it('returns iddahComplete=true for never-married (SINGLE)', () => {
    const result = calculateIddahEndsAt('عزباء');
    expect(result.iddahComplete).toBe(true);
    expect(result.iddahEndsAt).toBeNull();
  });

  it('returns iddahComplete=true for divorced with no date', () => {
    const result = calculateIddahEndsAt('مطلقة');
    expect(result.iddahComplete).toBe(true);
    expect(result.iddahEndsAt).toBeNull();
  });

  it('calculates 90 days iddah for divorced woman with valid date', () => {
    const divorceDate = '2026-05-01';
    const result = calculateIddahEndsAt('مطلقة', divorceDate);
    expect(result.iddahEndsAt).not.toBeNull();
    const expected = new Date(divorceDate);
    expected.setDate(expected.getDate() + 90);
    expect(result.iddahEndsAt!.getTime()).toBe(expected.getTime());
  });

  it('marks iddahComplete=false when iddah period has not ended', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() - 10);
    const divorceDateStr = futureDate.toISOString().split('T')[0];
    const result = calculateIddahEndsAt('مطلقة', divorceDateStr);
    expect(result.iddahComplete).toBe(false);
  });

  it('marks iddahComplete=true when iddah period has ended', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 100);
    const divorceDateStr = pastDate.toISOString().split('T')[0];
    const result = calculateIddahEndsAt('مطلقة', divorceDateStr);
    expect(result.iddahComplete).toBe(true);
  });

  it('calculates 130 days iddah for widow', () => {
    const deathDate = '2026-01-15';
    const result = calculateIddahEndsAt('أرملة', null, deathDate);
    expect(result.iddahEndsAt).not.toBeNull();
    const expected = new Date(deathDate);
    expected.setDate(expected.getDate() + 130);
    expect(result.iddahEndsAt!.getTime()).toBe(expected.getTime());
  });

  it('returns iddahComplete=true for widower with past death date beyond 130 days', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 200);
    const deathDateStr = pastDate.toISOString().split('T')[0];
    const result = calculateIddahEndsAt('أرملة', null, deathDateStr);
    expect(result.iddahComplete).toBe(true);
  });

  it('returns iddahComplete=false for recent widow within 130 days', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30);
    const deathDateStr = recentDate.toISOString().split('T')[0];
    const result = calculateIddahEndsAt('أرملة', null, deathDateStr);
    expect(result.iddahComplete).toBe(false);
  });

  it('handles invalid date strings gracefully', () => {
    const result = calculateIddahEndsAt('مطلقة', 'not-a-date');
    expect(result.iddahComplete).toBe(true);
    expect(result.iddahEndsAt).toBeNull();
  });

  it('handles undefined optional params', () => {
    const result = calculateIddahEndsAt('عزباء', undefined, undefined);
    expect(result.iddahComplete).toBe(true);
    expect(result.iddahEndsAt).toBeNull();
  });
});
