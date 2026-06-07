const API_BASE = import.meta.env.VITE_API_URL || '/api';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

class FrontendLogger {
  private queue: LogEntry[] = [];
  private flushing = false;
  private originalConsole: Record<string, (...args: any[]) => void> = {};

  constructor() {
    this.overrideConsole();
  }

  private overrideConsole() {
    const methods: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    for (const level of methods) {
      this.originalConsole[level] = (console as any)[level]?.bind(console) || (() => {});
      (console as any)[level] = (...args: any[]) => {
        this.originalConsole[level](...args);
        this.capture(level, args);
      };
    }

    window.onerror = (_msg, _source, _line, _col, error) => {
      this.capture('error', [error?.message || _msg, error?.stack]);
    };

    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      this.capture('error', [reason?.message || 'Unhandled Promise Rejection', reason?.stack]);
    };
  }

  private capture(level: LogLevel, args: any[]) {
    const message = args.map(a => (typeof a === 'object' ? this.safeStringify(a) : String(a))).join(' ');
    const stack = args.find(a => a instanceof Error)?.stack || new Error().stack;

    const entry: LogEntry = {
      level,
      message,
      stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(entry);
    if (this.queue.length >= 10) {
      this.flush();
    } else if (!this.flushing) {
      setTimeout(() => this.flush(), 5000);
    }
  }

  private safeStringify(obj: any): string {
    try {
      return JSON.stringify(obj, (_key, value) => {
        if (value instanceof Error) return { message: value.message, stack: value.stack };
        if (typeof value === 'string' && value.length > 500) return value.slice(0, 500) + '...';
        return value;
      }, 2);
    } catch {
      return String(obj);
    }
  }

  private async flush() {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;

    const batch = this.queue.splice(0);
    try {
      const token = this.getToken();
      await fetch(`${API_BASE}/logs/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(batch[0]),
      });
    } catch {
      this.queue.unshift(...batch);
      if (this.queue.length > 100) this.queue.splice(0, this.queue.length - 100);
    } finally {
      this.flushing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.flush(), 5000);
      }
    }
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }
}

let instance: FrontendLogger | null = null;

export const initLogger = () => {
  if (!instance) {
    instance = new FrontendLogger();
  }
  return instance;
};
