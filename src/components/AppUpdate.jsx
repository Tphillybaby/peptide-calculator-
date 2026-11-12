import React, { useState, useEffect } from 'react';
import { startAppUpdates } from '../services/appUpdates';
import styles from './AppUpdate.module.css';
export default function AppUpdate() {
    const [available, setAvailable] = useState(false);
    useEffect(() => {
        const offer = () => setAvailable(true);
        window.addEventListener('peptidelog-update-available', offer);
        const stop = startAppUpdates({ version: __APP_VERSION__ });
        return () => { stop(); window.removeEventListener('peptidelog-update-available', offer); };
    }, []);
    return available ? <aside className={styles.banner} role="status"><span>A new version is ready. Save your work, then refresh.</span><button type="button" onClick={() => window.location.reload()}>Update & refresh</button></aside> : null;
}
