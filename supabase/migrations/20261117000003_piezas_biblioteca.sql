-- Fase 4: entidad central de contenido y versiones de guion/asunto.
-- Las referencias a lanzamiento y frase se conectarán en sus fases respectivas.

create table public.piezas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  idea_id uuid references public.ideas(id) on delete set null,
  origen_pieza_id uuid references public.piezas(id) on delete set null,
  relacion_origen text check (relacion_origen in ('adaptacion', 'reutilizacion')),
  angulo text,
  frase_id uuid,
  titulo text not null check (length(btrim(titulo)) > 0),
  formato text not null default 'reel' check (formato in ('reel', 'reel_prueba', 'carrusel', 'post', 'stories', 'email', 'otro')),
  canal text not null default 'instagram' check (canal in ('instagram', 'tiktok', 'youtube', 'linkedin', 'email', 'otro')),
  pilar_id uuid references public.pilares(id) on delete set null,
  finalidad text check (finalidad in ('attract', 'nurture', 'position', 'convert')),
  oferta_id uuid references public.ofertas(id) on delete set null,
  lanzamiento_id uuid,
  fase_id uuid,
  cta_accion text,
  cta_como text,
  cta_url text,
  texto_publicacion text not null default '',
  texto_en_pantalla text not null default '',
  notas text not null default '',
  email_preview text,
  email_cuerpo_html text,
  email_tematica text,
  email_audiencia text,
  plano text,
  preparacion text,
  duracion_seg integer check (duracion_seg >= 0),
  grabado boolean not null default false,
  grabado_en timestamptz,
  estado text not null default 'borrador' check (estado in ('borrador', 'en_preparacion', 'listo', 'planificado', 'publicado')),
  fecha_prevista date,
  fecha_real date,
  url_publicada text,
  retomar_el date,
  publicado_snapshot jsonb,
  eliminado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (relacion_origen is null and origen_pieza_id is null)
    or (relacion_origen is not null and origen_pieza_id is not null)
  )
);

create table public.pieza_versiones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  pieza_id uuid not null references public.piezas(id) on delete cascade,
  tipo text not null default 'guion' check (tipo in ('guion', 'asunto')),
  nombre text not null check (length(btrim(nombre)) > 0),
  gancho text not null default '',
  desarrollo text not null default '',
  cierre text not null default '',
  asunto text not null default '',
  elegida boolean not null default false,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index pieza_version_unica_elegida
  on public.pieza_versiones (pieza_id, tipo) where elegida;
create index on public.piezas (user_id);
create index on public.piezas (idea_id);
create index on public.piezas (origen_pieza_id);
create index on public.piezas (pilar_id);
create index on public.piezas (oferta_id);
create index on public.piezas (estado);
create index on public.piezas (fecha_prevista);
create index on public.pieza_versiones (user_id);
create index on public.pieza_versiones (pieza_id);

alter table public.piezas enable row level security;
alter table public.pieza_versiones enable row level security;

create policy "propietaria" on public.piezas for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "propietaria" on public.pieza_versiones for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create trigger tocar_updated_at before update on public.piezas
  for each row execute function public.tocar_updated_at();
create trigger tocar_updated_at before update on public.pieza_versiones
  for each row execute function public.tocar_updated_at();
