/**
 * Monitoring Service
 * 
 * Comprehensive monitoring including:
 * - Uptime monitoring with health checks
 * - Log aggregation
 * - Alert system
 * - Performance monitoring (Web Vitals)
 * 
 * Integration-ready for:
 * - UptimeRobot, Checkly, Pingdom (uptime)
 * - Sentry, LogRocket, Datadog (logs/errors)
 * - PagerDuty, Slack, Discord (alerts)
 * - New Relic, Datadog (APM)
 */

import { supabase } from '../lib/supabase';

// Log levels
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
};

// Store logs in memory (last 100) for quick access
let logBuffer = [];
const MAX_BUFFER_SIZE = 100;

export const monitoringService = {
    /**
     * ========================================
     * UPTIME MONITORING
     * ========================================
     */

    /**
     * Health check - returns system status
     * Can be polled by UptimeRobot, Checkly, etc.
     */
    async healthCheck() {
        const startTime = performance.now();
        const checks = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            checks: {}
        };

        try {
            // Check Supabase connection
            const { error: dbError } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);

            checks.checks.database = {
                status: dbError ? 'unhealthy' : 'healthy',
                latency: Math.round(performance.now() - startTime)
            };

            // Check Auth service
            const { data: session } = await supabase.auth.getSession();
            checks.checks.auth = {
                status: 'healthy',
                sessionActive: !!session?.session
            };

            // Check storage (if using Supabase Storage)
            checks.checks.storage = { status: 'healthy' };

            // Overall status
            const hasUnhealthy = Object.values(checks.checks).some(c => c.status !== 'healthy');
            checks.status = hasUnhealthy ? 'degraded' : 'healthy';
            checks.responseTime = Math.round(performance.now() - startTime);

        } catch (error) {
            checks.status = 'unhealthy';
            checks.error = error.message;
        }

        return checks;
    },

    /**
     * Register with external uptime monitor
     */
    getUptimeConfig() {
        return {
            endpoints: [
                {
                    name: 'Main App',
                    url: window.location.origin,
                    checkInterval: 60, // seconds
                    expectedStatus: 200
                },
                {
                    name: 'API Health',
                    url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`,
                    checkInterval: 60,
                    expectedStatus: 200,
                    headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY }
                }
            ],
            providers: {
                uptimeRobot: 'https://uptimerobot.com - Free tier: 50 monitors',
                checkly: 'https://checklyhq.com - Free tier: 5 checks',
                betterUptime: 'https://betteruptime.com - Free tier: 10 monitors'
            }
        };
    },

    /**
     * ========================================
     * LOG AGGREGATION
     * ========================================
     */

    /**
     * Log a message with level and context
     */
    log(level, message, context = {}) {
        const logEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            context: {
                ...context,
                url: window.location.href,
                userAgent: navigator.userAgent,
                userId: context.userId || null
            }
        };

        // Add to buffer
        logBuffer.unshift(logEntry);
        if (logBuffer.length > MAX_BUFFER_SIZE) {
            logBuffer = logBuffer.slice(0, MAX_BUFFER_SIZE);
        }

        // Console output (with appropriate method)
        const consoleMethod = level === 'error' || level === 'critical' ? 'error'
            : level === 'warn' ? 'warn'
                : level === 'debug' ? 'debug'
                    : 'log';

        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context);

        // Send critical/error to external service if configured
        if (LOG_LEVELS[level.toUpperCase()] >= LOG_LEVELS.ERROR) {
            this._sendToExternalLogger(logEntry);
        }

        return logEntry;
    },

    debug(message, context) { return this.log('debug', message, context); },
    info(message, context) { return this.log('info', message, context); },
    warn(message, context) { return this.log('warn', message, context); },
    error(message, context) { return this.log('error', message, context); },
    critical(message, context) { return this.log('critical', message, context); },

    /**
     * Get recent logs from buffer
     */
    getRecentLogs(count = 50, levelFilter = null) {
        let logs = logBuffer.slice(0, count);
        if (levelFilter) {
            const minLevel = LOG_LEVELS[levelFilter.toUpperCase()] || 0;
            logs = logs.filter(l => LOG_LEVELS[l.level] >= minLevel);
        }
        return logs;
    },

    /**
     * Persist logs to database (for admin viewing)
     */
    async persistLogs() {
        if (logBuffer.length === 0) return { success: true, count: 0 };

        try {
            const logsToSave = logBuffer.filter(l => LOG_LEVELS[l.level] >= LOG_LEVELS.WARN);

            if (logsToSave.length > 0) {
                const { error } = await supabase.from('system_logs').insert(
                    logsToSave.map(l => ({
                        level: l.level,
                        message: l.message,
                        context: l.context,
                        created_at: l.timestamp
                    }))
                );

                if (error) throw error;
            }

            return { success: true, count: logsToSave.length };
        } catch (error) {
            console.error('Failed to persist logs:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send to external logger (Sentry, LogRocket, etc.)
     */
    _sendToExternalLogger(logEntry) {
        // Sentry integration (if configured)
        if (window.Sentry) {
            if (logEntry.level === 'CRITICAL' || logEntry.level === 'ERROR') {
                window.Sentry.captureMessage(logEntry.message, {
                    level: logEntry.level.toLowerCase(),
                    extra: logEntry.context
                });
            }
        }

        // LogRocket integration (if configured)
        if (window.LogRocket) {
            window.LogRocket.log(logEntry.message, logEntry.context);
        }

        // Custom webhook (Slack, Discord, etc.)
        const webhookUrl = import.meta.env.VITE_LOG_WEBHOOK_URL;
        if (webhookUrl && logEntry.level === 'CRITICAL') {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `🚨 CRITICAL: ${logEntry.message}`,
                    attachments: [{ text: JSON.stringify(logEntry.context, null, 2) }]
                })
            }).catch(() => { }); // Silent fail for webhooks
        }
    },

    /**
     * ========================================
     * ALERT SYSTEM
     * ========================================
     */

    alerts: [],
    alertSubscribers: [],

    /**
     * Create an alert
     */
    createAlert(type, title, message, severity = 'info', metadata = {}) {
        const alert = {
            id: crypto.randomUUID(),
            type, // 'error', 'performance', 'security', 'usage', 'custom'
            title,
            message,
            severity, // 'info', 'warning', 'error', 'critical'
            metadata,
            createdAt: new Date().toISOString(),
            acknowledged: false
        };

        this.alerts.unshift(alert);
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(0, 50);
        }

        // Notify subscribers
        this.alertSubscribers.forEach(callback => {
            try { callback(alert); } catch (e) { console.error('Alert subscriber error:', e); }
        });

        // Log the alert
        this.log(severity === 'critical' ? 'critical' : 'warn', `Alert: ${title}`, { alert });

        // Send to external alert service
        if (severity === 'critical' || severity === 'error') {
            this._sendExternalAlert(alert);
        }

        return alert;
    },

    /**
     * Subscribe to alerts
     */
    onAlert(callback) {
        this.alertSubscribers.push(callback);
        return () => {
            this.alertSubscribers = this.alertSubscribers.filter(cb => cb !== callback);
        };
    },

    /**
     * Get active alerts
     */
    getAlerts(includeAcknowledged = false) {
        return includeAcknowledged
            ? this.alerts
            : this.alerts.filter(a => !a.acknowledged);
    },

    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
        }
        return alert;
    },

    /**
     * Send alert to external services
     */
    async _sendExternalAlert(alert) {
        // Slack webhook
        const slackWebhook = import.meta.env.VITE_SLACK_WEBHOOK_URL;
        if (slackWebhook) {
            try {
                await fetch(slackWebhook, {
                    method: 'POST',
                    body: JSON.stringify({
                        text: `${alert.severity === 'critical' ? '🚨' : '⚠️'} *${alert.title}*\n${alert.message}`,
                        attachments: [{
                            color: alert.severity === 'critical' ? 'danger' : 'warning',
                            fields: Object.entries(alert.metadata).map(([k, v]) => ({
                                title: k, value: String(v), short: true
                            }))
                        }]
                    })
                });
            } catch (e) {
                console.error('Slack alert failed:', e);
            }
        }

        // Discord webhook
        const discordWebhook = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
        if (discordWebhook) {
            try {
                await fetch(discordWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `${alert.severity === 'critical' ? '🚨' : '⚠️'} **${alert.title}**\n${alert.message}`
                    })
                });
            } catch (e) {
                console.error('Discord alert failed:', e);
            }
        }
    },

    /**
     * ========================================
     * PERFORMANCE MONITORING
     * ========================================
     */

    metrics: {
        webVitals: {},
        apiCalls: [],
        pageLoads: [],
        errors: []
    },

    /**
     * Initialize Web Vitals monitoring
     */
    initWebVitals() {
        // Core Web Vitals using browser APIs
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.webVitals.lcp = {
                        value: lastEntry.startTime,
                        rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
                    };
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) { }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.metrics.webVitals.fid = {
                            value: entry.processingStart - entry.startTime,
                            rating: entry.processingStart - entry.startTime < 100 ? 'good' : 'needs-improvement'
                        };
                    });
                });
                fidObserver.observe({ type: 'first-input', buffered: true });
            } catch (e) { }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.metrics.webVitals.cls = {
                        value: clsValue,
                        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
                    };
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch (e) { }
        }

        // Time to First Byte (TTFB)
        if (performance.getEntriesByType) {
            const navEntry = performance.getEntriesByType('navigation')[0];
            if (navEntry) {
                this.metrics.webVitals.ttfb = {
                    value: navEntry.responseStart,
                    rating: navEntry.responseStart < 800 ? 'good' : navEntry.responseStart < 1800 ? 'needs-improvement' : 'poor'
                };
            }
        }

        // DOM Content Loaded
        window.addEventListener('DOMContentLoaded', () => {
            this.metrics.webVitals.dcl = {
                value: performance.now(),
                timestamp: new Date().toISOString()
            };
        });

        // Page fully loaded
        window.addEventListener('load', () => {
            this.metrics.webVitals.load = {
                value: performance.now(),
                timestamp: new Date().toISOString()
            };

            // Log page load metrics
            setTimeout(() => {
                this.info('Page load complete', { webVitals: this.metrics.webVitals });
            }, 1000);
        });
    },

    /**
     * Track API call performance
     */
    trackApiCall(endpoint, method, duration, status, error = null) {
        const call = {
            endpoint,
            method,
            duration,
            status,
            error,
            timestamp: new Date().toISOString()
        };

        this.metrics.apiCalls.unshift(call);
        if (this.metrics.apiCalls.length > 100) {
            this.metrics.apiCalls = this.metrics.apiCalls.slice(0, 100);
        }

        // Alert on slow API calls
        if (duration > 3000) {
            this.createAlert('performance', 'Slow API Call',
                `${method} ${endpoint} took ${duration}ms`,
                'warning',
                { duration, status }
            );
        }

        // Alert on API errors
        if (status >= 500) {
            this.createAlert('error', 'API Error',
                `${method} ${endpoint} returned ${status}`,
                'error',
                { status, error }
            );
        }

        return call;
    },

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const apiCalls = this.metrics.apiCalls;
        const avgDuration = apiCalls.length > 0
            ? apiCalls.reduce((sum, c) => sum + c.duration, 0) / apiCalls.length
            : 0;
        const errorRate = apiCalls.length > 0
            ? apiCalls.filter(c => c.status >= 400).length / apiCalls.length * 100
            : 0;

        return {
            webVitals: this.metrics.webVitals,
            apiPerformance: {
                totalCalls: apiCalls.length,
                avgDuration: Math.round(avgDuration),
                errorRate: Math.round(errorRate * 100) / 100,
                slowCalls: apiCalls.filter(c => c.duration > 1000).length
            },
            alerts: {
                total: this.alerts.length,
                unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
                critical: this.alerts.filter(a => a.severity === 'critical').length
            }
        };
    },

    /**
     * Send metrics to external APM (New Relic, Datadog)
     */
    async sendMetrics() {
        const metrics = this.getPerformanceSummary();

        // New Relic Browser (if configured)
        if (window.newrelic) {
            window.newrelic.setCustomAttribute('lcp', metrics.webVitals.lcp?.value);
            window.newrelic.setCustomAttribute('fid', metrics.webVitals.fid?.value);
            window.newrelic.setCustomAttribute('cls', metrics.webVitals.cls?.value);
        }

        // Datadog RUM (if configured)
        if (window.DD_RUM) {
            window.DD_RUM.addAction('performance_summary', metrics);
        }

        // Custom analytics endpoint
        const metricsEndpoint = import.meta.env.VITE_METRICS_ENDPOINT;
        if (metricsEndpoint) {
            try {
                await fetch(metricsEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(metrics)
                });
            } catch (e) {
                console.error('Failed to send metrics:', e);
            }
        }

        return metrics;
    }
};

// Auto-initialize Web Vitals when module loads
if (typeof window !== 'undefined') {
    monitoringService.initWebVitals();
}

export default monitoringService;
