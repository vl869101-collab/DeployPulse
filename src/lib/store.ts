import { Monitor } from '@/types';
import { mockMonitors } from './mock-data';

// Ponytail: in-memory store on globalThis survives hot reloads
const g = globalThis as unknown as { __monitors?: Monitor[] };
if (!g.__monitors) g.__monitors = [...mockMonitors];
export const monitors: Monitor[] = g.__monitors;
