-- Igra Lab Biblioteka — šema baze (Supabase / Postgres)
-- B2B model: pretplatu plaća vrtić (organizations), vaspitačice su članovi vrtića sa sopstvenim loginom.

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

-- Vrtić. seats = najviše naloga (vaspitačica + administrator) koje vrtić sme da ima.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  seats int not null default 12 check (seats > 0),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  org_id uuid references public.organizations(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),  -- admin vrtića upravlja nalozima
  is_admin boolean not null default false,                                  -- administrator Igra Lab (ručno u bazi)
  created_at timestamptz not null default now()
);
create index on public.profiles (org_id);

-- Pretplata pripada vrtiću (puni je webhook plaćanja ili administrator Igra Lab).
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text,                      -- procesor plaćanja (još nije izabran)
  provider_ref text,
  status text not null default 'inactive',  -- 'active' | 'inactive' | 'canceled'
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.my_org() returns uuid
language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = auth.uid();
$$;

create or replace function public.is_org_admin(org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and org_id = org and role = 'admin');
$$;

-- Pristup imaju članovi vrtića sa aktivnom pretplatom, i administratori Igra Lab.
create or replace function public.has_access(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p join subscriptions s on s.org_id = p.org_id
    where p.id = uid and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  ) or exists (select 1 from profiles p where p.id = uid and p.is_admin);
$$;

-- Novi nalog:
--  * nalog koji vrtić dodaje preko servera nosi org_id u app_metadata (korisnik ga ne može postaviti) -> član vrtića;
--  * samostalna registracija nosi org_name u user_metadata -> pravi se novi vrtić, a nalog je njegov admin.
-- org_id iz user_metadata se NIKAD ne uzima u obzir (inače bi se bilo ko mogao učlaniti u tuđi vrtić).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
  v_role text := 'member';
begin
  if new.raw_app_meta_data ? 'org_id' then
    v_org := (new.raw_app_meta_data->>'org_id')::uuid;
  elsif coalesce(new.raw_user_meta_data->>'org_name', '') <> '' then
    insert into organizations (name) values (new.raw_user_meta_data->>'org_name') returning id into v_org;
    v_role := 'admin';
  end if;
  insert into profiles (id, full_name, org_id, role)
  values (new.id, new.raw_user_meta_data->>'full_name', v_org, v_role);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table booklets enable row level security;
alter table worksheets enable row level security;
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table subscriptions enable row level security;

create policy "booklets: pretplatnici" on booklets for select
  using (published and public.has_access(auth.uid()));
create policy "worksheets: pretplatnici" on worksheets for select
  using (public.has_access(auth.uid())
         and exists (select 1 from booklets b where b.id = booklet_id and b.published));

create policy "organizations: svoj vrtic" on organizations for select using (id = public.my_org());
create policy "profiles: svoj red" on profiles for select using (id = auth.uid());
create policy "profiles: kolege (admin vrtica)" on profiles for select using (public.is_org_admin(org_id));
-- Namerno nema update politike na profiles: ulogu, vrtić i imena menja samo server (service role).
create policy "subscriptions: svog vrtica" on subscriptions for select using (org_id = public.my_org());

-- Storage: privatni bucketi 'presentations' i 'worksheets'; čitanje samo uz pristup.
insert into storage.buckets (id, name, public)
  values ('presentations', 'presentations', false), ('worksheets', 'worksheets', false)
  on conflict do nothing;

create policy "storage: citanje za pretplatnike" on storage.objects for select
  using (bucket_id in ('presentations', 'worksheets') and public.has_access(auth.uid()));

-- Ručna aktivacija pretplate za vrtić (dok plaćanje nije povezano):
--   insert into subscriptions (org_id, status, current_period_end)
--   values ('<id vrtića>', 'active', now() + interval '1 year');
-- Promena broja naloga:  update organizations set seats = 20 where id = '<id vrtića>';
