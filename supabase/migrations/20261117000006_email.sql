-- Fase 7: secuencias de correo y plantillas.
-- Los correos siguen viviendo en `piezas` (formato = email); esta fase solo añade
-- la pertenencia a una secuencia, sus plazos y la plantilla de estructura.

create table public.secuencias_email (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  nombre text not null check (length(btrim(nombre)) > 0),
  tipo text not null default 'otra' check (tipo in ('bienvenida', 'lanzamiento', 'poscompra', 'upsell', 'otra')),
  programacion text not null default 'relativa' check (programacion in ('relativa', 'fechas')),
  audiencia text not null default '',
  disparador text not null default '',
  objetivo text not null default '',
  oferta_id uuid references public.ofertas(id) on delete set null,
  lanzamiento_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.secuencia_pasos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  secuencia_id uuid not null references public.secuencias_email(id) on delete cascade,
  pieza_id uuid not null references public.piezas(id) on delete cascade,
  orden integer not null default 0,
  plazo_cantidad integer check (plazo_cantidad >= 0),
  plazo_unidad text check (plazo_unidad in ('horas', 'dias')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un correo pertenece como máximo a una secuencia.
  unique (pieza_id)
);

create table public.plantillas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  tipo text not null check (tipo in ('lanzamiento', 'stories', 'secuencia_email')),
  nombre text not null check (length(btrim(nombre)) > 0),
  descripcion text not null default '',
  contenido jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.secuencias_email (user_id);
create index on public.secuencias_email (oferta_id);
create index on public.secuencia_pasos (user_id);
create index on public.secuencia_pasos (secuencia_id, orden);
create index on public.secuencia_pasos (pieza_id);
create index on public.plantillas (user_id);
create index on public.plantillas (tipo);

alter table public.secuencias_email enable row level security;
alter table public.secuencia_pasos enable row level security;
alter table public.plantillas enable row level security;

do $$
declare t text;
begin
  foreach t in array array['secuencias_email', 'secuencia_pasos', 'plantillas'] loop
    execute format('create policy "propietaria" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create trigger tocar_updated_at before update on public.%I for each row execute function public.tocar_updated_at()', t);
  end loop;
end $$;
