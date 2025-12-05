import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Syringe, Calculator, Activity, Calendar, TrendingDown, BookOpen } from 'lucide-react';
import styles from './Navigation.module.css';

const Navigation = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <NavLink
          to="/"
          aria-label="Home"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard size={24} />
          <span className={styles.label}>Home</span>
        </NavLink>

        <NavLink
          to="/tracker"
          aria-label="Injection Tracker"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Syringe size={24} />
          <span className={styles.label}>Tracker</span>
        </NavLink>

        <NavLink
          to="/calculator"
          aria-label="Reconstitution Calculator"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Calculator size={24} />
          <span className={styles.label}>Reconst</span>
        </NavLink>

        <NavLink
          to="/half-life"
          aria-label="Half-Life Plotter"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Activity size={24} />
          <span className={styles.label}>Decay</span>
        </NavLink>

        <NavLink
          to="/schedule"
          aria-label="Schedule"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Calendar size={24} />
          <span className={styles.label}>Schedule</span>
        </NavLink>

        <NavLink
          to="/encyclopedia"
          aria-label="Peptide Encyclopedia"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <BookOpen size={24} />
          <span className={styles.label}>Library</span>
        </NavLink>

        <NavLink
          to="/guides"
          aria-label="Peptide Guides"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <BookOpen size={24} />
          <span className={styles.label}>Guides</span>
        </NavLink>

        <NavLink
          to="/price-checker"
          aria-label="Price Checker"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <TrendingDown size={24} />
          <span className={styles.label}>Prices</span>
        </NavLink>

        <NavLink
          to="/login"
          aria-label="Login"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            T
          </div>
          <span className={styles.label}>Login</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
