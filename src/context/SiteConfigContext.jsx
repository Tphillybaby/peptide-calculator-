import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
const Context=createContext(null);
export function SiteConfigProvider({children}) {
 const [state,setState]=useState({settings:null,flags:{},announcements:[],loading:true,error:false});
 const refresh=useCallback(async()=>{
  try { const [settings,flags,announcements]=await Promise.all([supabase.from('site_settings').select('*').single(),supabase.from('feature_flags').select('key,enabled'),supabase.from('announcements').select('*').eq('enabled',true).order('updated_at',{ascending:false})]);
   if(settings.error||flags.error||announcements.error)throw new Error('Configuration unavailable');
   const now=Date.now();setState({settings:settings.data,flags:Object.fromEntries((flags.data||[]).map(f=>[f.key,f.enabled])),announcements:(announcements.data||[]).filter(a=>(!a.starts_at||new Date(a.starts_at)<=now)&&(!a.ends_at||new Date(a.ends_at)>now)),loading:false,error:false});
  } catch {setState(s=>({...s,loading:false,error:true}));}
 },[]);
 useEffect(()=>{refresh();const tick=setInterval(refresh,60000);window.addEventListener('focus',refresh);window.addEventListener('site-config-changed',refresh);return()=>{clearInterval(tick);window.removeEventListener('focus',refresh);window.removeEventListener('site-config-changed',refresh);};},[refresh]);
 return <Context.Provider value={{...state,refresh}}>{children}</Context.Provider>;
}
export const useSiteConfig=()=>useContext(Context)||{settings:null,flags:{},announcements:[],loading:false,error:true};
