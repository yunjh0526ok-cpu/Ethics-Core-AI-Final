import { describe, it, expect } from 'vitest';
import { buildDemoMetrics, APP_DEFS } from './metrics.js';

describe('/api/metrics', () => {
  it('buildDemoMetrics returns three apps with numeric fields', () => {
    const m = buildDemoMetrics();
    expect(m.demo).toBe(true);
    expect(m.apps).toHaveLength(3);
    expect(m.apps.map((a) => a.appId)).toEqual(APP_DEFS.map((a) => a.appId));
    expect(m.updatedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
    for (const a of m.apps) {
      expect(typeof a.users).toBe('number');
      expect(typeof a.activeUsers).toBe('number');
      expect(typeof a.errorRate).toBe('number');
    }
  });
});
