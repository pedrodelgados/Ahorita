-- Fase 7, Bloque 5 (Experiencia unificada de transparencia, corrección y
-- borrado): la persona ejerce por primera vez desde la interfaz los
-- mecanismos de exportación y eliminación de cuenta que la Fase 1, Bloque 5
-- ya construyó pero nunca expuso -- ver el análisis conceptual y el diseño
-- técnico aprobados en PROJECT.md. La experiencia en sí (componentes de
-- React, lib/privacy.js) no requiere ninguna migración: reutiliza
-- exactamente el esquema y las políticas RLS ya aprobadas en
-- 0019_bloque5_privacidad.sql.
--
-- Único cambio de esquema que este bloque sí necesita: `data_requests.
-- scheduled_for` no tenía ningún valor por defecto ni disparador que lo
-- calculara -- nada fijaba hasta ahora los 30 días de periodo de gracia ya
-- aprobados como decisión de producto desde el Bloque 5 original de la
-- Fase 1 (ver PROJECT.md). Mientras esa fila solo se insertaba a mano en
-- pruebas, la ausencia de un valor calculado no importaba; ahora que una
-- persona real puede crear la solicitud desde la interfaz, esa garantía
-- debe calcularse del lado del servidor -- nunca depender del reloj del
-- dispositivo de quien la solicita, decisión explícita del Product Owner
-- al aprobar el diseño técnico de este bloque.
create function public.set_deletion_scheduled_for()
returns trigger
language plpgsql
as $$
begin
  if new.type = 'eliminacion' and new.scheduled_for is null then
    new.scheduled_for := now() + interval '30 days';
  end if;
  return new;
end;
$$;

create trigger before_insert_data_request_scheduled_for
  before insert on public.data_requests
  for each row execute function public.set_deletion_scheduled_for();
