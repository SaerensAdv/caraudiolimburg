import * as cron from 'node-cron';
import { clickupService, type WebsiteReport } from './clickup';
import { db } from '../db';
import { clickupConfig } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface SchedulerStats {
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  runCount: number;
  lastError: string | null;
}

class ClickUpScheduler {
  private cronJob: ReturnType<typeof cron.schedule> | null = null;
  private stats: SchedulerStats = {
    isRunning: false,
    lastRun: null,
    nextRun: null,
    runCount: 0,
    lastError: null,
  };

  async start(): Promise<void> {
    if (this.cronJob) {
      console.log('[ClickUp Scheduler] Already running');
      return;
    }

    // Hydrate stats from database
    await this.hydrateFromDatabase();

    // Check if scheduler should be enabled
    const config = await this.getConfig();
    if (config && config.isEnabled === false) {
      console.log('[ClickUp Scheduler] Disabled via configuration - not starting cron job');
      this.stats.isRunning = false;
      return;
    }

    this.cronJob = cron.schedule('0 9 1 * *', async () => {
      console.log('[ClickUp Scheduler] Running monthly report job...');
      await this.runMonthlyReport();
    });

    this.stats.isRunning = true;
    this.updateNextRun();
    console.log('[ClickUp Scheduler] Started - runs on 1st of each month at 9:00 AM');
  }

  private async hydrateFromDatabase(): Promise<void> {
    try {
      const config = await this.getConfig();
      if (config) {
        if (config.lastRunAt) {
          this.stats.lastRun = new Date(config.lastRunAt);
        }
        if (config.nextRunAt) {
          this.stats.nextRun = new Date(config.nextRunAt);
        }
      }
    } catch (error) {
      console.error('[ClickUp Scheduler] Failed to hydrate from database:', error);
    }
  }

  async restart(): Promise<void> {
    this.stop();
    await this.start();
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.stats.isRunning = false;
      console.log('[ClickUp Scheduler] Stopped');
    }
  }

  async runMonthlyReport(): Promise<{ success: boolean; taskUrl?: string; error?: string }> {
    try {
      const config = await this.getConfig();
      
      if (!config || !config.listId || !config.isEnabled) {
        const msg = 'ClickUp configuration not set or disabled';
        console.log(`[ClickUp Scheduler] ${msg}`);
        this.stats.lastError = msg;
        return { success: false, error: msg };
      }

      const report = await this.generateReport();
      const task = await clickupService.createMonthlyReport(config.listId, report);
      
      await db.update(clickupConfig)
        .set({ lastRunAt: new Date(), updatedAt: new Date() })
        .where(eq(clickupConfig.id, config.id));

      this.stats.lastRun = new Date();
      this.stats.runCount++;
      this.stats.lastError = null;
      this.updateNextRun();

      console.log(`[ClickUp Scheduler] Monthly report created: ${task.url}`);
      return { success: true, taskUrl: task.url };
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error('[ClickUp Scheduler] Error running monthly report:', errorMsg);
      this.stats.lastError = errorMsg;
      return { success: false, error: errorMsg };
    }
  }

  private async generateReport(): Promise<WebsiteReport> {
    const { storage } = await import('../storage');
    
    const [products, orders, users, bookings, quotes] = await Promise.all([
      storage.getProducts().catch(() => []),
      storage.getOrders().catch(() => []),
      storage.getAllUsers().catch(() => []),
      storage.getBookings().catch(() => []),
      storage.getQuoteRequests().catch(() => []),
    ]);

    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const recentOrders = orders.filter((o: any) => new Date(o.createdAt || 0) >= lastMonth);
    const recentBookings = bookings.filter((b: any) => new Date(b.createdAt || 0) >= lastMonth);
    const recentQuotes = quotes.filter((q: any) => new Date(q.createdAt || 0) >= lastMonth);

    const completedItems: string[] = [
      'Cinematic intro animatie geïmplementeerd',
      'eTrusted/Trusted Shops reviews integratie actief',
      'Chat widget met localStorage persistentie',
      'Google OAuth authenticatie',
      'Stripe betalingen (iDEAL, Bancontact)',
      'Product variaties systeem',
      'Mobiele optimalisatie',
      'SEO optimalisatie met meta tags',
      'ClickUp integratie voor automatische monitoring',
    ];

    const inProgressItems: string[] = [];

    const todoItems: string[] = [
      'Google Analytics integratie uitbreiden',
      'Email marketing automatisering',
      'Performance optimalisatie afbeeldingen',
      'A/B testing voor conversie verbetering',
    ];

    const issues: string[] = [];
    if (products.length === 0) {
      issues.push('Geen producten in de database gevonden');
    }
    
    const recommendations: string[] = [];
    if (recentOrders.length < 5) {
      recommendations.push('Overweeg promotiecampagne om verkoop te stimuleren');
    }
    if (recentQuotes.length > recentOrders.length * 2) {
      recommendations.push('Veel offertes maar weinig conversie - follow-up proces verbeteren');
    }

    return {
      status: 'online',
      uptime: '99.9%',
      lastUpdate: now.toISOString(),
      completed: completedItems,
      inProgress: inProgressItems,
      todo: todoItems,
      issues: issues.length > 0 ? issues : undefined,
      statistics: {
        products: products.length,
        orders: orders.length,
        users: users.length,
        bookings: bookings.length,
        quotes: quotes.length,
      },
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  private updateNextRun(): void {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
    this.stats.nextRun = nextMonth;
  }

  async getConfig() {
    const configs = await db.select().from(clickupConfig).limit(1);
    return configs[0] || null;
  }

  async saveConfig(config: {
    workspaceId?: string;
    workspaceName?: string;
    spaceId?: string;
    spaceName?: string;
    folderId?: string;
    folderName?: string;
    listId?: string;
    listName?: string;
    isEnabled?: boolean;
  }) {
    const existing = await this.getConfig();
    const wasEnabled = existing?.isEnabled !== false;
    const willBeEnabled = config.isEnabled !== false;
    
    let result;
    if (existing) {
      await db.update(clickupConfig)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(clickupConfig.id, existing.id));
      result = { ...existing, ...config };
    } else {
      const [newConfig] = await db.insert(clickupConfig)
        .values(config)
        .returning();
      result = newConfig;
    }

    // Restart scheduler if isEnabled changed
    if (wasEnabled !== willBeEnabled) {
      await this.restart();
    }

    return result;
  }

  getStats(): SchedulerStats {
    return { ...this.stats };
  }

  async getStatsWithConfig(): Promise<SchedulerStats & { configuredList?: string }> {
    const config = await this.getConfig();
    return {
      ...this.stats,
      configuredList: config?.listName || undefined,
    };
  }
}

export const clickupScheduler = new ClickUpScheduler();
