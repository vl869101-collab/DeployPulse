import {
  User,
  Project,
  Monitor,
  Check,
  Incident,
  Alert,
  StatusPage,
  Team,
  TeamMember,
  ApiKey,
  Webhook,
  UptimeData,
  MonitorType,
  MonitorStatus,
  IncidentStatus,
  IncidentSeverity,
  AlertType,
} from '@/types';

export const mockUser: User = {
  id: 'user_1',
  email: 'demo@deploypulse.com',
  name: 'Demo User',
  avatar: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

export const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Production API',
    slug: 'production-api',
    description: 'Main production API services',
    ownerId: 'user_1',
    color: '#10B981',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'proj_2',
    name: 'Marketing Website',
    slug: 'marketing-website',
    description: 'Company marketing website and landing pages',
    ownerId: 'user_1',
    color: '#3B82F6',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'proj_3',
    name: 'Internal Tools',
    slug: 'internal-tools',
    description: 'Internal dashboard and admin tools',
    ownerId: 'user_1',
    color: '#F59E0B',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
];

export const mockMonitors: Monitor[] = [
  {
    id: 'mon_1',
    projectId: 'proj_1',
    name: 'API Health Check',
    url: 'https://api.example.com/health',
    type: 'https',
    interval: 60,
    timeout: 10,
    retries: 3,
    status: 'up',
    lastCheck: new Date(Date.now() - 30000),
    lastStatusCode: 200,
    lastLatency: 45,
    uptime: 99.95,
    tags: ['api', 'production'],
    project: { name: 'Production API', color: '#10B981' },
    regions: ['us-east-1', 'eu-west-1'],
    uptime24h: 99.98,
    uptime7d: 99.95,
    uptime30d: 99.93,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'mon_2',
    projectId: 'proj_1',
    name: 'Database Connection',
    url: 'tcp://db.example.com:5432',
    type: 'tcp',
    interval: 60,
    timeout: 10,
    retries: 3,
    status: 'up',
    lastCheck: new Date(Date.now() - 45000),
    lastStatusCode: null,
    lastLatency: 12,
    uptime: 99.98,
    tags: ['database', 'production'],
    project: { name: 'Production API', color: '#10B981' },
    regions: ['us-east-1'],
    uptime24h: 99.99,
    uptime7d: 99.98,
    uptime30d: 99.97,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'mon_3',
    projectId: 'proj_1',
    name: 'Payment Gateway',
    url: 'https://payments.example.com/api/v1/status',
    type: 'keyword',
    interval: 120,
    timeout: 15,
    retries: 2,
    status: 'down',
    lastCheck: new Date(Date.now() - 120000),
    lastStatusCode: 503,
    lastLatency: null,
    uptime: 99.2,
    tags: ['payments', 'critical'],
    project: { name: 'Production API', color: '#10B981' },
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    uptime24h: 98.5,
    uptime7d: 99.2,
    uptime30d: 99.4,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'mon_4',
    projectId: 'proj_2',
    name: 'Homepage',
    url: 'https://example.com',
    type: 'https',
    interval: 60,
    timeout: 10,
    retries: 3,
    status: 'up',
    lastCheck: new Date(Date.now() - 20000),
    lastStatusCode: 200,
    lastLatency: 78,
    uptime: 99.99,
    tags: ['website', 'public'],
    project: { name: 'Marketing Website', color: '#3B82F6' },
    regions: ['us-east-1', 'eu-west-1'],
    uptime24h: 100,
    uptime7d: 99.99,
    uptime30d: 99.98,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'mon_5',
    projectId: 'proj_2',
    name: 'SSL Certificate',
    url: 'https://example.com',
    type: 'ssl',
    interval: 1440,
    timeout: 30,
    retries: 1,
    status: 'pending',
    lastCheck: new Date(Date.now() - 86400000),
    lastStatusCode: null,
    lastLatency: null,
    uptime: 100,
    tags: ['ssl', 'security'],
    project: { name: 'Marketing Website', color: '#3B82F6' },
    regions: ['us-east-1'],
    uptime24h: 100,
    uptime7d: 100,
    uptime30d: 100,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'mon_6',
    projectId: 'proj_3',
    name: 'Admin Dashboard',
    url: 'https://admin.example.com',
    type: 'https',
    interval: 300,
    timeout: 15,
    retries: 2,
    status: 'up',
    lastCheck: new Date(Date.now() - 60000),
    lastStatusCode: 200,
    lastLatency: 156,
    uptime: 99.5,
    tags: ['admin', 'internal'],
    project: { name: 'Internal Tools', color: '#F59E0B' },
    regions: ['us-east-1'],
    uptime24h: 99.8,
    uptime7d: 99.5,
    uptime30d: 99.3,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
];

export const generateMockChecks = (monitorId: string, count: number = 50): Check[] => {
  const checks: Check[] = [];
  const statuses: MonitorStatus[] = ['up', 'up', 'up', 'up', 'down'];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    checks.push({
      id: `check_${monitorId}_${i}`,
      monitorId,
      status,
      statusCode: status === 'up' ? 200 : 503,
      latency: status === 'up' ? Math.floor(Math.random() * 200) + 20 : null,
      error: status === 'down' ? 'Connection timeout' : null,
      checkedAt: new Date(now - i * 60000),
    });
  }

  return checks.reverse();
};

