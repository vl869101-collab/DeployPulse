import { PaginatedResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string) {
    return this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Projects
  async getProjects(page = 1, limit = 10) {
    return this.request<PaginatedResponse<any>>(`/projects?page=${page}&limit=${limit}`);
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async createProject(data: { name: string; description?: string }) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<{ name: string; description: string }>) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  // Monitors
  async getMonitors(projectId: string, page = 1, limit = 10) {
    return this.request<PaginatedResponse<any>>(`/projects/${projectId}/monitors?page=${page}&limit=${limit}`);
  }

  async getMonitor(id: string) {
    return this.request<any>(`/monitors/${id}`);
  }

  async createMonitor(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/monitors`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMonitor(id: string, data: any) {
    return this.request<any>(`/monitors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMonitor(id: string) {
    return this.request<void>(`/monitors/${id}`, { method: 'DELETE' });
  }

  async triggerCheck(id: string) {
    return this.request<any>(`/monitors/${id}/check`, { method: 'POST' });
  }

  async getMonitorChecks(monitorId: string, page = 1, limit = 50) {
    return this.request<PaginatedResponse<any>>(`/monitors/${monitorId}/checks?page=${page}&limit=${limit}`);
  }

  async getUptimeData(monitorId: string, period: string) {
    return this.request<any>(`/monitors/${monitorId}/uptime?period=${period}`);
  }

  // Incidents
  async getIncidents(projectId: string, page = 1, limit = 10) {
    return this.request<PaginatedResponse<any>>(`/projects/${projectId}/incidents?page=${page}&limit=${limit}`);
  }

  async getIncident(id: string) {
    return this.request<any>(`/incidents/${id}`);
  }

  async createIncident(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/incidents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIncident(id: string, data: any) {
    return this.request<any>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async acknowledgeIncident(id: string) {
    return this.request<any>(`/incidents/${id}/acknowledge`, { method: 'POST' });
  }

  async resolveIncident(id: string) {
    return this.request<any>(`/incidents/${id}/resolve`, { method: 'POST' });
  }

  // Alerts
  async getAlerts(projectId: string, page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/projects/${projectId}/alerts?page=${page}&limit=${limit}`);
  }

  async acknowledgeAlert(id: string) {
    return this.request<any>(`/alerts/${id}/acknowledge`, { method: 'POST' });
  }

  // Status Pages
  async getStatusPages(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/status-pages`);
  }

  async getStatusPage(slug: string) {
    return this.request<any>(`/status-pages/${slug}`);
  }

  async createStatusPage(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/status-pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStatusPage(id: string, data: any) {
    return this.request<any>(`/status-pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Teams
  async getTeams() {
    return this.request<any[]>('/teams');
  }

  async getTeam(id: string) {
    return this.request<any>(`/teams/${id}`);
  }

  async createTeam(data: { name: string }) {
    return this.request<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async inviteMember(teamId: string, email: string, role: string) {
    return this.request<any>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async updateMemberRole(teamId: string, memberId: string, role: string) {
    return this.request<any>(`/teams/${teamId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async removeMember(teamId: string, memberId: string) {
    return this.request<void>(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' });
  }

  // API Keys
  async getApiKeys(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/api-keys`);
  }

  async createApiKey(projectId: string, data: { name: string; expiresAt?: string }) {
    return this.request<any>(`/projects/${projectId}/api-keys`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeApiKey(id: string) {
    return this.request<void>(`/api-keys/${id}`, { method: 'DELETE' });
  }

  // Webhooks
  async getWebhooks(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/webhooks`);
  }

  async createWebhook(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/webhooks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWebhook(id: string, data: any) {
    return this.request<any>(`/webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWebhook(id: string) {
    return this.request<void>(`/webhooks/${id}`, { method: 'DELETE' });
  }

  // Billing
  async getSubscription() {
    return this.request<any>('/billing/subscription');
  }

  async createCheckoutSession(planId: string) {
    return this.request<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async createPortalSession() {
    return this.request<{ url: string }>('/billing/portal', { method: 'POST' });
  }
}

export const api = new ApiClient();

// React Query keys
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (page: number, limit: number) => ['projects', 'list', page, limit] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
  monitors: {
    list: (projectId: string, page: number, limit: number) => ['monitors', 'list', projectId, page, limit] as const,
    detail: (id: string) => ['monitors', 'detail', id] as const,
    checks: (monitorId: string, page: number, limit: number) => ['monitors', 'checks', monitorId, page, limit] as const,
    uptime: (monitorId: string, period: string) => ['monitors', 'uptime', monitorId, period] as const,
  },
  incidents: {
    list: (projectId: string, page: number, limit: number) => ['incidents', 'list', projectId, page, limit] as const,
    detail: (id: string) => ['incidents', 'detail', id] as const,
  },
  alerts: {
    list: (projectId: string, page: number, limit: number) => ['alerts', 'list', projectId, page, limit] as const,
  },
  statusPages: {
    list: (projectId: string) => ['statusPages', 'list', projectId] as const,
    detail: (slug: string) => ['statusPages', 'detail', slug] as const,
  },
  teams: {
    all: ['teams'] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
  },
  apiKeys: {
    list: (projectId: string) => ['apiKeys', 'list', projectId] as const,
  },
  webhooks: {
    list: (projectId: string) => ['webhooks', 'list', projectId] as const,
  },
  billing: {
    subscription: ['billing', 'subscription'] as const,
  },
};