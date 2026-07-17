-- Cierre de la fase administrativa: "fecha de actualización" y "autor o
-- cuenta creadora" por elemento en los listados de /admin. events ya tenía
-- created_by; places no tenía ningún rastro de quién lo creó — se agrega
-- para que ambos listados puedan mostrarlo de forma consistente.

alter table public.events
  add column updated_at timestamptz not null default now();

alter table public.places
  add column updated_at timestamptz not null default now(),
  add column created_by uuid references public.profiles (id) on delete set null;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();
