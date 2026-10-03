-- Igra Lab Biblioteka — šema baze (Supabase / Postgres)

create table public.booklets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  age_group text not null check (age_group in ('3', '4', '5', '6')),  -- uzrast u godinama
  description text,
  deck text,                          -- ključ interaktivne prezentacije (src/content/index.ts)
  presentation_path text,             -- opciono: PDF prezentacija u bucketu 'presentations'
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.worksheets (
  id uuid primary key default gen_random_uuid(),
  booklet_id uuid not null references public.booklets(id) on delete cascade,
  title text not null,
  file_path text not null,            -- putanja u storage bucketu 'worksheets'
  sort_order int not null default 0
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  institution text,                   -- vrtić / ustanova
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Pristup bazi daje aktivna pretplata (puni je webhook plaćanja ili admin).
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text,                      -- ime procesora plaćanja (još nije izabran)
  provider_ref text,
  status text not null default 'inactive',  -- 'active' | 'inactive' | 'canceled'
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.has_access(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subscriptions s
    where s.user_id = uid and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  ) or exists (select 1 from profiles p where p.id = uid and p.is_admin);
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, institution)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'institution');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table booklets enable row level security;
alter table worksheets enable row level security;
alter table profiles enable row level security;
alter table subscriptions enable row level security;

create policy "booklets: pretplatnici" on booklets for select
  using (published and public.has_access(auth.uid()));
create policy "worksheets: pretplatnici" on worksheets for select
  using (public.has_access(auth.uid())
         and exists (select 1 from booklets b where b.id = booklet_id and b.published));
create policy "profiles: svoj red" on profiles for select using (id = auth.uid());
create policy "profiles: izmena svog" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and is_admin = false);
create policy "subscriptions: svoje" on subscriptions for select using (user_id = auth.uid());

-- Storage: privatni bucketi 'presentations' i 'worksheets'; čitanje samo uz pristup.
insert into storage.buckets (id, name, public)
  values ('presentations', 'presentations', false), ('worksheets', 'worksheets', false)
  on conflict do nothing;

create policy "storage: citanje za pretplatnike" on storage.objects for select
  using (bucket_id in ('presentations', 'worksheets') and public.has_access(auth.uid()));
