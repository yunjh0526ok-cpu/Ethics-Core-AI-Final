import { describe, it, expect } from 'vitest';
import { normalizeFeedbackPayload } from './feedback.js';

describe('/api/feedback normalizeFeedbackPayload', () => {
  it('accepts positive with text and meta', () => {
    const r = normalizeFeedbackPayload({
      text: '  good  ',
      type: 'positive',
      url: 'http://localhost:3000/',
      timestamp: '2026-01-01T00:00:00.000Z',
      userAgent: 'vitest',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.doc.text).toBe('good');
      expect(r.doc.type).toBe('positive');
      expect(r.doc.url).toContain('localhost');
    }
  });

  it('rejects invalid type', () => {
    const r = normalizeFeedbackPayload({ text: 'x', type: 'maybe' });
    expect(r.ok).toBe(false);
  });

  it('truncates text to 500 chars', () => {
    const long = 'a'.repeat(600);
    const r = normalizeFeedbackPayload({ text: long, type: 'negative' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.doc.text.length).toBe(500);
  });
});
