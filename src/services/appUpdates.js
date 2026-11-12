export function startAppUpdates({ win = window, doc = document, nav = navigator, fetcher = fetch, version }) {
    let dirty = false, checking = false, stopped = false, offered = '', reloadStarted = false;
    const markDirty = event => { if (event.target?.closest?.('form')) dirty = true; };
    const safeToReload = () => !dirty && doc.visibilityState !== 'hidden' && win.location.pathname !== '/callback' && !doc.querySelector('form[data-preserve-draft]');
    const check = async () => {
        if (stopped || checking || win.location.pathname === '/callback' || !nav.onLine) return;
        checking = true;
        try {
            const response = await fetcher('/version.json', { cache: 'no-store' });
            if (!response.ok) return;
            const current = (await response.json()).version;
            if (stopped || typeof current !== 'string' || current === version) return;
            if (!reloadStarted && safeToReload()) { reloadStarted = true; win.location.reload(); }
            else if (!reloadStarted && offered !== current) { offered = current; win.dispatchEvent(new CustomEvent('peptidelog-update-available', { detail: { version: current } })); }
        } catch { /* Offline: keep the current app and its data available. */ }
        finally { checking = false; }
    };
    const focus = () => { nav.serviceWorker?.getRegistration().then(r => r?.update()).catch(() => {}); check(); };
    doc.addEventListener('input', markDirty, true); doc.addEventListener('change', markDirty, true);
    win.addEventListener('focus', focus); win.addEventListener('online', focus);
    nav.serviceWorker?.addEventListener('controllerchange', check);
    const timer = win.setInterval(check, 5 * 60 * 1000); check();
    return () => { stopped = true; win.clearInterval(timer); doc.removeEventListener('input', markDirty, true); doc.removeEventListener('change', markDirty, true); win.removeEventListener('focus', focus); win.removeEventListener('online', focus); nav.serviceWorker?.removeEventListener('controllerchange', check); };
}
