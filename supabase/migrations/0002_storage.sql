-- Bucket público para fotos/videos de estados y negocios.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Media es pública para lectura" on storage.objects
  for select using (bucket_id = 'media');

create policy "Usuarios autenticados suben media" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
