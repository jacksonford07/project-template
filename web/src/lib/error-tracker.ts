import { prisma } from './prisma';

interface ErrorContext {
  context: string;
  message: string;
  userId?: string;
  requestUrl?: string;
  requestMethod?: string;
  [key: string]: unknown;
}

export class ErrorTracker {
  static async captureError(error: Error, context: ErrorContext): Promise<void> {
    try {
      await prisma.errorLog.create({
        data: {
          level: 'error',
          context: context.context,
          message: context.message,
          stack: error.stack,
          userId: context.userId,
          requestUrl: context.requestUrl,
          requestMethod: context.requestMethod,
          metadata: context as object,
        },
      });
    } catch (dbError) {
      // Don't throw - just log
      console.error('Failed to save error to database:', dbError);
    }
  }
}
