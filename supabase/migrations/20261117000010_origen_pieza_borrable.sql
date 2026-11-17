-- Borrar una pieza de origen dejaba a sus adaptaciones con origen_pieza_id nulo y
-- relacion_origen informada, y el check lo rechazaba (no se podía quitar el ejemplo
-- ni vaciar la papelera). Ahora se permite conservar la relación sin pieza de origen.
alter table public.piezas drop constraint piezas_check;
alter table public.piezas add constraint piezas_origen_check
  check (origen_pieza_id is null or relacion_origen is not null);
