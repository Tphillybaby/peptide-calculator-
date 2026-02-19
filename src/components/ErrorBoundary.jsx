import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { trackError } from '../lib/analytics';

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in child component tree
 * and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Track error
    trackError(error, errorInfo);

    // Report to Sentry if available
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }

    // Auto-recovery for ChunkLoadErrors (updates/network issues)
    const isChunkError = error.message && (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError'
    );

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_reload_time');
      if (!lastReload || Date.now() - parseInt(lastReload) > 10000) {
        console.log('Chunk load error detected, reloading page...');
        sessionStorage.setItem('chunk_reload_time', Date.now().toString());
        window.location.reload();
        return;
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <AlertTriangle size={48} style={styles.icon} />
            </div>

            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              {this.props.friendlyMessage ||
                "We're sorry, but something unexpected happened. Please try again."}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details style={styles.errorDetails}>
                <summary style={styles.errorSummary}>Error Details</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.buttonGroup}>
              <button
                onClick={this.handleReset}
                style={styles.primaryButton}
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={styles.secondaryButton}
              >
                <Home size={18} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline styles to ensure they work even if CSS fails to load
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: 'rgba(26, 31, 53, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '3rem 2rem',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  icon: {
    color: '#ef4444',
  },
  title: {
    color: '#f8fafc',
    fontSize: '1.5rem',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  message: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#e2e8f0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
    fontSize: '0.9375rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  errorDetails: {
    textAlign: 'left',
    marginBottom: '1.5rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
  },
  errorSummary: {
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.75rem',
    overflow: 'auto',
    maxHeight: '200px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};

export default ErrorBoundary;
