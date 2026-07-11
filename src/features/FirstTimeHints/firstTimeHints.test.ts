/* global describe, it, expect */

import {
  mergeFirstTimeHints,
  normalizeFirstTimeHints,
  rankOfHintState,
  type FirstTimeHintMap,
} from './firstTimeHints';

const entry = (state: 'completed' | 'dismissed', at = '2026-07-11T00:00:00Z') => ({
  state,
  at,
});

describe('normalizeFirstTimeHints', () => {
  it('returns an empty map for null, arrays, and non-objects', () => {
    expect(normalizeFirstTimeHints(null)).toEqual({});
    expect(normalizeFirstTimeHints(undefined)).toEqual({});
    expect(normalizeFirstTimeHints([])).toEqual({});
    expect(normalizeFirstTimeHints('completed')).toEqual({});
  });

  it('passes through a valid map', () => {
    const map: FirstTimeHintMap = { first_push_given: entry('completed') };
    expect(normalizeFirstTimeHints(map)).toEqual(map);
  });
});

describe('rankOfHintState', () => {
  it('orders completed > dismissed > pending/absent', () => {
    expect(rankOfHintState('completed')).toBeGreaterThan(rankOfHintState('dismissed'));
    expect(rankOfHintState('dismissed')).toBeGreaterThan(rankOfHintState(undefined));
  });
});

describe('mergeFirstTimeHints', () => {
  it('takes the server map when local has nothing', () => {
    const server: FirstTimeHintMap = { first_response: entry('completed') };
    const { merged, unsynced } = mergeFirstTimeHints({}, server);

    expect(merged).toEqual(server);
    expect(unsynced).toEqual([]);
  });

  it('keeps a local completed the server missed and marks it unsynced', () => {
    const local: FirstTimeHintMap = { first_push_given: entry('completed') };
    const { merged, unsynced } = mergeFirstTimeHints(local, {});

    expect(merged.first_push_given?.state).toBe('completed');
    expect(unsynced).toEqual(['first_push_given']);
  });

  it('never downgrades a server completed to a local dismissed', () => {
    const local: FirstTimeHintMap = { cheer_discovery: entry('dismissed') };
    const server: FirstTimeHintMap = { cheer_discovery: entry('completed') };
    const { merged, unsynced } = mergeFirstTimeHints(local, server);

    expect(merged.cheer_discovery?.state).toBe('completed');
    expect(unsynced).toEqual([]);
  });

  it('upgrades a server dismissed to a local completed and re-syncs it', () => {
    const local: FirstTimeHintMap = { cheer_discovery: entry('completed') };
    const server: FirstTimeHintMap = { cheer_discovery: entry('dismissed') };
    const { merged, unsynced } = mergeFirstTimeHints(local, server);

    expect(merged.cheer_discovery?.state).toBe('completed');
    expect(unsynced).toEqual(['cheer_discovery']);
  });

  it('keeps identical states in sync without re-sending', () => {
    const both: FirstTimeHintMap = { first_response: entry('dismissed') };
    const { merged, unsynced } = mergeFirstTimeHints(both, both);

    expect(merged.first_response?.state).toBe('dismissed');
    expect(unsynced).toEqual([]);
  });
});
