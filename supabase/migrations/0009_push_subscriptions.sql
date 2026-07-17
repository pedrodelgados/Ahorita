-- Suscripciones Web Push (notificaciones push reales, sin depender de Firebase).
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "El usuario ve sus propias suscripciones" on public.push_subscriptions
  for select using (auth.uid() = user_id);

create policy "El usuario crea su suscripción" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "El usuario borra su suscripción" on public.push_subscriptions
  for delete using (auth.uid() = user_id);
