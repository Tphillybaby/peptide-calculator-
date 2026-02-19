import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, Copy, Check, X, TrendingUp, Calendar, Target } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useInjections } from '../hooks/useInjections';
import styles from './ShareProgress.module.css';

const ShareProgress = ({ onClose }) => {
    const { injections } = useInjections();
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const cardRef = useRef(null);

    // Calculate stats for the last 30 days
    const last30Days = injections.filter(inj => {
        const date = new Date(inj.injection_date || inj.date);
        return date >= subDays(new Date(), 30);
    });

    const stats = {
        total: last30Days.length,
        streak: calculateStreak(injections),
        topPeptide: getTopPeptide(last30Days),
        compliance: calculateCompliance(last30Days)
    };

    function calculateStreak(injections) {
        if (injections.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const hasInjection = injections.some(inj => {
                const injDate = format(new Date(inj.injection_date || inj.date), 'yyyy-MM-dd');
                return injDate === dateStr;
            });

            if (hasInjection) {
                streak++;
                currentDate = subDays(currentDate, 1);
            } else if (i === 0) {
                // Allow missing today
                currentDate = subDays(currentDate, 1);
            } else {
                break;
            }
        }

        return streak;
    }

    function getTopPeptide(injections) {
        const counts = {};
        injections.forEach(inj => {
            const name = inj.peptide_name || inj.peptide;
            counts[name] = (counts[name] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted[0] ? sorted[0][0] : 'None';
    }

    function calculateCompliance(injections) {
        // Simplified compliance - assume 1 injection per day target
        const uniqueDays = new Set(
            injections.map(inj => format(new Date(inj.injection_date || inj.date), 'yyyy-MM-dd'))
        );
        return Math.min(100, Math.round((uniqueDays.size / 30) * 100));
    }

    const generateImage = async () => {
        if (!cardRef.current) return;

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0a0e1a',
                scale: 2,
                logging: false,
                useCORS: true
            });

            const url = canvas.toDataURL('image/png');
            setImageUrl(url);
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = () => {
        if (!imageUrl) return;

        const link = document.createElement('a');
        link.download = `peptide-progress-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = imageUrl;
        link.click();
    };

    const copyToClipboard = async () => {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    const shareImage = async () => {
        if (!imageUrl || !navigator.share) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'peptide-progress.png', { type: 'image/png' });

            await navigator.share({
                title: 'My Peptide Progress',
                text: 'Check out my peptide tracking progress!',
                files: [file]
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <Share2 size={20} />
                        Share Progress
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Preview Card */}
                    <div className={styles.previewContainer}>
                        <div ref={cardRef} className={styles.progressCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardLogo}>💉 PeptideLog</div>
                                <div className={styles.cardDate}>{format(new Date(), 'MMMM yyyy')}</div>
                            </div>

                            <div className={styles.cardStats}>
                                <div className={styles.cardStatItem}>
                                    <div className={styles.cardStatIcon}>
                                        <Target size={24} />
                                    </div>
                                    <div className={styles.cardStatValue}>{stats.total}</div>
                                    <div className={styles.cardStatLabel}>Injections (30d)</div>
                                </div>

                                <div className={styles.cardStatItem}>
                                    <div className={styles.cardStatIcon}>
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className={styles.cardStatValue}>{stats.streak}</div>
                                    <div className={styles.cardStatLabel}>Day Streak</div>
                                </div>

                                <div className={styles.cardStatItem}>
                                    <div className={styles.cardStatIcon}>
                                        <Calendar size={24} />
                                    </div>
                                    <div className={styles.cardStatValue}>{stats.compliance}%</div>
                                    <div className={styles.cardStatLabel}>Compliance</div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <span className={styles.topPeptide}>Top: {stats.topPeptide}</span>
                                <span className={styles.watermark}>peptidelog.net</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actions}>
                        {!imageUrl ? (
                            <button
                                className={styles.generateButton}
                                onClick={generateImage}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Image'}
                            </button>
                        ) : (
                            <>
                                <button className={styles.actionButton} onClick={downloadImage}>
                                    <Download size={18} />
                                    Download
                                </button>
                                <button className={styles.actionButton} onClick={copyToClipboard}>
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                                {navigator.share && (
                                    <button className={styles.actionButton} onClick={shareImage}>
                                        <Share2 size={18} />
                                        Share
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareProgress;
