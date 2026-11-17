-- Fase 5: historial de usos de una frase. «Sin usar» se deriva de estas filas.
create table public.frase_usos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  es_demo boolean not null default false,
  frase_id uuid not null references public.frases(id) on delete cascade,
  pieza_id uuid references public.piezas(id) on delete set null,
  fecha date not null,
  url text,
  texto_usado text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un reel de prueba publicado solo registra una vez la frase, incluso si se pulsa publicar otra vez.
create unique index frase_uso_unico_por_pieza
  on public.frase_usos (pieza_id) where pieza_id is not null;
create index on public.frase_usos (user_id);
create index on public.frase_usos (frase_id);
create index on public.frase_usos (pieza_id);

alter table public.frase_usos enable row level security;
create policy "propietaria" on public.frase_usos for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create trigger tocar_updated_at before update on public.frase_usos
  for each row execute function public.tocar_updated_at();
