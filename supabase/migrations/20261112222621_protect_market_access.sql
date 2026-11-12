create or replace function public.protect_admin_column() returns trigger
language plpgsql set search_path = '' as $$
begin
 if current_user not in ('authenticated','anon') then return NEW; end if;
 if public.is_admin() then return NEW; end if;
 if TG_OP='INSERT' then
  if NEW.is_admin is true or NEW.has_market_access is true then raise exception 'Only admins can grant privileged account access' using errcode='42501'; end if;
 elsif NEW.is_admin is distinct from OLD.is_admin or NEW.has_market_access is distinct from OLD.has_market_access then
  raise exception 'Only admins can change privileged account access' using errcode='42501';
 end if;
 return NEW;
end $$;
