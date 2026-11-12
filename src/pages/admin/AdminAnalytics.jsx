import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminAnalytics.module.css';
export default function AdminAnalytics() {
    const [days,setDays]=useState(30), [data,setData]=useState(null), [error,setError]=useState(''), [loading,setLoading]=useState(true), [revision,setRevision]=useState(0);
    useEffect(()=>{let active=true;setLoading(true);setError('');
        supabase.rpc('get_admin_overview',{p_days:days}).then(({data,error})=>{if(!active)return;if(error){setError('Analytics could not be loaded.');setData(null);}else setData(data);}).catch(()=>{if(active){setError('Analytics could not be loaded.');setData(null);}}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};
    },[days,revision]);
    const metrics=data ? [['Total accounts',data.users],['New accounts in period',data.newUsers],['Accounts with a logged dose in period',data.activeUsers],['Logged doses in period',data.periodInjections],['Active premium accounts',data.premiumUsers],['Total schedules',data.schedules],['Total reviews',data.reviews]] : [];
    return <main className={styles.container}><h1>Admin analytics</h1><p>Database counts. Reporting periods use the server clock; active accounts are distinct users with a logged dose in the selected period.</p><label htmlFor="admin-period">Reporting period </label><select id="admin-period" value={days} onChange={e=>setDays(Number(e.target.value))}>{[7,30,90].map(n=><option key={n} value={n}>Last {n} days</option>)}</select> <button type="button" onClick={()=>setRevision(r=>r+1)} disabled={loading}>Refresh</button>
    {loading ? <p role="status">Loading analytics…</p> : error ? <p role="alert">{error}</p> : <dl style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1rem',marginTop:'1.5rem'}}>{metrics.map(([label,value])=><div key={label} className="card" style={{padding:'1.25rem'}}><dt>{label}</dt><dd style={{fontSize:'1.8rem',margin:'.5rem 0'}}>{value ?? 'Unavailable'}</dd></div>)}</dl>}
    <section style={{marginTop:'2rem'}}><h2>Traffic and retention</h2><p>Page views, calculator usage and retention are not measured by this report. No estimated traffic or placeholder retention percentages are shown.</p></section></main>;
}
