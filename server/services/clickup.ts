interface ClickUpWorkspace {
  id: string;
  name: string;
  color: string;
  avatar: string | null;
  members: { user: { id: number; username: string; email: string } }[];
}

interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
  statuses: { id: string; status: string; color: string; orderindex: number }[];
  multiple_assignees: boolean;
  features: Record<string, { enabled: boolean }>;
}

interface ClickUpFolder {
  id: string;
  name: string;
  orderindex: number;
  override_statuses: boolean;
  hidden: boolean;
  space: { id: string; name: string };
  task_count: string;
  lists: ClickUpList[];
}

interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  content: string;
  status: { status: string; color: string; hide_label: boolean };
  priority: { priority: string; color: string } | null;
  assignee: { id: number; username: string; email: string } | null;
  task_count: number | null;
  due_date: string | null;
  start_date: string | null;
  folder: { id: string; name: string; hidden: boolean; access: boolean };
  space: { id: string; name: string; access: boolean };
  archived: boolean;
  override_statuses: boolean;
  permission_level: string;
}

interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator?: number;
}

interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config: Record<string, unknown>;
  date_created: string;
  hide_from_guests: boolean;
  required: boolean;
}

interface ClickUpTask {
  id: string;
  custom_id: string | null;
  name: string;
  text_content: string;
  description: string;
  status: { id: string; status: string; color: string; orderindex: number; type: string };
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  date_done: string | null;
  archived: boolean;
  creator: { id: number; username: string; email: string };
  assignees: { id: number; username: string; email: string }[];
  watchers: { id: number; username: string; email: string }[];
  checklists: unknown[];
  tags: ClickUpTag[];
  parent: string | null;
  priority: { id: string; priority: string; color: string; orderindex: string } | null;
  due_date: string | null;
  start_date: string | null;
  points: number | null;
  time_estimate: number | null;
  time_spent: number | null;
  custom_fields: { id: string; name: string; type: string; value: unknown }[];
  dependencies: unknown[];
  linked_tasks: unknown[];
  team_id: string;
  url: string;
  list: { id: string; name: string; access: boolean };
  project: { id: string; name: string; hidden: boolean; access: boolean };
  folder: { id: string; name: string; hidden: boolean; access: boolean };
  space: { id: string };
}

interface CreateTaskPayload {
  name: string;
  description?: string;
  markdown_description?: string;
  assignees?: number[];
  tags?: string[];
  status?: string;
  priority?: number;
  due_date?: number;
  due_date_time?: boolean;
  time_estimate?: number;
  start_date?: number;
  start_date_time?: boolean;
  notify_all?: boolean;
  parent?: string | null;
  links_to?: string | null;
  check_required_custom_fields?: boolean;
  custom_fields?: { id: string; value: unknown }[];
}

const DEFAULT_TAGS = {
  status: [
    { name: 'voltooid', tag_bg: '#22c55e', tag_fg: '#ffffff' },
    { name: 'in-uitvoering', tag_bg: '#3b82f6', tag_fg: '#ffffff' },
    { name: 'gepland', tag_bg: '#a855f7', tag_fg: '#ffffff' },
    { name: 'wachtend', tag_bg: '#f59e0b', tag_fg: '#000000' },
    { name: 'geblokkeerd', tag_bg: '#ef4444', tag_fg: '#ffffff' },
  ],
  category: [
    { name: 'feature', tag_bg: '#06b6d4', tag_fg: '#ffffff' },
    { name: 'bug-fix', tag_bg: '#ef4444', tag_fg: '#ffffff' },
    { name: 'verbetering', tag_bg: '#8b5cf6', tag_fg: '#ffffff' },
    { name: 'onderhoud', tag_bg: '#64748b', tag_fg: '#ffffff' },
    { name: 'security', tag_bg: '#dc2626', tag_fg: '#ffffff' },
    { name: 'performance', tag_bg: '#14b8a6', tag_fg: '#ffffff' },
  ],
  priority: [
    { name: 'kritiek', tag_bg: '#dc2626', tag_fg: '#ffffff' },
    { name: 'hoog', tag_bg: '#f97316', tag_fg: '#ffffff' },
    { name: 'medium', tag_bg: '#eab308', tag_fg: '#000000' },
    { name: 'laag', tag_bg: '#22c55e', tag_fg: '#ffffff' },
  ],
  area: [
    { name: 'frontend', tag_bg: '#3b82f6', tag_fg: '#ffffff' },
    { name: 'backend', tag_bg: '#10b981', tag_fg: '#ffffff' },
    { name: 'database', tag_bg: '#f59e0b', tag_fg: '#000000' },
    { name: 'api', tag_bg: '#8b5cf6', tag_fg: '#ffffff' },
    { name: 'ui-ux', tag_bg: '#ec4899', tag_fg: '#ffffff' },
    { name: 'seo', tag_bg: '#06b6d4', tag_fg: '#ffffff' },
    { name: 'analytics', tag_bg: '#6366f1', tag_fg: '#ffffff' },
    { name: 'betalingen', tag_bg: '#059669', tag_fg: '#ffffff' },
    { name: 'auth', tag_bg: '#7c3aed', tag_fg: '#ffffff' },
  ],
  monitoring: [
    { name: 'maandrapport', tag_bg: '#d0a760', tag_fg: '#000000' },
    { name: 'weekrapport', tag_bg: '#d0a760', tag_fg: '#000000' },
    { name: 'automatisch', tag_bg: '#64748b', tag_fg: '#ffffff' },
    { name: 'handmatig', tag_bg: '#475569', tag_fg: '#ffffff' },
  ],
};