export const mockIncidents: Incident[] = [
  {
    id: 'inc_1',
    projectId: 'proj_1',
    monitorId: 'mon_3',
    title: 'Payment Gateway Unavailable',
    description: 'Payment gateway returning 503 errors. Investigating with provider.',
    status: 'investigating',
    severity: 'critical',
    startedAt: new Date(Date.now() - 3600000),
    acknowledgedAt: null,
    resolvedAt: null,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
    monitor: { name: 'Payment Gateway' },
    project: { name: 'Production API', color: '#10B981' },
    affectedMonitors: ['mon_3'],
    updates: [
      {
        id: 'upd_1',
        incidentId: 'inc_1',
        status: 'investigating',
        message: 'Investigating 503 errors from payment provider',
        author: { name: 'Demo User' },
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
  },
  {
    id: 'inc_2',
    projectId: 'proj_1',
    monitorId: 'mon_1',
    title: 'API Latency Degradation',
    description: 'API response times increased from ~50ms to ~500ms. Root cause identified as database connection pool exhaustion.',
    status: 'identified',
    severity: 'major',
    startedAt: new Date(Date.now() - 7200000),
    acknowledgedAt: new Date(Date.now() - 7000000),
    resolvedAt: null,
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 6800000),
    monitor: { name: 'API Health Check' },
    project: { name: 'Production API', color: '#10B981' },
    affectedMonitors: ['mon_1'],
    updates: [
      {
        id: 'upd_2',
        incidentId: 'inc_2',
        status: 'investigating',
        message: 'Investigating elevated API response times',
        author: { name: 'Demo User' },
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        id: 'upd_3',
        incidentId: 'inc_2',
        status: 'identified',
        message: 'Root cause: database connection pool exhaustion',
        author: { name: 'Demo User' },
        createdAt: new Date(Date.now() - 6800000),
      },
    ],
  },
  {
    id: 'inc_3',
    projectId: 'proj_2',
    monitorId: 'mon_4',
    title: 'Homepage Brief Outage',
    description: 'Homepage returned 502 for 3 minutes. CDN configuration issue resolved.',
    status: 'resolved',
    severity: 'minor',
    startedAt: new Date(Date.now() - 86400000),
    acknowledgedAt: new Date(Date.now() - 86300000),
    resolvedAt: new Date(Date.now() - 86100000),
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86100000),
    monitor: { name: 'Homepage' },
    project: { name: 'Marketing Website', color: '#3B82F6' },
    affectedMonitors: ['mon_4'],
    updates: [],
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    projectId: 'proj_1',
    monitorId: 'mon_3',
    type: 'down',
    message: 'Payment Gateway is down (503 Service Unavailable)',
    acknowledged: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'alert_2',
    projectId: 'proj_1',
    monitorId: 'mon_1',
    type: 'degraded',
    message: 'API Health Check latency degraded: 500ms (threshold: 200ms)',
    acknowledged: true,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'alert_3',
    projectId: 'proj_2',
    monitorId: 'mon_4',
    type: 'recovery',
    message: 'Homepage has recovered and is now responding normally',
    acknowledged: false,
    createdAt: new Date(Date.now() - 86100000),
  },
  {
    id: 'alert_4',
    projectId: 'proj_1',
    monitorId: 'mon_2',
    type: 'ssl_expiring',
    message: 'SSL certificate for api.example.com expires in 14 days',
    acknowledged: false,
    createdAt: new Date(Date.now() - 172800000),
  },
];

