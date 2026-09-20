/** All demo data is anchored to this date so relative timings stay consistent. */
export const DEMO_NOW = new Date('2026-09-19T09:00:00+05:30')
export const isoDaysAgo = (d: number) => new Date(DEMO_NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10)
export const isoDaysAhead = (d: number) => isoDaysAgo(-d)
