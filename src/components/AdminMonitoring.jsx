import React, { useState, useEffect } from 'react';
import {
    Activity, AlertTriangle, CheckCircle, Clock,
    RefreshCw, Server, Zap, XCircle, Bell, TrendingUp,
    Database, Wifi, WifiOff
} from 'lucide-react';
import { monitoringService } from '../services/monitoringService';
import styles from './AdminMonitoring.module.css';

const AdminMonitoring = () => {
    const [health, setHealth] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadData();

        // Subscribe to alerts
        const unsubscribe = monitoringService.onAlert((alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 20));
        });

        // Auto refresh every 30 seconds
        let interval;
        if (autoRefresh) {
            interval = setInterval(loadData, 30000);
        }

        return () => {
            unsubscribe();
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [healthData, perfData] = await Promise.all([
                monitoringService.healthCheck(),
                Promise.resolve(monitoringService.getPerformanceSummary())
            ]);

            setHealth(healthData);
            setPerformance(perfData);
            setAlerts(monitoringService.getAlerts(true));
            setLogs(monitoringService.getRecentLogs(20));
        } catch (error) {
            console.error('Failed to load monitoring data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = (alertId) => {
        monitoringService.acknowledgeAlert(alertId);
        setAlerts(monitoringService.getAlerts(true));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return '#10b981';
            case 'degraded': return '#f59e0b';
            case 'unhealthy': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getRatingColor = (rating) => {
        switch (rating) {
            case 'good': return '#10b981';
            case 'needs-improvement': return '#f59e0b';
            case 'poor': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#ef4444';
            case 'error': return '#f87171';
            case 'warning': return '#f59e0b';
            default: return '#3b82f6';
        }
    };

    const getLogColor = (level) => {
        switch (level) {
            case 'CRITICAL': return '#ef4444';
            case 'ERROR': return '#f87171';
            case 'WARN': return '#f59e0b';
            case 'INFO': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1><Activity size={28} /> System Monitoring</h1>
                    <p>Real-time system health, performance, and alerts</p>
                </div>
                <div className={styles.headerActions}>
                    <label className={styles.autoRefresh}>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto-refresh
                    </label>
                    <button onClick={loadData} disabled={loading} className={styles.refreshBtn}>
                        <RefreshCw size={18} className={loading ? styles.spin : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Health Status */}
            <div className={styles.section}>
                <h2><Server size={20} /> System Health</h2>
                {health ? (
                    <div className={styles.healthGrid}>
                        <div className={styles.healthMain}>
                            <div
                                className={styles.statusIndicator}
                                style={{ background: getStatusColor(health.status) }}
                            >
                                {health.status === 'healthy' ? <CheckCircle size={32} /> :
                                    health.status === 'degraded' ? <AlertTriangle size={32} /> :
                                        <XCircle size={32} />}
                            </div>
                            <div>
                                <h3 style={{ color: getStatusColor(health.status) }}>
                                    {health.status.toUpperCase()}
                                </h3>
                                <p>Response time: {health.responseTime}ms</p>
                                <p className={styles.timestamp}>{health.timestamp}</p>
                            </div>
                        </div>

                        <div className={styles.healthChecks}>
                            {Object.entries(health.checks || {}).map(([name, check]) => (
                                <div key={name} className={styles.checkItem}>
                                    <span className={styles.checkIcon}>
                                        {check.status === 'healthy' ?
                                            <Wifi size={16} color="#10b981" /> :
                                            <WifiOff size={16} color="#ef4444" />}
                                    </span>
                                    <span className={styles.checkName}>{name}</span>
                                    <span
                                        className={styles.checkStatus}
                                        style={{ color: getStatusColor(check.status) }}
                                    >
                                        {check.status}
                                    </span>
                                    {check.latency && (
                                        <span className={styles.checkLatency}>{check.latency}ms</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className={styles.loading}>Loading health status...</p>
                )}
            </div>

            {/* Web Vitals */}
            <div className={styles.section}>
                <h2><Zap size={20} /> Performance (Web Vitals)</h2>
                {performance?.webVitals ? (
                    <div className={styles.vitalsGrid}>
                        {[
                            { key: 'lcp', label: 'LCP', unit: 'ms', desc: 'Largest Contentful Paint' },
                            { key: 'fid', label: 'FID', unit: 'ms', desc: 'First Input Delay' },
                            { key: 'cls', label: 'CLS', unit: '', desc: 'Cumulative Layout Shift' },
                            { key: 'ttfb', label: 'TTFB', unit: 'ms', desc: 'Time to First Byte' }
                        ].map(vital => {
                            const data = performance.webVitals[vital.key];
                            return (
                                <div key={vital.key} className={styles.vitalCard}>
                                    <div className={styles.vitalHeader}>
                                        <span className={styles.vitalLabel}>{vital.label}</span>
                                        {data?.rating && (
                                            <span
                                                className={styles.vitalRating}
                                                style={{ color: getRatingColor(data.rating) }}
                                            >
                                                {data.rating}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.vitalValue}>
                                        {data?.value !== undefined ? (
                                            <>
                                                {vital.key === 'cls' ? data.value.toFixed(3) : Math.round(data.value)}
                                                {vital.unit && <span className={styles.vitalUnit}>{vital.unit}</span>}
                                            </>
                                        ) : '—'}
                                    </div>
                                    <p className={styles.vitalDesc}>{vital.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.loading}>Loading performance metrics...</p>
                )}

                {performance?.apiPerformance && (
                    <div className={styles.apiStats}>
                        <div className={styles.apiStat}>
                            <span className={styles.apiStatValue}>{performance.apiPerformance.totalCalls}</span>
                            <span className={styles.apiStatLabel}>API Calls</span>
                        </div>
                        <div className={styles.apiStat}>
                            <span className={styles.apiStatValue}>{performance.apiPerformance.avgDuration}ms</span>
                            <span className={styles.apiStatLabel}>Avg Duration</span>
                        </div>
                        <div className={styles.apiStat}>
                            <span className={styles.apiStatValue}>{performance.apiPerformance.errorRate}%</span>
                            <span className={styles.apiStatLabel}>Error Rate</span>
                        </div>
                        <div className={styles.apiStat}>
                            <span className={styles.apiStatValue}>{performance.apiPerformance.slowCalls}</span>
                            <span className={styles.apiStatLabel}>Slow Calls (&gt;1s)</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Alerts */}
            <div className={styles.section}>
                <h2>
                    <Bell size={20} />
                    Alerts
                    {alerts.filter(a => !a.acknowledged).length > 0 && (
                        <span className={styles.alertBadge}>
                            {alerts.filter(a => !a.acknowledged).length}
                        </span>
                    )}
                </h2>
                {alerts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <CheckCircle size={32} />
                        <p>No alerts</p>
                    </div>
                ) : (
                    <div className={styles.alertList}>
                        {alerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`${styles.alertItem} ${alert.acknowledged ? styles.acknowledged : ''}`}
                            >
                                <div
                                    className={styles.alertSeverity}
                                    style={{ background: getSeverityColor(alert.severity) }}
                                />
                                <div className={styles.alertContent}>
                                    <div className={styles.alertHeader}>
                                        <span className={styles.alertTitle}>{alert.title}</span>
                                        <span className={styles.alertTime}>
                                            {new Date(alert.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className={styles.alertMessage}>{alert.message}</p>
                                </div>
                                {!alert.acknowledged && (
                                    <button
                                        onClick={() => handleAcknowledge(alert.id)}
                                        className={styles.ackBtn}
                                    >
                                        Acknowledge
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Logs */}
            <div className={styles.section}>
                <h2><Database size={20} /> Recent Logs</h2>
                {logs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No recent logs</p>
                    </div>
                ) : (
                    <div className={styles.logList}>
                        {logs.map(log => (
                            <div key={log.id} className={styles.logItem}>
                                <span
                                    className={styles.logLevel}
                                    style={{ color: getLogColor(log.level) }}
                                >
                                    {log.level}
                                </span>
                                <span className={styles.logMessage}>{log.message}</span>
                                <span className={styles.logTime}>
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Integration Info */}
            <div className={styles.section}>
                <h2><TrendingUp size={20} /> External Integrations</h2>
                <div className={styles.integrations}>
                    <div className={styles.integrationCard}>
                        <h4>Uptime Monitoring</h4>
                        <p>UptimeRobot, Checkly, BetterUptime</p>
                        <span className={styles.intStatus}>Ready to configure</span>
                    </div>
                    <div className={styles.integrationCard}>
                        <h4>Error Tracking</h4>
                        <p>Sentry, LogRocket</p>
                        <span className={styles.intStatus}>Ready to configure</span>
                    </div>
                    <div className={styles.integrationCard}>
                        <h4>Alerting</h4>
                        <p>Slack, Discord webhooks</p>
                        <span className={styles.intStatus}>Ready to configure</span>
                    </div>
                    <div className={styles.integrationCard}>
                        <h4>APM</h4>
                        <p>New Relic, Datadog</p>
                        <span className={styles.intStatus}>Ready to configure</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMonitoring;
