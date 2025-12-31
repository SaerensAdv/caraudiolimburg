import * as cron from 'node-cron';
import { db } from '../db';
import { blogPosts } from '@shared/schema';
import { eq, lte, and } from 'drizzle-orm';

class BlogScheduler {
  private cronJob: ReturnType<typeof cron.schedule> | null = null;

  start(): void {
    if (this.cronJob) {
      console.log('[Blog Scheduler] Already running');
      return;
    }

    this.cronJob = cron.schedule('0 * * * *', async () => {
      await this.publishScheduledPosts();
    });

    console.log('[Blog Scheduler] Started - checks every hour for scheduled posts');
    
    this.publishScheduledPosts();
  }

  async publishScheduledPosts(): Promise<number> {
    try {
      const now = new Date();
      
      const scheduledPosts = await db
        .select()
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.status, 'draft'),
            lte(blogPosts.publishedAt, now)
          )
        );

      if (scheduledPosts.length === 0) {
        return 0;
      }

      for (const post of scheduledPosts) {
        await db
          .update(blogPosts)
          .set({ status: 'published' })
          .where(eq(blogPosts.id, post.id));
        
        console.log(`[Blog Scheduler] Published: ${post.title}`);
      }

      console.log(`[Blog Scheduler] Published ${scheduledPosts.length} scheduled post(s)`);
      return scheduledPosts.length;
    } catch (error) {
      console.error('[Blog Scheduler] Error publishing scheduled posts:', error);
      return 0;
    }
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('[Blog Scheduler] Stopped');
    }
  }
}

export const blogScheduler = new BlogScheduler();
