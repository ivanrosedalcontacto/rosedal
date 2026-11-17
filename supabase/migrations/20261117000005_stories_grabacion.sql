-- Fase 6: tarjetas de stories y días de grabación.
create table public.story_tarjetas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  pieza_id uuid not null references public.piezas(id) on delete cascade,
  orden integer not null default 0,
  titulo text not null default '',
  que_digo text not null default '',
  texto_pantalla text not null default '',
  visual text not null default '',
  interaccion text not null default 'ninguna' check (interaccion in ('ninguna', 'encuesta', 'pregunta', 'enlace', 'cta')),
  interaccion_detalle text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sesiones_grabacion (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  nombre text not null check (length(btrim(nombre)) > 0),
  fecha date,
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sesion_piezas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  sesion_id uuid not null references public.sesiones_grabacion(id) on delete cascade,
  pieza_id uuid not null references public.piezas(id) on delete cascade,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sesion_id, pieza_id)
);

create index on public.story_tarjetas (user_id);
create index on public.story_tarjetas (pieza_id, orden);
create index on public.sesiones_grabacion (user_id);
create index on public.sesion_piezas (user_id);
create index on public.sesion_piezas (sesion_id, orden);
create index on public.sesion_piezas (pieza_id);

alter table public.story_tarjetas enable row level security;
alter table public.sesiones_grabacion enable row level security;
alter table public.sesion_piezas enable row level security;

do $$
declare t text;
begin
  foreach t in array array['story_tarjetas', 'sesiones_grabacion', 'sesion_piezas'] loop
    execute format('create policy "propietaria" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create trigger tocar_updated_at before update on public.%I for each row execute function public.tocar_updated_at()', t);
  end loop;
end $$;
