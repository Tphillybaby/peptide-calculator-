import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, AlertCircle, Filter, Send, User, ChevronDown } from 'lucide-react';
import { supportService } from '../services/supportService';
import styles from './AdminTickets.module.css';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const statuses = supportService.getStatuses();
    const categories = supportService.getCategories();
    const priorities = supportService.getPriorities();

    useEffect(() => {
        loadTickets();
    }, [filterStatus]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await supportService.getAllTickets(filterStatus || null);
            setTickets(data || []);
        } catch (err) {
            setError('Failed to load tickets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await supportService.updateTicketStatus(ticketId, newStatus);
            await loadTickets();
            if (selectedTicket?.id === ticketId) {
                const updated = await supportService.getTicket(ticketId);
                setSelectedTicket(updated);
            }
        } catch (err) {
            setError('Failed to update status');
            console.error(err);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            setSubmitting(true);
            await supportService.addMessage(selectedTicket.id, newMessage, true);
            setNewMessage('');
            const updated = await supportService.getTicket(selectedTicket.id);
            setSelectedTicket(updated);
            await loadTickets();
        } catch (err) {
            setError('Failed to send reply');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <AlertCircle size={14} />;
            case 'in_progress': return <Clock size={14} />;
            case 'resolved': return <CheckCircle size={14} />;
            default: return <MessageCircle size={14} />;
        }
    };

    const getStatusColor = (status) => {
        const s = statuses.find(st => st.id === status);
        return s?.color || '#6b7280';
    };

    const getPriorityColor = (priority) => {
        const p = priorities.find(pr => pr.id === priority);
        return p?.color || '#6b7280';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ticketCounts = {
        all: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>
                    <MessageCircle size={28} />
                    Support Tickets
                </h1>
                <div className={styles.stats}>
                    <span className={styles.statItem}>
                        <AlertCircle size={16} style={{ color: '#3b82f6' }} />
                        {ticketCounts.open} Open
                    </span>
                    <span className={styles.statItem}>
                        <Clock size={16} style={{ color: '#f59e0b' }} />
                        {ticketCounts.in_progress} In Progress
                    </span>
                    <span className={styles.statItem}>
                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                        {ticketCounts.resolved} Resolved
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <Filter size={18} />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Tickets</option>
                    {statuses.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                </select>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.content}>
                {/* Tickets List */}
                <div className={styles.ticketsList}>
                    {loading ? (
                        <div className={styles.loading}>Loading...</div>
                    ) : tickets.length === 0 ? (
                        <div className={styles.empty}>No tickets found</div>
                    ) : (
                        tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                className={`${styles.ticketCard} ${selectedTicket?.id === ticket.id ? styles.selected : ''}`}
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <div className={styles.ticketTop}>
                                    <span
                                        className={styles.priority}
                                        style={{ background: getPriorityColor(ticket.priority) }}
                                    />
                                    <span
                                        className={styles.status}
                                        style={{ color: getStatusColor(ticket.status) }}
                                    >
                                        {getStatusIcon(ticket.status)}
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <h3>{ticket.subject}</h3>
                                <p className={styles.userInfo}>
                                    <User size={14} />
                                    {ticket.profiles?.email || 'Unknown'}
                                </p>
                                <div className={styles.ticketMeta}>
                                    <span>{categories.find(c => c.id === ticket.category)?.label}</span>
                                    <span>{formatDate(ticket.updated_at)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Ticket Detail */}
                <div className={styles.ticketDetail}>
                    {selectedTicket ? (
                        <>
                            <div className={styles.detailHeader}>
                                <h2>{selectedTicket.subject}</h2>
                                <div className={styles.detailMeta}>
                                    <span>
                                        <User size={16} />
                                        {selectedTicket.profiles?.email}
                                    </span>
                                    <span>{formatDate(selectedTicket.created_at)}</span>
                                </div>
                            </div>

                            <div className={styles.statusSelect}>
                                <label>Status:</label>
                                <select
                                    value={selectedTicket.status}
                                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                                >
                                    {statuses.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.description}>
                                <h4>Description</h4>
                                <p>{selectedTicket.description}</p>
                            </div>

                            <div className={styles.messages}>
                                <h4>Conversation</h4>
                                {selectedTicket.ticket_messages?.length === 0 ? (
                                    <p className={styles.noMessages}>No messages yet</p>
                                ) : (
                                    selectedTicket.ticket_messages?.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`${styles.message} ${msg.is_admin_reply ? styles.adminMsg : styles.userMsg}`}
                                        >
                                            <div className={styles.msgHeader}>
                                                <span>{msg.is_admin_reply ? '🛡️ Admin' : '👤 User'}</span>
                                                <span>{formatDate(msg.created_at)}</span>
                                            </div>
                                            <p>{msg.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleSendReply} className={styles.replyForm}>
                                <textarea
                                    placeholder="Type your reply..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    rows={3}
                                />
                                <button type="submit" disabled={submitting || !newMessage.trim()}>
                                    <Send size={18} />
                                    Send Reply
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className={styles.noSelection}>
                            <MessageCircle size={48} />
                            <p>Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTickets;
