import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Share, MoreVertical, Bell } from 'lucide-react';
import SEO from '../components/SEO';
import styles from './Install.module.css';

export default function Install() {
    return <article className={styles.page}>
        <SEO canonical="/install" title="Install PeptideLog on Your Phone" description="Add PeptideLog to your iPhone or Android Home Screen with these simple steps." />
        <header className={styles.header}><Smartphone size={36} aria-hidden="true" /><h1>Put PeptideLog on your Home Screen</h1><p>Open PeptideLog from an app icon on your phone. Installation is free and uses the same PeptideLog account.</p></header>
        <div className={styles.grid}>
            <section className={styles.card} aria-labelledby="iphone-install"><h2 id="iphone-install">iPhone & iPad</h2><p>Use Safari for these steps.</p>
                <ol><li>Open <strong>Safari</strong> and visit <a href="https://peptidelog.net">peptidelog.net</a>.</li><li>Tap <strong>Share</strong> <Share size={18} aria-label="square with an upward arrow" />. Depending on your Safari layout, you may need to open the menu first.</li><li>Scroll through the actions and tap <strong>Add to Home Screen</strong>. If needed, tap <strong>View More</strong> to find it.</li><li>Keep the name <strong>PeptideLog</strong>. If you see <strong>Open as Web App</strong>, turn it on, then tap <strong>Add</strong>.</li><li>Go to your Home Screen and tap the <strong>PeptideLog icon</strong> to open it.</li></ol>
                <a className={styles.help} href="https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios" target="_blank" rel="noopener noreferrer">Apple’s installation guide ↗</a>
            </section>
            <section className={styles.card} aria-labelledby="android-install"><h2 id="android-install">Android</h2><p>Use Google Chrome for these steps.</p>
                <ol><li>Open <strong>Chrome</strong> and visit <a href="https://peptidelog.net">peptidelog.net</a>.</li><li>Tap the <strong>three-dot menu</strong> <MoreVertical size={18} aria-label="three vertical dots" /> beside the address bar.</li><li>Tap <strong>Install and create shortcut</strong>, then <strong>Install</strong>. Some versions show <strong>Install app</strong> or <strong>Add to Home screen</strong> instead.</li><li>Follow the confirmation steps on your phone.</li><li>Open <strong>PeptideLog</strong> from your Home Screen or app drawer.</li></ol>
                <a className={styles.help} href="https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en" target="_blank" rel="noopener noreferrer">Google’s installation guide ↗</a>
            </section>
        </div>
        <section className={styles.card}><h2><Bell size={22} aria-hidden="true" /> Set up dose reminders</h2><p>Open PeptideLog from its new icon, sign in, then go to <Link to="/settings?tab=notifications">Settings → Notifications</Link>. Enable injection reminders and allow notifications when your phone asks. Check the reminder status to confirm this device is connected.</p><p>On iPhone, enable reminders from the Home Screen app. Notification support depends on your iOS version and device settings.</p></section>
        <section className={styles.card}><h2>Can’t find the install option?</h2><p>If you opened this page inside Facebook, Instagram, email, or another app, open the link in Safari on iPhone or Chrome on Android first. If PeptideLog is already installed, look for its icon on your Home Screen or in your app list.</p><p>Sign in with your existing account to access your saved records. Guest data is stored on the device and may not carry into a separately installed app. Keep an internet connection for account syncing and reminders.</p></section>
        <Link className={styles.back} to="/">Back to PeptideLog →</Link>
    </article>;
}
