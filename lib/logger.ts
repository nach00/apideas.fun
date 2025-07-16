/**
 * Centralized logging utility for the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private static instance: Logger
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, category: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const emoji = this.getEmoji(level)
    const contextStr = context ? JSON.stringify(context, null, 2) : ''
    
    return `${emoji} [${timestamp}] [${category.toUpperCase()}] ${message}${contextStr ? '\n' + contextStr : ''}`
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍'
      case 'info': return 'ℹ️'
      case 'warn': return '⚠️'
      case 'error': return '❌'
      default: return '📝'
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error'
    }
    return true
  }

  debug(category: string, message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', category, message, context))
    }
  }

  info(category: string, message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', category, message, context))
    }
  }

  warn(category: string, message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', category, message, context))
    }
  }

  error(category: string, message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = error ? { 
        ...context, 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      } : context
      
      console.error(this.formatMessage('error', category, message, errorContext))
    }
  }

  // Specific logging methods for common use cases
  component(componentName: string, action: string, context?: LogContext): void {
    this.debug('COMPONENT', `${componentName}: ${action}`, context)
  }

  api(endpoint: string, method: string, status: number, context?: LogContext): void {
    const message = `${method} ${endpoint} - ${status}`
    if (status >= 400) {
      this.error('API', message, undefined, context)
    } else if (status >= 300) {
      this.warn('API', message, context)
    } else {
      this.info('API', message, context)
    }
  }

  user(action: string, context?: LogContext): void {
    this.info('USER', action, context)
  }

  auth(action: string, context?: LogContext): void {
    this.info('AUTH', action, context)
  }

  perf(action: string, duration: number, context?: LogContext): void {
    this.debug('PERF', `${action} took ${duration}ms`, context)
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export convenience methods
export const logComponent = (name: string, action: string, context?: LogContext) => 
  logger.component(name, action, context)

export const logApi = (endpoint: string, method: string, status: number, context?: LogContext) => 
  logger.api(endpoint, method, status, context)

export const logUser = (action: string, context?: LogContext) => 
  logger.user(action, context)

export const logAuth = (action: string, context?: LogContext) => 
  logger.auth(action, context)

export const logPerf = (action: string, duration: number, context?: LogContext) => 
  logger.perf(action, duration, context)

export default logger