import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

const ShareButton = ({ title, text, url = window.location.href, className = '' }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: title || document.title,
            text: text || 'Check out this peptide tool!',
            url: url
        };

        // Try using the native Web Share API (Mobile/Safari/Edge)
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`btn-secondary ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ...className.style
            }}
            title="Share this page"
        >
            {copied ? (
                <>
                    <Check size={16} className="text-accent" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Share2 size={16} />
                    <span>Share</span>
                </>
            )}
        </button>
    );
};

export default ShareButton;
