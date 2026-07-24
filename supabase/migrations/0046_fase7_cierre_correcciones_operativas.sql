-- Fase 7 — cierre: correcciones estructurales de la auditoría transversal
-- final (H1). H2, H3 y H4 son correcciones de lógica de aplicación
-- (Edge Functions), sin ningún cambio de esquema -- ver
-- process-account-deletions/index.ts y ai-guide/context.ts.
--
-- H1 (importante, defecto funcional/concurrencia): nada impedía que una
-- persona (por un doble clic real, ver AccountDataSection.jsx) creara más
-- de una fila `data_requests` pendiente de tipo `eliminacion` a la vez.
-- `AccountDataSection` solo mostraba y permitía cancelar la primera que
-- encontraba -- una segunda fila pendiente, invisible para la persona,
-- habría sobrevivido a esa cancelación y `process-account-deletions` la
-- habría procesado igual al vencer su propio plazo.
--
-- Corrección: un índice único parcial que garantiza, del lado del
-- servidor (nunca solo en el frontend), que jamás exista más de una
-- solicitud PENDIENTE de eliminación por persona -- sin restringir en
-- absoluto cuántas solicitudes completadas, canceladas o rechazadas
-- puede acumular esa misma persona a lo largo del tiempo (cada una sigue
-- siendo, como siempre, parte permanente de su propia trazabilidad). Un
-- segundo intento de insertar mientras la primera sigue pendiente falla
-- con una violación de unicidad (código Postgres 23505) -- el llamador
-- (lib/privacy.js) la reconoce explícitamente y responde con la solicitud
-- ya existente en vez de propagar un error críptico.
create unique index data_requests_one_pending_eliminacion_per_user
  on public.data_requests (user_id)
  where type = 'eliminacion' and status = 'pendiente';

comment on index public.data_requests_one_pending_eliminacion_per_user is
  'Fase 7 (cierre, auditoría transversal, hallazgo H1): garantiza que una persona nunca tenga más de una solicitud de eliminación de cuenta pendiente a la vez -- índice parcial, nunca restringe solicitudes ya completadas, canceladas o rechazadas.';
