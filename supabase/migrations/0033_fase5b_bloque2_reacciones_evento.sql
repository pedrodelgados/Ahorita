-- Fase 5B, Bloque 2: "Quiero ir" y "Ya fui" — reservados en el catálogo de
-- `interactions.type` desde la Fase 1 (migración 0015), nunca implementados
-- hasta ahora. Exclusivos de Eventos. Sin tabla nueva, sin cambio de RLS
-- (la política pública de `interactions` ya los cubre desde la Fase 1,
-- Bloque 4) y sin columnas de conteo desnormalizado (conteo en vivo,
-- decisión explícita del Product Owner para este bloque).
--
-- Única pieza nueva de esquema: la compuerta temporal, exigida en interfaz
-- y en base de datos porque esta señal alimentará en el futuro a la Guía
-- IA y un dato limpio en origen vale más que uno corregido después.
--
--   - "Ya fui" nunca puede registrarse antes de que el Evento comience
--     (now() < events.start_at).
--   - "Quiero ir" nunca puede registrarse por primera vez después de que
--     el Evento haya finalizado. La regla de "finalización" reutiliza
--     exactamente el mismo criterio que ya usa `lib/events.js` para decidir
--     qué eventos siguen "próximos" en el feed: `end_at` si existe, o
--     `start_at` si no lo tiene (un evento sin fecha de fin se trata como
--     un evento puntual que termina cuando empieza).
--   - Ninguna de las dos reglas restringe la eliminación (quitar una
--     interacción ya existente siempre está permitido, sin importar la
--     fecha) ni se aplica retroactivamente a filas ya existentes — no hay
--     ninguna, porque este es el primer uso real de estos dos tipos.

create function public.enforce_event_reaction_timing()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_start_at timestamptz;
  v_end_at timestamptz;
begin
  if new.type not in ('ya_fui', 'quiero_ir') then
    return new;
  end if;

  -- Exclusividad de Eventos reforzada aquí, no solo por ausencia de UI: sin
  -- esto, nada a nivel de base de datos impediría escribir 'quiero_ir'/
  -- 'ya_fui' contra una Publicación o Promoción llamando directo a la API.
  if new.target_type <> 'event' then
    raise exception '"Quiero ir" y "Ya fui" son exclusivos de Eventos.' using errcode = '23514';
  end if;

  select start_at, end_at into v_start_at, v_end_at
  from public.events
  where id = new.target_id;

  if v_start_at is null then
    return new;
  end if;

  if new.type = 'ya_fui' and now() < v_start_at then
    raise exception 'Todavía no puedes marcar "Ya fui" — este evento no ha comenzado.' using errcode = '23514';
  end if;

  if new.type = 'quiero_ir' and now() > coalesce(v_end_at, v_start_at) then
    raise exception 'Ya no puedes marcar "Quiero ir" — este evento ya finalizó.' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger enforce_event_reaction_timing_before_insert
  before insert on public.interactions
  for each row execute function public.enforce_event_reaction_timing();

comment on function public.enforce_event_reaction_timing() is
  'Fase 5B, Bloque 2: exclusividad de Eventos + compuerta temporal de "ya_fui"/"quiero_ir". Solo actúa en INSERT — quitar una interacción ya existente nunca se restringe, sin importar la fecha ni el target_type. "Finalización" de un evento = coalesce(end_at, start_at), mismo criterio que listUpcomingEvents (lib/events.js) usa para "próximos".';
