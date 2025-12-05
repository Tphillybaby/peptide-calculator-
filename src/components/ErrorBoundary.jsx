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
