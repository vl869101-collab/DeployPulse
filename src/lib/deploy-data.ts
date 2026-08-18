export interface DeployLogLine {
  level: 'info' | 'warn' | 'error';
  message: string;
  time?: string;
}

export interface Deployment {
  id: string;
  status: 'success' | 'error' | 'building';
  environment: 'production' | 'preview';
  commit: string;
  message: string;
  createdAt: string;
  duration: string;
  warnings: number;
}

export const deployments: Deployment[] = [
  {
    id: 'dpl_production_1ce273b',
    status: 'success',
    environment: 'production',
    commit: '1ce273b',
    message: 'feat: analytics dashboard with GLM 5.3 - metrics, charts, error analysis, regional perf',
    createdAt: '16/08/2026 20:16',
    duration: '41s',
    warnings: 161,
  },
];

export const deployLogLines: DeployLogLine[] = [
  {
    level: 'warn',
    message: '2 more (eslint-config-next, ts-api-utils)',
    time: '13:53',
  },
  {
    level: 'warn',
    message:
      'Could not resolve dependency: peer typescript@">=4.8.4 <6.1.0" from node_modules/eslint-config-next/node_modules/typescript-eslint/node_modules/@typescript-eslint/typescript-estree',
    time: '13:53',
  },
  {
    level: 'warn',
    message: 'Conflicting peer dependency: typescript@6.0.3',
    time: '13:53',
  },
  {
    level: 'warn',
    message: 'Conflicting peer dependency: typescript@6.0.3 in node_modules/typescript-...',
    time: '13:53',
  },
  {
    level: 'info',
    message: 'Building with Next.js 16.3.0 — 161 warning lines, 2 recommendations',
    time: '13:53',
  },
  {
    level: 'info',
    message: 'Build completed in 41s. Deployed to production.',
    time: '13:53',
  },
];
