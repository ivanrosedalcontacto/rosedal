-- PRP-002 Fase 1: estados Borrador · Grabado · Editado · Publicado.
-- No borra filas ni columnas. «planificado» deja de ser estado: la fecha prevista se conserva.
-- Se ejecuta en una transacción: si algo falla, no cambia nada.
begin;

alter table public.piezas drop constraint if exists piezas_estado_check;
alter table public.piezas add constraint piezas_estado_check
  check (estado in ('borrador', 'en_preparacion', 'listo', 'planificado', 'grabado', 'editado', 'publicado'));

-- Las piezas publicadas no se tocan (tienen copia congelada).
update public.piezas set estado = 'editado'
  where estado in ('listo', 'planificado');
update public.piezas set estado = 'grabado'
  where estado in ('borrador', 'en_preparacion') and grabado and formato <> 'email';
update public.piezas set estado = 'borrador'
  where estado = 'en_preparacion';

alter table public.piezas drop constraint piezas_estado_check;
alter table public.piezas add constraint piezas_estado_check
  check (estado in ('borrador', 'grabado', 'editado', 'publicado'));

commit;
