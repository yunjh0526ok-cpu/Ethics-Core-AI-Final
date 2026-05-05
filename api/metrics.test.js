import { describe, it, expect } from 'vitest';
import { aggregateMetrics } from './metrics.js';

describe('/api/metrics aggregateMetrics', () => {
  it('returns three apps with computed errorRate from counts', async () => {
    const queue = [
      10, 2, 100, 4,
      5, 1, 50, 5,
      3, 0, 0, 0,
    ];
    let i = 0;
    const mockDb = {
      collection: () => ({
        countDocuments: async () => {
          if (i >= queue.length) throw new Error('unexpected countDocuments call');
          return queue[i++];
        },
      }),
    };

    const out = await aggregateMetrics(mockDb);
    expect(out.apps).toHaveLength(3);
    expect(out.apps[0].users).toBe(10);
    expect(out.apps[0].activeUsers).toBe(2);
    expect(out.apps[0].errorRate).toBe(0.04);
    expect(out.apps[1].errorRate).toBe(0.1);
    expect(out.apps[2].errorRate).toBe(0);
    expect(out.updatedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect('demo' in out).toBe(false);
  });
});
