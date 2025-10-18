interface ErrorLog {
  timestamp: Date;
  error: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  log(error: Error | string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      error: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    this.logs.unshift(errorLog);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('error_logs', JSON.stringify(this.logs.slice(0, 10)));
      } catch (e) {
        console.warn('Failed to save error logs to localStorage');
      }
    }

    console.error('Error logged:', errorLog);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error_logs');
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();