export const mockStatusPages: StatusPage[] = [
  {
    id: 'sp_1',
    projectId: 'proj_1',
    slug: 'status-api',
    title: 'Production API Status',
    description: 'Real-time status of production API services',
    customDomain: 'status.api.example.com',
    public: true,
    monitorIds: ['mon_1', 'mon_2', 'mon_3'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'sp_2',
    projectId: 'proj_2',
    slug: 'status-web',
    title: 'Website Status',
    description: 'Status of marketing website and landing pages',
    customDomain: null,
    public: true,
    monitorIds: ['mon_4', 'mon_5'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const mockTeams: Team[] = [
  {
    id: 'team_1',
    name: 'Engineering',
    slug: 'engineering',
    ownerId: 'user_1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm_1',
    teamId: 'team_1',
    userId: 'user_1',
    role: 'owner',
    createdAt: new Date('2024-01-15'),
  },
];

export const mockApiKeys: ApiKey[] = [
  {
    id: 'key_1',
    projectId: 'proj_1',
    name: 'CI/CD Deployment Key',
    key: 'dp_live_••••••••••••••••',
    hashedKey: 'hashed_key_1',
    lastUsed: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 7776000000),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'key_2',
    projectId: 'proj_1',
    name: 'Monitoring Integration',
    key: 'dp_live_••••••••••••••••',
    hashedKey: 'hashed_key_2',
    lastUsed: new Date(Date.now() - 86400000),
    expiresAt: null,
    createdAt: new Date('2024-02-01'),
  },
];

export const mockWebhooks: Webhook[] = [
  {
    id: 'wh_1',
    projectId: 'proj_1',
    url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
    events: ['monitor.down', 'incident.created', 'incident.resolved'],
    secret: 'whsec_••••••••••••••••',
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'wh_2',
    projectId: 'proj_1',
    url: 'https://api.pagerduty.com/integration/xxx/enqueue',
    events: ['monitor.down', 'incident.created'],
    secret: 'whsec_••••••••••••••••',
    active: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const generateMockUptimeData = (monitorId: string, period: 'hour' | 'day' | 'week' | 'month' | 'year'): UptimeData[] => {
  const data: UptimeData[] = [];
  let intervals: number;

  switch (period) {
    case 'hour':
      intervals = 60;
      break;
    case 'day':
      intervals = 24;
      break;
    case 'week':
      intervals = 7;
      break;
    case 'month':
      intervals = 30;
      break;
    case 'year':
      intervals = 12;
      break;
  }

  for (let i = intervals - 1; i >= 0; i--) {
    const uptime = 99 + Math.random() * 1;
    data.push({
      monitorId,
      period,
      uptime: Math.min(100, uptime),
      totalChecks: Math.floor(Math.random() * 100) + 50,
      successfulChecks: Math.floor(Math.random() * 100) + 45,
      avgLatency: Math.floor(Math.random() * 200) + 20,
    });
  }

  return data;
};

export const generateLatencyData = (hours: number): { time: string; latency: number; timestamp: number }[] => {
  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    data.push({
      time: time.toISOString(),
      latency: Math.floor(Math.random() * 200) + 20,
      timestamp: time.getTime(),
    });
  }
  return data;
};

export const monitorTypes: { value: MonitorType; label: string; description: string }[] = [
  { value: 'http', label: 'HTTP', description: 'Check HTTP endpoint (non-SSL)' },
  { value: 'https', label: 'HTTPS', description: 'Check HTTPS endpoint with SSL verification' },
  { value: 'tcp', label: 'TCP Port', description: 'Check TCP port connectivity' },
  { value: 'ping', label: 'Ping/ICMP', description: 'Check host reachability via ICMP' },
  { value: 'keyword', label: 'Keyword', description: 'Check for keyword in HTTP response' },
  { value: 'dns', label: 'DNS', description: 'Check DNS resolution' },
  { value: 'ssl', label: 'SSL Certificate', description: 'Check SSL certificate validity and expiry' },
];

export const monitorIntervals = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
];

export const statusOptions = [
  { value: 'up', label: 'Up', color: 'green' },
  { value: 'down', label: 'Down', color: 'red' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'maintenance', label: 'Maintenance', color: 'blue' },
];

export const incidentStatuses: { value: IncidentStatus; label: string }[] = [
  { value: 'investigating', label: 'Investigating' },
  { value: 'identified', label: 'Identified' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'resolved', label: 'Resolved' },
];

export const incidentSeverities: { value: IncidentSeverity; label: string }[] = [
  { value: 'minor', label: 'Minor' },
  { value: 'major', label: 'Major' },
  { value: 'critical', label: 'Critical' },
];

export const alertTypes: { value: AlertType; label: string }[] = [
  { value: 'down', label: 'Monitor Down' },
  { value: 'degraded', label: 'Performance Degraded' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'ssl_expiring', label: 'SSL Expiring' },
  { value: 'domain_expiring', label: 'Domain Expiring' },
];

export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    monitors: 10,
    checksPerMinute: 1,
    teamMembers: 1,
    statusPages: 1,
    apiAccess: false,
    webhooks: 0,
    incidentManagement: false,
    customDomain: false,
    sso: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    monitors: 50,
    checksPerMinute: 5,
    teamMembers: 5,
    statusPages: 3,
    apiAccess: true,
    webhooks: 10,
    incidentManagement: true,
    customDomain: true,
    sso: false,
  },
  {
    id: 'team',
    name: 'Team',
    price: 99,
    interval: 'month',
    monitors: 200,
    checksPerMinute: 20,
    teamMembers: 20,
    statusPages: 10,
    apiAccess: true,
    webhooks: 50,
    incidentManagement: true,
    customDomain: true,
    sso: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    monitors: 1000,
    checksPerMinute: 100,
    teamMembers: 100,
    statusPages: 50,
    apiAccess: true,
    webhooks: 200,
    incidentManagement: true,
    customDomain: true,
    sso: true,
  },
];

export const monitors = mockMonitors;
export const incidents = mockIncidents;
