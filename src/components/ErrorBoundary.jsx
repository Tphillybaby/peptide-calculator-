import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Basic console logging to help during development
    console.error('ErrorBoundary caught', error, errorInfo);
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