class ClickUpService {
  private apiKey: string;
  private baseUrl = 'https://api.clickup.com/api/v2';

  constructor() {
    this.apiKey = process.env.CLICKUP_API_KEY || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('CLICKUP_API_KEY is not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ClickUp API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getWorkspaces(): Promise<{ teams: ClickUpWorkspace[] }> {
    return this.request('/team');
  }

  async getSpaces(workspaceId: string): Promise<{ spaces: ClickUpSpace[] }> {
    return this.request(`/team/${workspaceId}/space?archived=false`);
  }

  async getFolders(spaceId: string): Promise<{ folders: ClickUpFolder[] }> {
    return this.request(`/space/${spaceId}/folder?archived=false`);
  }

  async getLists(folderId: string): Promise<{ lists: ClickUpList[] }> {
    return this.request(`/folder/${folderId}/list?archived=false`);
  }

  async getFolderlessLists(spaceId: string): Promise<{ lists: ClickUpList[] }> {
    return this.request(`/space/${spaceId}/list?archived=false`);
  }

  async getList(listId: string): Promise<ClickUpList> {
    return this.request(`/list/${listId}`);
  }

  async getTasks(listId: string, options?: { archived?: boolean; subtasks?: boolean; include_closed?: boolean }): Promise<{ tasks: ClickUpTask[] }> {
    const params = new URLSearchParams();
    if (options?.archived !== undefined) params.append('archived', String(options.archived));
    if (options?.subtasks !== undefined) params.append('subtasks', String(options.subtasks));
    if (options?.include_closed !== undefined) params.append('include_closed', String(options.include_closed));
    
    return this.request(`/list/${listId}/task?${params.toString()}`);
  }

  async getTask(taskId: string): Promise<ClickUpTask> {
    return this.request(`/task/${taskId}`);
  }

  async createTask(listId: string, payload: CreateTaskPayload): Promise<ClickUpTask> {
    return this.request(`/list/${listId}/task`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTask(taskId: string, payload: Partial<CreateTaskPayload>): Promise<ClickUpTask> {
    return this.request(`/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getSpaceTags(spaceId: string): Promise<{ tags: ClickUpTag[] }> {
    return this.request(`/space/${spaceId}/tag`);
  }

  async createSpaceTag(spaceId: string, tag: { name: string; tag_bg: string; tag_fg: string }): Promise<void> {
    await this.request(`/space/${spaceId}/tag`, {
      method: 'POST',
      body: JSON.stringify({ tag }),
    });
  }

  async addTagToTask(taskId: string, tagName: string): Promise<void> {
    await this.request(`/task/${taskId}/tag/${encodeURIComponent(tagName)}`, {
      method: 'POST',
    });
  }

  async getCustomFields(listId: string): Promise<{ fields: ClickUpCustomField[] }> {
    return this.request(`/list/${listId}/field`);
  }

  async setCustomFieldValue(taskId: string, fieldId: string, value: unknown): Promise<void> {
    await this.request(`/task/${taskId}/field/${fieldId}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  async setupDefaultTags(spaceId: string): Promise<{ created: string[]; existing: string[] }> {
    const { tags: existingTags } = await this.getSpaceTags(spaceId);
    const existingNames = new Set(existingTags.map(t => t.name.toLowerCase()));
    
    const created: string[] = [];
    const existing: string[] = [];

    const allTags = [
      ...DEFAULT_TAGS.status,
      ...DEFAULT_TAGS.category,
      ...DEFAULT_TAGS.priority,
      ...DEFAULT_TAGS.area,
      ...DEFAULT_TAGS.monitoring,
    ];

    for (const tag of allTags) {
      if (existingNames.has(tag.name.toLowerCase())) {
        existing.push(tag.name);
      } else {
        try {
          await this.createSpaceTag(spaceId, tag);
          created.push(tag.name);
        } catch (error) {
          console.error(`Failed to create tag ${tag.name}:`, error);
        }
      }
    }

    return { created, existing };
  }

  async createMonthlyReport(listId: string, reportData: WebsiteReport): Promise<ClickUpTask> {
    const now = new Date();
    const monthName = now.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });
    
    const taskPayload: CreateTaskPayload = {
      name: `🌐 Website Rapport - ${monthName}`,
      markdown_description: this.generateReportMarkdown(reportData),
      tags: ['maandrapport', 'automatisch'],
      priority: 3,
      due_date: now.getTime() + (7 * 24 * 60 * 60 * 1000),
    };

    return this.createTask(listId, taskPayload);
  }

  private generateReportMarkdown(report: WebsiteReport): string {
    const sections: string[] = [];

    sections.push(`# 📊 Maandelijks Website Rapport`);
    sections.push(`**Gegenereerd:** ${new Date().toLocaleString('nl-NL')}`);
    sections.push(`**Website:** Car Audio Limburg`);
    sections.push('');

    sections.push('---');
    sections.push('');

    sections.push('## 🎯 Samenvatting');
    sections.push(`- **Status:** ${report.status}`);
    sections.push(`- **Uptime:** ${report.uptime || 'N/A'}`);
    sections.push(`- **Laatste update:** ${report.lastUpdate || 'N/A'}`);
    sections.push('');

    sections.push('## ✅ Voltooide Taken');
    if (report.completed.length > 0) {
      report.completed.forEach(item => {
        sections.push(`- ${item}`);
      });
    } else {
      sections.push('- Geen nieuwe voltooide taken deze periode');
    }
    sections.push('');

    sections.push('## 🔄 In Uitvoering');
    if (report.inProgress.length > 0) {
      report.inProgress.forEach(item => {
        sections.push(`- ${item}`);
      });
    } else {
      sections.push('- Geen actieve taken');
    }
    sections.push('');

    sections.push('## 📋 Gepland / Te Doen');
    if (report.todo.length > 0) {
      report.todo.forEach(item => {
        sections.push(`- ${item}`);
      });
    } else {
      sections.push('- Geen geplande taken');
    }
    sections.push('');

    if (report.issues && report.issues.length > 0) {
      sections.push('## ⚠️ Aandachtspunten');
      report.issues.forEach(item => {
        sections.push(`- ${item}`);
      });
      sections.push('');
    }

    if (report.statistics) {
      sections.push('## 📈 Statistieken');
      if (report.statistics.products !== undefined) {
        sections.push(`- **Producten:** ${report.statistics.products}`);
      }
      if (report.statistics.orders !== undefined) {
        sections.push(`- **Bestellingen:** ${report.statistics.orders}`);
      }
      if (report.statistics.users !== undefined) {
        sections.push(`- **Gebruikers:** ${report.statistics.users}`);
      }
      if (report.statistics.bookings !== undefined) {
        sections.push(`- **Boekingen:** ${report.statistics.bookings}`);
      }
      if (report.statistics.quotes !== undefined) {
        sections.push(`- **Offertes:** ${report.statistics.quotes}`);
      }
      sections.push('');
    }

    if (report.recommendations && report.recommendations.length > 0) {
      sections.push('## 💡 Aanbevelingen');
      report.recommendations.forEach(item => {
        sections.push(`- ${item}`);
      });
      sections.push('');
    }

    sections.push('---');
    sections.push('*Dit rapport is automatisch gegenereerd door het Car Audio Limburg monitoring systeem.*');

    return sections.join('\n');
  }

  getDefaultTags() {
    return DEFAULT_TAGS;
  }
}

export interface WebsiteReport {
  status: 'online' | 'offline' | 'degraded';
  uptime?: string;
  lastUpdate?: string;
  completed: string[];
  inProgress: string[];
  todo: string[];
  issues?: string[];
  statistics?: {
    products?: number;
    orders?: number;
    users?: number;
    bookings?: number;
    quotes?: number;
  };
  recommendations?: string[];
}

export const clickupService = new ClickUpService();
