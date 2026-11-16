-- Fase 2: catálogos y contexto (ajustes, pilares, ofertas, objeciones, recursos de marca).
-- Todas las tablas: propietaria única (user_id), marca de ejemplo, seguridad por fila.

create or replace function public.tocar_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table public.ajustes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  nombre_marca text not null default 'Rosedal',
  audiencia_general text not null default '',
  tono_general text not null default '',
  ritmo_semanal jsonb,
  pasos_por_formato jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table public.pilares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  nombre text not null check (length(btrim(nombre)) > 0),
  descripcion text not null default '',
  color text not null default 'verde',
  orden integer not null default 0,
  archivado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ofertas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  nombre text not null check (length(btrim(nombre)) > 0),
  tipo text not null default 'producto' check (tipo in ('producto', 'servicio')),
  publico text not null default '',
  problema text not null default '',
  propuesta_valor text not null default '',
  via_compra text not null default '',
  via_compra_url text,
  precio text,
  activa boolean not null default true,
  archivada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.oferta_objeciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  oferta_id uuid not null references public.ofertas(id) on delete cascade,
  objecion text not null check (length(btrim(objecion)) > 0),
  respuesta text,
  idea_id uuid, -- se enlazará a ideas en la Fase 3
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recursos_marca (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  tipo text not null check (tipo in ('tono', 'cta', 'testimonio', 'plano', 'enlace_venta', 'gancho', 'hashtags')),
  titulo text not null default '',
  texto text not null default '',
  url text,
  autor text,
  autorizado boolean not null default false,
  oferta_id uuid references public.ofertas(id) on delete set null,
  eliminado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices en user_id y claves foráneas
create index on public.pilares (user_id);
create index on public.ofertas (user_id);
create index on public.oferta_objeciones (user_id);
create index on public.oferta_objeciones (oferta_id);
create index on public.recursos_marca (user_id);
create index on public.recursos_marca (oferta_id);

-- Seguridad por fila y marca de tiempo, igual para todas
do $$
declare t text;
begin
  foreach t in array array['ajustes', 'pilares', 'ofertas', 'oferta_objeciones', 'recursos_marca'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "propietaria" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format(
      'create trigger tocar_updated_at before update on public.%I
         for each row execute function public.tocar_updated_at()', t);
  end loop;
end $$;
