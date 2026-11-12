// Collection runs in Supabase pg_cron; this retired route holds no credentials.
export default function handler(){return new Response(JSON.stringify({error:'Price collection is scheduled in Supabase.'}),{status:410,headers:{'Content-Type':'application/json'}});}
