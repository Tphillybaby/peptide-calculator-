// @vitest-environment node
import { it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
const errorHandler = readFileSync(new URL('../public/error-handler.js', import.meta.url), 'utf8');
it('shows recovery for an unmounted root containing only noscript SEO content', () => {
    vi.useFakeTimers();
    const dom = new JSDOM('<body><div id="root"><noscript>SEO fallback</noscript></div></body>', { runScripts: 'outside-only' });
    try {
        dom.window.eval(errorHandler);
        vi.advanceTimersByTime(15000);
        expect(dom.window.document.getElementById('mount-error-banner')).not.toBeNull();
    } finally { dom.window.close(); vi.useRealTimers(); }
});
it('does not cover a rendered application with a loading failure', () => {
    vi.useFakeTimers();
    const dom = new JSDOM('<body><div id="root"><main>Calculator</main></div></body>', { runScripts: 'outside-only' });
    try {
        dom.window.eval(errorHandler);
        vi.advanceTimersByTime(15000);
        expect(dom.window.document.getElementById('mount-error-banner')).toBeNull();
    } finally { dom.window.close(); vi.useRealTimers(); }
});
it('checks for worker updates without waiting for analytics or window load', async () => {
    const dom = new JSDOM('<body><div id="root"></div></body>', { runScripts: 'outside-only' });
    const register = vi.fn().mockResolvedValue({ update: vi.fn().mockResolvedValue() });
    Object.defineProperty(dom.window.navigator, 'serviceWorker', { value: { controller: null, addEventListener: vi.fn(), register } });
    try {
        const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
        const script = html.match(/<script>\s*if \('serviceWorker' in navigator\)[\s\S]*?<\/script>/)[0].replace(/^<script>|<\/script>$/g, '');
        dom.window.eval(script);
        expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/', updateViaCache: 'none' });
        await Promise.resolve();
    } finally { dom.window.close(); }
});
