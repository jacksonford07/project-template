/**
 * Advanced Features
 *
 * This module exports optional advanced features that can be enabled as needed.
 * Each feature is designed to be tree-shakeable - only import what you use.
 *
 * @example
 * ```ts
 * // Import specific features
 * import { isFeatureEnabled, FeatureGate } from '@/lib/features/feature-flags';
 * import { queueJob, defineJob } from '@/lib/features/jobs';
 * import { useWebSocket } from '@/lib/features/websocket';
 * import { useTranslation, I18nProvider } from '@/lib/features/i18n';
 * import { usePWA, registerServiceWorker } from '@/lib/features/pwa';
 * ```
 */

// Feature Flags
export {
  isFeatureEnabled,
  getFeatureValue,
  getAllFlags,
  useFeatureFlag,
  FeatureGate,
  type FeatureFlags,
  type FeatureFlagName,
} from './feature-flags';

// Background Jobs
export {
  defineJob,
  queueJob,
  getJobStatus,
  getAllJobs,
  clearCompletedJobs,
  exampleJobs,
  type JobDefinition,
  type QueuedJob,
} from './jobs';

// WebSocket
export {
  WebSocketClient,
  useWebSocket,
  MessageTypes,
  type WebSocketMessage,
  type WebSocketOptions,
  type MessageType,
} from './websocket';

// i18n
export {
  I18nProvider,
  useI18n,
  useTranslation,
  getBrowserLocale,
  formatDate,
  formatNumber,
  formatCurrency,
  LOCALES,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationDictionary,
  type Translations,
} from './i18n';

// PWA
export {
  registerServiceWorker,
  unregisterServiceWorker,
  isStandalone,
  usePWA,
  useUpdateNotification,
} from './pwa';
