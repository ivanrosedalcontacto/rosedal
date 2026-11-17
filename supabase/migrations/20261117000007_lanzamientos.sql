-- Fase 8: lanzamientos con sus fases e hitos, y plantillas de partida aplicables.
-- Las piezas siguen viviendo en `piezas`: aquí solo se enlazan a un lanzamiento y a una fase.

create table public.lanzamientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  nombre text not null check (length(btrim(nombre)) > 0),
  oferta_id uuid references public.ofertas(id) on delete set null,
  objetivo text not null default '',
  fecha_inicio date,
  fecha_fin date,
  estado text not null default 'en_preparacion' check (estado in ('en_preparacion', 'en_curso', 'terminado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lanzamiento_fases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  lanzamiento_id uuid not null references public.lanzamientos(id) on delete cascade,
  tipo text not null check (tipo in ('expectacion', 'apertura', 'venta', 'cierre', 'seguimiento')),
  nombre text not null check (length(btrim(nombre)) > 0),
  fecha_inicio date,
  fecha_fin date,
  orden integer not null default 0,
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lanzamiento_id, tipo)
);

create table public.lanzamiento_hitos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  lanzamiento_id uuid not null references public.lanzamientos(id) on delete cascade,
  fase_id uuid references public.lanzamiento_fases(id) on delete set null,
  titulo text not null check (length(btrim(titulo)) > 0),
  fecha date not null,
  hecho boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Las columnas ya existían sin clave foránea; se conectan ahora.
alter table public.piezas
  add constraint piezas_lanzamiento_id_fkey foreign key (lanzamiento_id) references public.lanzamientos(id) on delete set null,
  add constraint piezas_fase_id_fkey foreign key (fase_id) references public.lanzamiento_fases(id) on delete set null;
alter table public.ideas
  add constraint ideas_lanzamiento_id_fkey foreign key (lanzamiento_id) references public.lanzamientos(id) on delete set null;
alter table public.secuencias_email
  add constraint secuencias_email_lanzamiento_id_fkey foreign key (lanzamiento_id) references public.lanzamientos(id) on delete set null;

-- Las plantillas de partida se reconocen por su clave para no duplicarlas al sembrarlas.
alter table public.plantillas add column clave text;
create unique index plantillas_clave_por_usuario on public.plantillas (user_id, clave) where clave is not null;

create index on public.lanzamientos (user_id);
create index on public.lanzamientos (oferta_id);
create index on public.lanzamientos (estado);
create index on public.lanzamiento_fases (user_id);
create index on public.lanzamiento_fases (lanzamiento_id, orden);
create index on public.lanzamiento_hitos (user_id);
create index on public.lanzamiento_hitos (lanzamiento_id, fecha);
create index on public.piezas (lanzamiento_id);
create index on public.piezas (fase_id);

alter table public.lanzamientos enable row level security;
alter table public.lanzamiento_fases enable row level security;
alter table public.lanzamiento_hitos enable row level security;

do $$
declare t text;
begin
  foreach t in array array['lanzamientos', 'lanzamiento_fases', 'lanzamiento_hitos'] loop
    execute format('create policy "propietaria" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create trigger tocar_updated_at before update on public.%I for each row execute function public.tocar_updated_at()', t);
  end loop;
end $$;
