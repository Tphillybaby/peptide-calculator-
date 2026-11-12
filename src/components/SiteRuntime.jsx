import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
export function SiteGate({children}) {
 const {settings,flags,loading,error}=useSiteConfig();const {isAdmin}=useAuth();const {pathname}=useLocation();
 if(isAdmin||['/login','/callback','/forgot-password','/update-password','/reset-password','/terms','/privacy','/contact','/install'].includes(pathname))return children;
 if(loading)return <p role="status" style={{padding:'2rem'}}>Loading site settings…</p>;
 if(settings?.maintenance_mode)return <section style={{padding:'2rem'}}><h1>We’ll be back shortly</h1><p>{settings.site_name} is temporarily undergoing maintenance.</p><Link to="/login">Administrator sign in</Link></section>;
 const flag=pathname.startsWith('/encyclopedia')?'encyclopedia':pathname.startsWith('/forum')?'forum':pathname==='/price-checker'?'price_checker':null;
 if(flag&&flags[flag]===false)return <section style={{padding:'2rem'}}><h1>This page is temporarily unavailable</h1><p>Check back later.</p><Link to="/">Back to home</Link></section>;
 if(pathname==='/signup'&&(error||settings?.registration_enabled===false))return <section style={{padding:'2rem'}}><h1>{error?'Registration settings unavailable':'Registration is temporarily closed'}</h1><p>Existing members can still sign in.</p><Link to="/login">Sign in</Link></section>;
 return children;
}
export function SiteAnnouncements(){const {announcements}=useSiteConfig();return announcements.length?<aside aria-label="Site announcements" style={{display:'grid',gap:'.6rem',padding:'1rem'}}>{announcements.map(a=><section key={a.id} style={{padding:'1rem',border:'1px solid var(--accent-primary)',borderRadius:10,background:'var(--bg-secondary)'}}><strong>{a.title}</strong><p style={{whiteSpace:'pre-wrap',margin:'.5rem 0 0'}}>{a.message}</p></section>)}</aside>:null;}
