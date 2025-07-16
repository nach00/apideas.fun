import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // You can also log the error to an error reporting service here
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="error-boundary__title">Oops! Something went wrong</h2>
            <p className="error-boundary__message">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="error-boundary__actions">
              <button 
                className="error-boundary__button error-boundary__button--primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button 
                className="error-boundary__button error-boundary__button--secondary"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__summary">Error Details (Development Only)</summary>
                <div className="error-boundary__error-info">
                  <h4>Error:</h4>
                  <pre className="error-boundary__error-text">{this.state.error.toString()}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre className="error-boundary__stack">{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .error-boundary__container {
              max-width: 500px;
              text-align: center;
              background: #ffffff;
              border-radius: 12px;
              padding: 2rem;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }

            .error-boundary__icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 1.5rem;
              color: #ef4444;
            }

            .error-boundary__title {
              font-size: 1.5rem;
              font-weight: 600;
              color: #111827;
              margin: 0 0 0.5rem;
            }

            .error-boundary__message {
              color: #6b7280;
              margin: 0 0 2rem;
              line-height: 1.5;
            }

            .error-boundary__actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }

            .error-boundary__button {
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              border: none;
              font-size: 0.875rem;
            }

            .error-boundary__button--primary {
              background: #3b82f6;
              color: white;
            }

            .error-boundary__button--primary:hover {
              background: #2563eb;
            }

            .error-boundary__button--secondary {
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
            }

            .error-boundary__button--secondary:hover {
              background: #e5e7eb;
            }

            .error-boundary__details {
              margin-top: 2rem;
              text-align: left;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }

            .error-boundary__summary {
              padding: 1rem;
              background: #f9fafb;
              cursor: pointer;
              font-weight: 500;
              border-bottom: 1px solid #e5e7eb;
            }

            .error-boundary__error-info {
              padding: 1rem;
            }

            .error-boundary__error-info h4 {
              margin: 0 0 0.5rem;
              color: #374151;
              font-size: 0.875rem;
              font-weight: 600;
            }

            .error-boundary__error-text,
            .error-boundary__stack {
              background: #1f2937;
              color: #f9fafb;
              padding: 1rem;
              border-radius: 6px;
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              font-size: 0.75rem;
              white-space: pre-wrap;
              overflow-x: auto;
              margin: 0 0 1rem;
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary