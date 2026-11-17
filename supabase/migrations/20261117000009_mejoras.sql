-- Fase 12: mejoras de mercado (A5 copia de seguridad, A8 historial de fechas, B1 fechas señaladas,
-- B3 lista de pasos por pieza, B5 contenido perenne, B8 balance de lanzamiento).

alter table public.piezas add column hora_prevista time;
alter table public.piezas add column perenne boolean not null default false;
alter table public.lanzamientos add column balance text;
alter table public.sesion_piezas add column preparado boolean not null default false;

-- A8: cada cambio de fecha prevista queda anotado.
create table public.pieza_cambios_fecha (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  pieza_id uuid not null references public.piezas(id) on delete cascade,
  fecha_anterior date,
  fecha_nueva date,
  cambiado_en timestamptz not null default now()
);

-- B3: casillas propias de cada pieza.
create table public.pieza_pasos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  pieza_id uuid not null references public.piezas(id) on delete cascade,
  texto text not null check (length(btrim(texto)) > 0),
  hecho boolean not null default false,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pieza_id, orden)
);

-- B1: días que condicionan la planificación, sin ser piezas.
create table public.fechas_senaladas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  titulo text not null check (length(btrim(titulo)) > 0),
  fecha_inicio date not null,
  fecha_fin date,
  nota text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.pieza_cambios_fecha (user_id);
create index on public.pieza_cambios_fecha (pieza_id, cambiado_en desc);
create index on public.pieza_pasos (user_id);
create index on public.pieza_pasos (pieza_id, orden);
create index on public.fechas_senaladas (user_id);
create index on public.fechas_senaladas (fecha_inicio);

alter table public.pieza_cambios_fecha enable row level security;
alter table public.pieza_pasos enable row level security;
alter table public.fechas_senaladas enable row level security;

create policy "propietaria" on public.pieza_cambios_fecha for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "propietaria" on public.pieza_pasos for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "propietaria" on public.fechas_senaladas for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create trigger tocar_updated_at before update on public.pieza_pasos for each row execute function public.tocar_updated_at();
create trigger tocar_updated_at before update on public.fechas_senaladas for each row execute function public.tocar_updated_at();
