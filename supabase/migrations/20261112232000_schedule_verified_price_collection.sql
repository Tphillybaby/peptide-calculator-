-- Separate server-only token; never copy database service credentials to Vercel.
DO $$ BEGIN
 IF NOT EXISTS(select 1 from vault.secrets where name='peptidelog_price_collector_token') THEN
  PERFORM vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'peptidelog_price_collector_token','Authenticates scheduled public price collection');
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.price_collector_authorized(p_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$ SELECT EXISTS(SELECT 1 FROM vault.decrypted_secrets WHERE name='peptidelog_price_collector_token' AND decrypted_secret=p_token AND length(p_token)>=64) $$;
REVOKE ALL ON FUNCTION public.price_collector_authorized(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.price_collector_authorized(text) TO service_role;
CREATE OR REPLACE FUNCTION peptidelog_private.enqueue_price_collection()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$ DECLARE vendor record; token text; total integer:=0; BEGIN
 SELECT decrypted_secret INTO token FROM vault.decrypted_secrets WHERE name='peptidelog_price_collector_token';
 IF token IS NULL THEN RAISE EXCEPTION 'Price collector not configured'; END IF;
 FOR vendor IN SELECT slug FROM public.vendors WHERE is_active LOOP
  PERFORM net.http_post(url:='https://nhiwjerqyhtpienorzky.supabase.co/functions/v1/scrape-prices',headers:=jsonb_build_object('Authorization','Bearer '||token,'Content-Type','application/json'),body:=jsonb_build_object('vendor_slug',vendor.slug),timeout_milliseconds:=90000);
  total:=total+1;
 END LOOP;
 RETURN total;
END $$;
REVOKE ALL ON FUNCTION peptidelog_private.enqueue_price_collection() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION peptidelog_private.enqueue_price_collection() TO service_role;
SELECT cron.schedule('peptidelog-verified-prices','0 6,18 * * *',$job$SELECT peptidelog_private.enqueue_price_collection();$job$);
