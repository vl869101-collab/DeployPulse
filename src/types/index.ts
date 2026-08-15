export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Monitor {
  id: string;
  projectId: string;
  name: string;
  url: string;
  type: MonitorType;
  interval: number;
  timeout: number;
  retries: number;
  status: MonitorStatus;
  lastCheck: Date | null;
  lastStatusCode: number | null;
  lastLatency: number | null;
  uptime: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  project?: { name: string; color: string };
  regions?: string[];
  headers?: Record<string, string>;
  expectedStatusCodes?: number[];
  uptime24h?: number;
  uptime7d?: number;
  uptime30d?: number;
}

export type MonitorType = 'http' | 'https' | 'tcp' | 'ping' | 'keyword' | 'dns' | 'ssl' | 'cron' | 'webhook' | 'health' | 'background-job';
export type MonitorStatus = 'up' | 'down' | 'pending' | 'maintenance' | 'degraded' | 'disabled';

export interface Check {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  statusCode: number | null;
  latency: number | null;
  error: string | null;
  checkedAt: Date;
  region?: string;
  timestamp?: Date;
}

export type CheckResult = Check;

export interface Incident {
  id: string;
  projectId: string;
  monitorId: string | null;
  title: string;
  description: string | null;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  monitor?: { name: string };
  project?: { name: string; color: string };
  updates?: IncidentUpdate[];
  affectedMonitors?: string[];
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  message: string;
  author: { name: string };
  createdAt: Date;
}

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type IncidentSeverity = 'minor' | 'major' | 'critical' | 'info';

export interface Alert {
  id: string;
  projectId: string;
  monitorId: string;
  type: AlertType;
  message: string;
  acknowledged: boolean;
  createdAt: Date;
}

export type AlertType = 'down' | 'degraded' | 'recovery' | 'ssl_expiring' | 'domain_expiring';

export interface StatusPage {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  description: string | null;
  customDomain: string | null;
  public: boolean;
  monitorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  createdAt: Date;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface ApiKey {
  id: string;
  projectId: string;
  name: string;
  key: string;
  hashedKey: string;
  lastUsed: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface Webhook {
  id: string;
  projectId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEvent =
  | 'monitor.up'
  | 'monitor.down'
  | 'monitor.degraded'
  | 'incident.created'
  | 'incident.acknowledged'
  | 'incident.resolved'
  | 'alert.created';

export interface UptimeData {
  monitorId: string;
  period: 'hour' | 'day' | 'week' | 'month' | 'year';
  uptime: number;
  totalChecks: number;
  successfulChecks: number;
  avgLatency: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type DeploymentStatus = 'ready' | 'building' | 'queued' | 'canceled' | 'errored';
export type DeploymentEnvironment = 'production' | 'preview' | 'development';

export interface Deployment {
  id: string;
  projectId: string;
  name: string;
  commitMessage: string;
  commitHash: string;
  branch: string;
  author: string;
  authorEmail: string;
  status: DeploymentStatus;
  environment: DeploymentEnvironment;
  url: string;
  createdAt: Date;
  readyAt: Date | null;
  duration: number | null;
  buildLogs: string[];
  error?: string;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  statusCode: number;
  method: string;
  host: string;
  path: string;
  message: string;
  latency: number | null;
  region: string;
  userAgent: string;
  ip: string;
}
