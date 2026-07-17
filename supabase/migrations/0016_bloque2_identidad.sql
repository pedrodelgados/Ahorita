-- Fase 1 del ecosistema social (ver MASTERPLAN.md), Bloque 2: identidad.
-- Vincula profiles y businesses con actors: crea un Actor por cada fila ya
-- existente de ambas tablas, y dos triggers para que la correspondencia se
-- mantenga verdadera también para cada profile/business que se cree de aquí
-- en adelante — sin los triggers, la garantía de "cada profile/business
-- tiene su actor" solo sería cierta en el instante en que corre esta
-- migración, y empezaría a romperse con el primer registro nuevo.
--
-- Explícitamente NO incluido en este bloque (queda para bloques
-- posteriores, según lo acordado): separación de events hacia
-- event_details, migración de post_likes/saved_places/saved_events/follows
-- hacia interactions, asignación de zones a places, activación del
-- mecanismo de privacidad, y cualquier cambio visible en la interfaz.
--
-- No se altera ninguna columna de profiles ni de businesses: la relación
-- ya vive completa en actors.profile_id / actors.business_id, creados en
-- el Bloque 1 (0015). Este bloque solo agrega filas a actors y dos
-- funciones/triggers nuevos — profiles y businesses quedan intactas.

-- ---------------------------------------------------------------------------
-- Backfill: un Actor por cada profile ya existente. `where not exists` hace
-- este insert seguro de re-ejecutar, además de la restricción unique ya
-- existente en actors.profile_id desde el Bloque 1.
-- ---------------------------------------------------------------------------
insert into public.actors (type, profile_id, display_name)
select
  'persona',
  p.id,
  coalesce(nullif(p.username, ''), 'Usuario ' || substr(p.id::text, 1, 8))
from public.profiles p
where not exists (select 1 from public.actors a where a.profile_id = p.id);

-- ---------------------------------------------------------------------------
-- Backfill: un Actor por cada business ya existente. Todos los negocios
-- existentes son tipo 'negocio' — no existe hoy ninguna distinción real de
-- datos entre 'negocio' y 'organizador' (esa distinción, si se necesita,
-- pertenece a una fase posterior que la introduzca con datos reales, no a
-- este bloque).
-- ---------------------------------------------------------------------------
insert into public.actors (type, business_id, display_name)
select 'negocio', b.id, b.name
from public.businesses b
where not exists (select 1 from public.actors a where a.business_id = b.id);

-- ---------------------------------------------------------------------------
-- Triggers: mantienen la correspondencia hacia adelante. security definer
-- con el mismo patrón que ya usa public.handle_new_user (0001_init.sql) —
-- necesario porque ni un usuario registrándose ni un dueño de negocio
-- registrando su negocio tienen permiso para insertar en actors
-- directamente (la única política de insert en actors, del Bloque 1, es
-- para actores de tipo 'sistema' y solo para administradores).
-- `on conflict ... do nothing` es una segunda capa de protección contra
-- duplicados, redundante con la restricción unique pero explícita.
-- ---------------------------------------------------------------------------
create function public.handle_new_profile_actor()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.actors (type, profile_id, display_name)
  values (
    'persona',
    new.id,
    coalesce(nullif(new.username, ''), 'Usuario ' || substr(new.id::text, 1, 8))
  )
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

create trigger on_profile_created_actor
  after insert on public.profiles
  for each row execute function public.handle_new_profile_actor();

create function public.handle_new_business_actor()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.actors (type, business_id, display_name)
  values ('negocio', new.id, new.name)
  on conflict (business_id) do nothing;
  return new;
end;
$$;

create trigger on_business_created_actor
  after insert on public.businesses
  for each row execute function public.handle_new_business_actor();
