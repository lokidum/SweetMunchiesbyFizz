-- Run as database owner. No customer tables are readable with the anonymous key.
create extension if not exists pgcrypto;
create extension if not exists citext;
create table public.desserts (
 slug text primary key, name text not null, fun text not null, description text not null,
 colour text not null, format text not null, status text not null default 'kitchen' check(status in ('featured','live','sold_out','back_soon','kitchen','hidden')),
 ratings integer[] not null check(array_length(ratings,1)=3 and ratings[1] between 1 and 5 and ratings[2] between 1 and 5 and ratings[3] between 1 and 5),
 price_cents integer check(price_cents>0), ingredients text, allergens text[], portion_note text,
 stock integer not null default 0 check(stock>=0), hero_image_url text, hero_image_alt text, vibes text[], sort_order integer not null default 0,
 square_variation_id text, available_from timestamptz, available_until timestamptz, updated_at timestamptz not null default now(),
 constraint live_requires_details check(status<>'live' or coalesce((price_cents is not null and length(ingredients)>0 and allergens is not null and length(portion_note)>0 and length(hero_image_url)>0 and length(hero_image_alt)>0 and coalesce(array_length(vibes,1),0)>0),false))
);
create table public.customers(id uuid primary key default gen_random_uuid(),email citext unique,phone text unique,unsubscribe_token uuid not null default gen_random_uuid() unique,created_at timestamptz not null default now(),check(email is not null or phone is not null));
create table public.consents(id uuid primary key default gen_random_uuid(),customer_id uuid not null references customers(id),channel text not null check(channel in ('email','sms')),purpose text not null check(purpose in ('back_in_stock','marketing')),status text not null check(status in ('granted','withdrawn')),wording_shown text not null,form_location text not null,created_at timestamptz not null default now());
create table public.waitlist(id uuid primary key default gen_random_uuid(),customer_id uuid not null references customers(id),dessert_slug text not null references desserts(slug),created_at timestamptz not null default now(),notified_at timestamptz,unique(customer_id,dessert_slug));
create table public.enquiries(id uuid primary key default gen_random_uuid(),name text not null,email text not null,type text not null,message text not null,status text not null default 'new',created_at timestamptz not null default now());
create table public.orders(id uuid primary key default gen_random_uuid(),public_ref text unique not null,status text not null default 'pending',total_cents integer not null check(total_cents>=0),square_order_id text unique,created_at timestamptz not null default now());
create table public.admin_audit(id uuid primary key default gen_random_uuid(),actor_id uuid,action text not null,details jsonb not null default '{}',created_at timestamptz not null default now());
create table public.truck_stops(id uuid primary key default gen_random_uuid(),name text not null,address text not null,starts_at timestamptz not null,ends_at timestamptz not null,is_public boolean default false,check(ends_at>starts_at));
create table public.pickup_slots(id uuid primary key default gen_random_uuid(),stop_id uuid references truck_stops(id),starts_at timestamptz not null,capacity integer not null check(capacity>0),booked integer not null default 0 check(booked>=0 and booked<=capacity));
create table public.campaigns(id uuid primary key default gen_random_uuid(),name text not null,purpose text not null,channel text not null,body text not null,status text not null default 'draft',created_at timestamptz not null default now());
create table public.message_outbox(id uuid primary key default gen_random_uuid(),campaign_id uuid references campaigns(id),customer_id uuid references customers(id),channel text not null,status text not null default 'queued',attempts integer not null default 0,created_at timestamptz not null default now(),unique(campaign_id,customer_id,channel));
DO $$ declare t text; begin foreach t in array array['desserts','customers','consents','waitlist','enquiries','orders','admin_audit','truck_stops','pickup_slots','campaigns','message_outbox'] loop execute format('alter table public.%I enable row level security',t); execute format('revoke all on public.%I from anon, authenticated',t); execute format('grant all on public.%I to service_role',t); end loop; end $$;
create function public.join_waitlist(p_slug text,p_email text,p_phone text,p_marketing boolean) returns void language plpgsql security definer set search_path=public as $$
declare cid uuid; channel_name text;
begin
 if p_email is null and p_phone is null then raise exception 'contact required'; end if;
 -- Serialise contact identity changes. Never merge two existing identities from unverified input.
 perform pg_advisory_xact_lock(7341269);
 select id into cid from customers where (p_email is not null and email=p_email) or (p_phone is not null and phone=p_phone) order by created_at limit 1;
 if cid is not null and not exists(select 1 from customers where id=cid and (p_email is null or email=p_email) and (p_phone is null or phone=p_phone)) then return; end if;
 if cid is null then insert into customers(email,phone) values(p_email,p_phone) returning id into cid; end if;
 insert into waitlist(customer_id,dessert_slug) values(cid,p_slug) on conflict(customer_id,dessert_slug) do update set notified_at=null;
 foreach channel_name in array array['email','sms'] loop
 if (channel_name='email' and p_email is not null) or (channel_name='sms' and p_phone is not null) then
 insert into consents(customer_id,channel,purpose,status,wording_shown,form_location) values(cid,channel_name,'back_in_stock','granted','Supply an email or Australian mobile. We’ll use it for this dessert’s availability alert. You can unsubscribe any time.','/desserts/'||p_slug);
 if p_marketing then insert into consents(customer_id,channel,purpose,status,wording_shown,form_location) values(cid,channel_name,'marketing','granted','Also send me specials and truck news by email and SMS. Unsubscribe any time.','/desserts/'||p_slug); end if;
 end if; end loop;
end $$;
create function public.unsubscribe_customer(p_token uuid) returns void language plpgsql security definer set search_path=public as $$
declare cid uuid; ch text; pur text;
begin select id into cid from customers where unsubscribe_token=p_token;
 if cid is not null then
 foreach ch in array array['email','sms'] loop foreach pur in array array['back_in_stock','marketing'] loop
 insert into consents(customer_id,channel,purpose,status,wording_shown,form_location) values(cid,ch,pur,'withdrawn','Unsubscribe from all messages','/unsubscribe');
 end loop; end loop;
 delete from waitlist where customer_id=cid;
 update message_outbox set status='cancelled' where customer_id=cid and status='queued';
 end if;
end $$;
revoke all on function public.join_waitlist(text,text,text,boolean) from public,anon,authenticated;
revoke all on function public.unsubscribe_customer(uuid) from public,anon,authenticated;
grant execute on function public.join_waitlist(text,text,text,boolean) to service_role;
grant execute on function public.unsubscribe_customer(uuid) to service_role;
