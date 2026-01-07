/**
 * Accessibility utilities and helpers for WCAG compliance
 */

// Skip to main content link - add to top of page
export const SkipLink = () => (
    <a
        href="#main-content"
        className="skip-link"
        style={{
            position: 'absolute',
            top: '-40px',
            left: 0,
            background: 'var(--accent-primary)',
            color: 'white',
            padding: '8px 16px',
            zIndex: 9999,
            borderRadius: '0 0 8px 0',
            transition: 'top 0.3s',
        }}
        onFocus={(e) => { e.target.style.top = '0'; }}
        onBlur={(e) => { e.target.style.top = '-40px'; }}
    >
        Skip to main content
    </a>
);

// Visually hidden text for screen readers
export const VisuallyHidden = ({ children, as: Component = 'span' }) => (
    <Component
        style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
        }}
    >
        {children}
    </Component>
);

// Focus trap for modals
export const useFocusTrap = (isActive, containerRef) => {
    React.useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => {
            container.removeEventListener('keydown', handleTab);
        };
    }, [isActive, containerRef]);
};

// Announce changes to screen readers
export const announce = (message, priority = 'polite') => {
    const announcer = document.getElementById('a11y-announcer') || createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = '';

    // Small delay to ensure the change is announced
    setTimeout(() => {
        announcer.textContent = message;
    }, 100);
};

const createAnnouncer = () => {
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
    document.body.appendChild(announcer);
    return announcer;
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items, onSelect) => {
    const [focusIndex, setFocusIndex] = React.useState(0);

    const handleKeyDown = React.useCallback((e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusIndex((prev) => Math.min(prev + 1, items.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                onSelect?.(items[focusIndex], focusIndex);
                break;
            case 'Home':
                e.preventDefault();
                setFocusIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setFocusIndex(items.length - 1);
                break;
        }
    }, [items, focusIndex, onSelect]);

    return { focusIndex, handleKeyDown, setFocusIndex };
};

// Color contrast checker (for runtime validation)
export const hasGoodContrast = (foreground, background, threshold = 4.5) => {
    const getLuminance = (hex) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16 & 255) / 255;
        const g = (rgb >> 8 & 255) / 255;
        const b = (rgb & 255) / 255;

        const [rs, gs, bs] = [r, g, b].map((c) =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        );

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return ratio >= threshold;
};

// Import React for hooks
import React from 'react';
