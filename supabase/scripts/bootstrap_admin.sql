-- supabase/scripts/bootstrap_admin.sql
-- Herramienta operativa parametrizada. Ningun UID fijo -- se provee en tiempo de ejecucion.
-- admin_id es un parametro obligatorio: si no se provee, psql no sustituye la
-- variable y la sentencia set_config() de abajo falla con un error de sintaxis
-- claro (ON_ERROR_STOP detiene el script) -- comportamiento intencional, no se
-- agrega manejo especial para este caso.
-- Uso: psql "$CONNECTION_STRING" -v admin_id="$ADMIN_ID" -f supabase/scripts/bootstrap_admin.sql
--
-- No es una migracion: vive fuera de supabase/migrations/ deliberadamente,
-- para no formar parte del historial que la CLI rastrea en
-- supabase_migrations.schema_migrations. Se ejecuta como paso operativo
-- puntual entre dos tramos de `supabase db push`, nunca vía SQL Editor.
\set ON_ERROR_STOP on

-- El parametro se pasa fuera del bloque DO $$ ... $$ mediante set_config(),
-- porque la sustitucion de variables de psql (:'var') no ocurre dentro de
-- contenido dollar-quoted -- ese cuerpo se envia como una cadena literal al
-- servidor. set_config() si ocurre en SQL ordinario, donde psql si sustituye.
select set_config('ahorita.bootstrap_admin_id', :'admin_id', false);

do $$
declare
  v_admin_id_text text := current_setting('ahorita.bootstrap_admin_id', true);
  v_admin_id uuid;
  v_profile_exists boolean;
  v_this_is_already_admin boolean;
  v_existing_admin_count integer;
  v_rows_updated integer;
  v_final_admin_count integer;
begin
  if v_admin_id_text is null or v_admin_id_text = '' then
    raise exception 'bootstrap_admin: admin_id no fue provisto.';
  end if;

  begin
    v_admin_id := v_admin_id_text::uuid;
  exception when invalid_text_representation then
    raise exception 'bootstrap_admin: admin_id "%" no es un UUID valido.', v_admin_id_text;
  end;

  select exists(select 1 from public.profiles where id = v_admin_id) into v_profile_exists;
  if not v_profile_exists then
    raise exception 'bootstrap_admin: no existe ningun perfil con el id provisto -- verificar que la cuenta se registro y que el disparador de creacion de profiles ya corrio.';
  end if;

  select count(*) into v_existing_admin_count from public.profiles where is_admin = true;
  select coalesce((select is_admin from public.profiles where id = v_admin_id), false) into v_this_is_already_admin;

  if v_existing_admin_count = 1 and v_this_is_already_admin then
    raise notice 'bootstrap_admin: sin cambios; ya era el unico administrador.';
  elsif v_existing_admin_count > 0 then
    raise exception 'bootstrap_admin: existe(n) % administrador(es) que no coincide(n) con el id provisto -- estado inesperado, revisar manualmente.', v_existing_admin_count;
  else
    update public.profiles set is_admin = true where id = v_admin_id;
    get diagnostics v_rows_updated = row_count;
    if v_rows_updated <> 1 then
      raise exception 'bootstrap_admin: se esperaba modificar exactamente 1 fila, se modificaron %.', v_rows_updated;
    end if;
    raise notice 'bootstrap_admin: administrador sembrado.';
  end if;

  select count(*) into v_final_admin_count from public.profiles where is_admin = true;
  if v_final_admin_count <> 1 then
    raise exception 'bootstrap_admin: verificacion final fallo -- hay % administradores, se esperaba exactamente 1.', v_final_admin_count;
  end if;

  raise notice 'bootstrap_admin: OK; administrador unico confirmado.';
end $$;

select set_config('ahorita.bootstrap_admin_id', null, false);
