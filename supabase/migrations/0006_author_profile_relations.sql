-- Reapunta los FK de autor a public.profiles (en vez de auth.users) para que
-- PostgREST pueda anidar el perfil del autor directamente en las consultas
-- (necesario para mostrar nombre de usuario + botón de "seguir").
-- profiles.id siempre existe antes de que un usuario publique (trigger en 0001).

alter table public.questions drop constraint questions_author_id_fkey;
alter table public.questions
  add constraint questions_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete cascade;

alter table public.answers drop constraint answers_author_id_fkey;
alter table public.answers
  add constraint answers_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete cascade;

alter table public.statuses drop constraint statuses_author_id_fkey;
alter table public.statuses
  add constraint statuses_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete cascade;
