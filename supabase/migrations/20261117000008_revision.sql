-- Fase 10: revisión semanal con métricas por pieza y mapa de pilares × finalidades.
-- Las métricas son una fila por pieza y métrica: sin fila = «no la sigo»;
-- con valor nulo = pendiente; con valor = registrado (el cero también cuenta).

create table public.pieza_metricas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  pieza_id uuid not null references public.piezas(id) on delete cascade,
  clave text not null check (length(btrim(clave)) > 0),
  valor numeric,
  atribucion text check (atribucion in ('confirmada', 'sin_atribuir')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pieza_id, clave)
);

-- Lo que se aprende de cada pieza y la nota de «retomar el…».
alter table public.piezas add column aprendizaje text;
alter table public.piezas add column nota_retomar text;

create index on public.pieza_metricas (user_id);
create index on public.pieza_metricas (pieza_id);

alter table public.pieza_metricas enable row level security;
create policy "propietaria" on public.pieza_metricas for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create trigger tocar_updated_at before update on public.pieza_metricas for each row execute function public.tocar_updated_at();
