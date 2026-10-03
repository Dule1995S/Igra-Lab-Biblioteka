-- Evidencija preuzimanja radnih listova (ko je i kada preuzeo). Pokrenuti jednom u SQL Editoru ako je baza već napravljena.
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  worksheet_id uuid not null references public.worksheets(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists downloads_org_idx on public.downloads (org_id, created_at desc);

alter table public.downloads enable row level security;

drop policy if exists "downloads: upis svog" on public.downloads;
create policy "downloads: upis svog" on public.downloads for insert
  with check (user_id = auth.uid() and public.has_access(auth.uid()));

drop policy if exists "downloads: admin vrtica cita" on public.downloads;
create policy "downloads: admin vrtica cita" on public.downloads for select
  using (public.is_org_admin(org_id));
