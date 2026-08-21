import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLocalMonitors,
  saveLocalMonitors,
  addLocalMonitor,
  updateLocalMonitor,
  deleteLocalMonitor,
} from '../monitor-store';

describe('monitor-store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when nothing stored', () => {
    expect(getLocalMonitors()).toEqual([]);
  });

  it('addLocalMonitor persists with defaults and prepends', () => {
    const a = addLocalMonitor({ name: 'A' });
    const b = addLocalMonitor({ name: 'B' });
    const all = getLocalMonitors();
    expect(all).toHaveLength(2);
    expect(all[0].name).toBe('B');
    expect(a.id).toMatch(/^mon_/);
    expect(a.status).toBe('pending');
    expect(a.type).toBe('https');
    expect(a.interval).toBe(60);
  });

  it('updateLocalMonitor merges data and bumps updatedAt', () => {
    const m = addLocalMonitor({ name: 'X' });
    const updated = updateLocalMonitor(m.id, { name: 'Y', status: 'up' });
    expect(updated?.name).toBe('Y');
    expect(updated?.status).toBe('up');
    expect(getLocalMonitors()[0].name).toBe('Y');
  });

  it('updateLocalMonitor returns null for unknown id', () => {
    expect(updateLocalMonitor('mon_missing', { name: 'Z' })).toBeNull();
  });

  it('deleteLocalMonitor removes and reports', () => {
    const m = addLocalMonitor({ name: 'D' });
    expect(deleteLocalMonitor(m.id)).toBe(true);
    expect(getLocalMonitors()).toHaveLength(0);
    expect(deleteLocalMonitor(m.id)).toBe(false);
  });

  it('survives corrupted storage without throwing', () => {
    localStorage.setItem('deploypulse_monitors', '{not json');
    expect(getLocalMonitors()).toEqual([]);
  });
});
