-- supabase/scripts/backfill_editorial_selections.sql
-- Herramienta operativa idempotente, sin parámetros. Migra los eventos
-- legacy con events.editor_pick = true hacia editorial_selections,
-- atribuidos al administrador real ya sembrado por bootstrap_admin.sql.
--
-- Extraída de 0040_fase6_bloque3_motor_editorial.sql como corrección
-- preproducción (ver PROJECT.md y supabase/README.md): la migración de
-- esquema no debía depender de que ya existiera un administrador real.
--
-- Uso: psql "$CONNECTION_STRING" -f supabase/scripts/backfill_editorial_selections.sql
-- Requiere: bootstrap_admin.sql ya ejecutado, y el DDL del Motor
-- Editorial (migración 0040) ya aplicado.
-- No es una migración: vive fuera de supabase/migrations/ deliberadamente,
-- mismo motivo que bootstrap_admin.sql -- se ejecuta como paso operativo
-- puntual, nunca vía SQL Editor.
--
-- Reversión manual (no mantenida como script separado, mismo patrón que
-- el resto de reversiones de este proyecto):
--   delete from public.editorial_selections
--   where target_type = 'event'
--     and target_id in (select id from public.events where editor_pick = true);
-- No afecta events.editor_pick, que conserva su valor legacy intacto.
\set ON_ERROR_STOP on

do $$
declare
  v_admin_id uuid;
  v_migrated_count integer;
  v_row record;
begin
  select id into v_admin_id
  from public.profiles
  where is_admin = true
  order by created_at asc, id asc
  limit 1;

  if v_admin_id is null then
    raise exception 'backfill_editorial_selections: no existe ningún administrador registrado -- ejecutar primero bootstrap_admin.sql.';
  end if;

  insert into public.editorial_selections (target_type, target_id, reason_code, decided_by, decided_at)
  select 'event', e.id, 'seleccionado_equipo', v_admin_id, now()
  from public.events e
  where e.editor_pick = true
  on conflict (target_type, target_id) do nothing;

  get diagnostics v_migrated_count = row_count;
  raise notice 'backfill_editorial_selections: % eventos migrados en esta ejecución.', v_migrated_count;

  for v_row in
    select es.target_id, e.title
    from public.editorial_selections es
    join public.events e on e.id = es.target_id
    where es.target_type = 'event'
      and e.editor_pick = true
    order by e.title
  loop
    raise notice 'backfill_editorial_selections: presente -- % (%)', v_row.title, v_row.target_id;
  end loop;

  raise notice 'backfill_editorial_selections: OK.';
end $$;
