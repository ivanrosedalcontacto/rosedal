-- Fase 3: ideas, ángulos y frases (las frases se amplían con usos en la Fase 5).

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  texto text not null check (length(btrim(texto)) > 0),
  tipo text not null default 'idea' check (tipo in ('idea', 'idea_email', 'pregunta', 'objecion')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_desarrollo', 'archivada')),
  pilar_id uuid references public.pilares(id) on delete set null,
  oferta_id uuid references public.ofertas(id) on delete set null,
  lanzamiento_id uuid, -- FK a lanzamientos en la Fase 8
  tema text,
  problema_audiencia text,
  palabras_originales text,
  procedencia text,
  veces_aparecida integer not null default 1 check (veces_aparecida >= 1),
  relevancia smallint check (relevancia between 1 and 3),
  demanda smallint check (demanda between 1 and 3),
  minutos_preparacion integer check (minutos_preparacion >= 0),
  notas text not null default '',
  eliminado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.idea_angulos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  tipo text not null check (tipo in ('tutorial', 'historia_personal', 'error_frecuente', 'demostracion', 'caso_real', 'objecion_compra', 'otro')),
  nota text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (idea_id, tipo)
);

create table public.frases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  texto text not null check (length(btrim(texto)) > 0), -- se guarda tal cual, con sus saltos de línea
  favorita boolean not null default false,
  frase_origen_id uuid references public.frases(id) on delete set null,
  notas text not null default '',
  archivada boolean not null default false,
  eliminado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.oferta_objeciones
  add constraint oferta_objeciones_idea_fk foreign key (idea_id) references public.ideas(id) on delete set null;

create index on public.ideas (user_id);
create index on public.ideas (pilar_id);
create index on public.ideas (oferta_id);
create index on public.idea_angulos (user_id);
create index on public.idea_angulos (idea_id);
create index on public.frases (user_id);
create index on public.frases (frase_origen_id);
create index on public.oferta_objeciones (idea_id);

do $$
declare t text;
begin
  foreach t in array array['ideas', 'idea_angulos', 'frases'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "propietaria" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format(
      'create trigger tocar_updated_at before update on public.%I
         for each row execute function public.tocar_updated_at()', t);
  end loop;
end $$;
