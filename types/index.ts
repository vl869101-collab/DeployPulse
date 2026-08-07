export type MonitorType = 'http' | 'cron' | 'webhook' | 'health' | 'background-job';

export type MonitorStatus = 'healthy' | 'warning' | 'error' | 'disabled' | 'pending';

export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'info';

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export type AlertChannelType = 'email' | 'slack' | 'pagerduty' | 'webhook' | 'sms' | 'discord';

export interface Monitor {
  id: string;
  name: string;
  url: string;
  type: MonitorType;
  status: MonitorStatus;
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  lastCheck: Date;
  nextCheck: Date;
  interval: number;
  projectId: string;
  project: Project;
  tags: string[];
  timeout: number;
  retries: number;
  regions: string[];
  headers?: Record<string, string>;
  expectedStatusCodes?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  monitorId: string;
  monitor?: Monitor;
  projectId: string;
  project?: Project;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  updates: IncidentUpdate[];
  affectedMonitors: string[];
  metadata?: Record<string, unknown>;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  message: string;
  status: IncidentStatus;
  createdAt: Date;
  author: User;
  authorId: string;
}

export interface AlertChannel {
  id: string;
  type: AlertChannelType;
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  projectId: string;
  project?: Project;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  members: User[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckResult {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  latency: number;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  region: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterState {
  status?: MonitorStatus[];
  type?: MonitorType[];
  project?: string[];
  search?: string;
  dateRange?: { from: Date; to: Date };
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}