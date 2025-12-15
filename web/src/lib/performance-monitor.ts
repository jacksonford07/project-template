import { prisma } from './prisma';

interface PerformanceContext {
  context: string;
  operation: string;
  duration: number;
  route?: string;
  method?: string;
  userId?: string;
  statusCode?: number;
  cached?: boolean;
}

export class PerformanceMonitor {
  static async record(data: PerformanceContext): Promise<void> {
    try {
      await prisma.performanceMetric.create({
        data: {
          route: data.route ?? data.context,
          method: data.method ?? 'GET',
          duration: data.duration,
          userId: data.userId,
          statusCode: data.statusCode ?? 200,
          cached: data.cached ?? false,
        },
      });
    } catch (dbError) {
      // Don't throw - just log
      console.error('Failed to save performance metric:', dbError);
    }
  }
}
