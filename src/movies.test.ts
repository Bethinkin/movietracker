import { describe, expect, it } from 'vitest';
import { MovieTracker } from './movies.js';

describe('MovieTracker', () => {
  it('adds, lists, and marks movies as watched', () => {
    const tracker = new MovieTracker();

    expect(tracker.add('Inception')).toBe(true);
    expect(tracker.add('Inception')).toBe(false); // no duplicates
    expect(tracker.list()).toEqual([{ title: 'Inception', watched: false }]);

    expect(tracker.markWatched('Inception')).toBe(true);
    expect(tracker.markWatched('Unknown')).toBe(false);
    expect(tracker.list()).toEqual([{ title: 'Inception', watched: true }]);
  });
});
