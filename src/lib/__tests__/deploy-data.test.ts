import { describe, it, expect } from 'vitest';
import { deployments, deployLogLines } from '../deploy-data';

const validStatuses = ['success', 'error', 'building'] as const;
const validLevels = ['info', 'warn', 'error'] as const;

describe('deploy-data', () => {
  it('has at least one deployment with valid shape', () => {
    expect(deployments.length).toBeGreaterThan(0);
    for (const d of deployments) {
      expect(validStatuses).toContain(d.status);
      expect(['production', 'preview']).toContain(d.environment);
      expect(d.commit).toBeTruthy();
      expect(d.warnings).toBeGreaterThanOrEqual(0);
    }
  });

  it('log lines only use known levels', () => {
    expect(deployLogLines.length).toBeGreaterThan(0);
    for (const line of deployLogLines) {
      expect(validLevels).toContain(line.level);
      expect(line.message).toBeTruthy();
    }
  });
});
