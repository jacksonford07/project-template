/**
 * WebSocket Client Utilities
 *
 * Client-side WebSocket connection management with reconnection.
 * For the server, consider: Socket.io, Ably, Pusher, or Liveblocks.
 *
 * Note: Next.js App Router doesn't support WebSocket servers natively.
 * Use a separate service or Edge Runtime for WebSocket endpoints.
 *
 * @example
 * ```tsx
 * // In a component
 * const { isConnected, send, lastMessage } = useWebSocket('wss://api.example.com/ws');
 *
 * // Send a message
 * send({ type: 'subscribe', channel: 'updates' });
 *
 * // React to messages
 * useEffect(() => {
 *   if (lastMessage?.type === 'notification') {
 *     showNotification(lastMessage.data);
 *   }
 * }, [lastMessage]);
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
}

export interface WebSocketOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

const DEFAULT_OPTIONS: Required<Omit<WebSocketOptions, 'onOpen' | 'onClose' | 'onError' | 'onMessage'>> = {
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
};

/**
 * WebSocket connection manager
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<Omit<WebSocketOptions, 'onOpen' | 'onClose' | 'onError' | 'onMessage'>> & WebSocketOptions;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];

  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      logger.warn('WebSocket', 'Already connected');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        logger.info('WebSocket', 'Connected', { url: this.url });
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.options.onOpen?.();
      };

      this.ws.onclose = (event) => {
        logger.info('WebSocket', 'Disconnected', { code: event.code, reason: event.reason });
        this.options.onClose?.();
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        logger.error('WebSocket', 'Error', error as unknown as Error);
        this.options.onError?.(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as WebSocketMessage;
          message.timestamp = Date.now();
          this.options.onMessage?.(message);
        } catch {
          logger.warn('WebSocket', 'Failed to parse message', { data: event.data });
        }
      };
    } catch (error) {
      logger.error('WebSocket', 'Failed to connect', error as Error);
    }
  }

  private handleReconnect(): void {
    if (!this.options.reconnect) return;
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      logger.error('WebSocket', 'Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);

    logger.info('WebSocket', `Reconnecting in ${delay}ms`, { attempt: this.reconnectAttempts });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      // Queue message for when connection is established
      this.messageQueue.push(message);
      logger.warn('WebSocket', 'Queued message (not connected)', { type: message.type });
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error('WebSocket', 'Failed to send message', error as Error);
      return false;
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    logger.info('WebSocket', 'Disconnected manually');
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

/**
 * React hook for WebSocket connections
 */
export function useWebSocket(
  url: string | null,
  options: WebSocketOptions = {}
): {
  isConnected: boolean;
  send: (message: WebSocketMessage) => boolean;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
} {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!url) return;

    const client = new WebSocketClient(url, {
      ...options,
      onOpen: () => {
        setIsConnected(true);
        options.onOpen?.();
      },
      onClose: () => {
        setIsConnected(false);
        options.onClose?.();
      },
      onMessage: (message) => {
        setLastMessage(message);
        options.onMessage?.(message);
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [url]); // Intentionally not including options to avoid reconnects

  const send = useCallback((message: WebSocketMessage) => {
    return clientRef.current?.send(message) ?? false;
  }, []);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  return {
    isConnected,
    send,
    lastMessage,
    connect,
    disconnect,
  };
}

// Message type helpers
export const MessageTypes = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PING: 'ping',
  PONG: 'pong',
  NOTIFICATION: 'notification',
  UPDATE: 'update',
  ERROR: 'error',
} as const;

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];
