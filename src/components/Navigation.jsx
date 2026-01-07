import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Syringe, Calculator, Activity, TrendingDown, BookOpen, User, LogIn, MoreHorizontal, X, MessageCircle, Package, MapPin, TestTubes, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../services/nativeService';
import styles from './Navigation.module.css';

const Navigation = () => {
  const { user } = useAuth();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  // Close menu when route changes
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };

    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [moreMenuOpen]);

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user) return '';
    const name = user.user_metadata?.full_name || user.email || '';
    if (user.user_metadata?.full_name) {
      const parts = name.split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name[0]?.toUpperCase() || 'U';
    }
    return name[0]?.toUpperCase() || 'U';
  };

  // Check if any "more" menu item is active
  const isMoreItemActive = ['/half-life', '/guides', '/price-checker', '/forum', '/injection-sites', '/blood-work', '/titration', '/reviews', '/stack-builder'].includes(location.pathname);

  // Haptic feedback on navigation tap
  const handleNavClick = () => {
    haptics.impact('light');
  };

  // Secondary navigation items (shown in More menu on mobile)
  const secondaryItems = [
    { to: '/injection-sites', icon: MapPin, label: 'Inject Sites', ariaLabel: 'Injection Site Guide' },
    { to: '/half-life', icon: Activity, label: 'Decay Plot', ariaLabel: 'Half-Life Plotter' },
    { to: '/guides', icon: BookOpen, label: 'Guides', ariaLabel: 'Peptide Guides' },
    { to: '/price-checker', icon: TrendingDown, label: 'Prices', ariaLabel: 'Price Checker' },
    { to: '/inventory', icon: Package, label: 'Stock', ariaLabel: 'Peptide Inventory' },
    { to: '/reviews', icon: Star, label: 'Reviews', ariaLabel: 'Vendor Reviews' },
    { to: '/blood-work', icon: TestTubes, label: 'Blood Work', ariaLabel: 'Blood Work Tracker', premium: true },
    { to: '/titration', icon: TrendingUp, label: 'Titration', ariaLabel: 'Dose Titration Planner', premium: true },
    { to: '/stack-builder', icon: Beaker, label: 'Stack Builder', ariaLabel: 'Peptide Stack Interaction Checker', premium: true },
    { to: '/forum', icon: MessageCircle, label: 'Forum', ariaLabel: 'Community Forum' },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`${styles.backdrop} ${moreMenuOpen ? styles.backdropVisible : ''}`}
        onClick={() => setMoreMenuOpen(false)}
      />

      {/* More Menu Popup */}
      <div
        ref={menuRef}
        className={`${styles.moreMenu} ${moreMenuOpen ? styles.moreMenuOpen : ''}`}
      >
        <div className={styles.moreMenuHeader}>
          <span className={styles.moreMenuTitle}>More Options</span>
          <button
            className={styles.closeButton}
            onClick={() => setMoreMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.moreMenuGrid}>
          {secondaryItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.ariaLabel}
              className={({ isActive }) => `${styles.moreMenuItem} ${isActive ? styles.moreMenuItemActive : ''} ${item.premium ? styles.premiumItem : ''}`}
              onClick={() => setMoreMenuOpen(false)}
            >
              <div className={styles.moreMenuIcon}>
                <item.icon size={22} />
                {item.premium && <span className={styles.premiumBadge}>PRO</span>}
              </div>
              <span className={styles.moreMenuLabel}>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <NavLink
            to="/"
            aria-label="Home"
            onClick={handleNavClick}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <LayoutDashboard size={22} />
            <span className={styles.label}>Home</span>
          </NavLink>

          <NavLink
            to="/log"
            aria-label="Injection Log"
            onClick={handleNavClick}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Syringe size={22} />
            <span className={styles.label}>Log</span>
          </NavLink>

          <NavLink
            to="/calculator"
            aria-label="Reconstitution Calculator"
            onClick={handleNavClick}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Calculator size={22} />
            <span className={styles.label}>Calc</span>
          </NavLink>

          <NavLink
            to="/encyclopedia"
            aria-label="Peptide Encyclopedia"
            onClick={handleNavClick}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <BookOpen size={22} />
            <span className={styles.label}>Library</span>
          </NavLink>

          {/* Desktop Only - Show secondary nav items directly */}
          {secondaryItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.ariaLabel}
              className={({ isActive }) => `${styles.navItem} ${styles.desktopOnly} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={22} />
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          ))}

          {/* More Button - Mobile Only */}
          <button
            className={`${styles.navItem} ${styles.moreButton} ${styles.mobileOnly} ${isMoreItemActive ? styles.active : ''}`}
            onClick={() => {
              handleNavClick();
              setMoreMenuOpen(!moreMenuOpen);
            }}
            aria-label="More options"
            aria-expanded={moreMenuOpen}
          >
            <MoreHorizontal size={22} />
            <span className={styles.label}>More</span>
            {isMoreItemActive && <span className={styles.activeDot} />}
          </button>

          {user ? (
            <NavLink
              to="/settings"
              aria-label="Profile Settings"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <div className={styles.avatarIcon}>
                {getUserInitials()}
              </div>
              <span className={styles.label}>Profile</span>
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              aria-label="Login"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <LogIn size={22} />
              <span className={styles.label}>Login</span>
            </NavLink>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
