import React from 'react';
import { trackError } from '../lib/analytics';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Basic console logging to help during development
    console.error('ErrorBoundary caught', error, errorInfo);
    trackError(error, errorInfo);

    // Auto-recovery for ChunkLoadErrors (updates/network issues)
    // These happen when a user is on an old version and clicking a link tries to load a deleted chunk
    const isChunkError = error.message && (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError'
    );

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_reload_time');
      // If we haven't reloaded in the last 10 seconds, try reloading
      if (!lastReload || Date.now() - parseInt(lastReload) > 10000) {
        console.log('Chunk load error detected, reloading page...');
        sessionStorage.setItem('chunk_reload_time', Date.now().toString());
        window.location.reload();
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>Please refresh or return home.</p>
          <a href="/" style={{ color: 'var(--accent-primary)' }}>Go Home</a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
