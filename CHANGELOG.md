# Changelog

Registro de cambios notables de Ahorita (Cuenca Viva). Formato libre, en español, más cercano a un registro de fases de producto que a versiones semánticas — ver `PROJECT.md` para el plan completo y el estado real de la implementación.

## 2026-08-09 — A3 cerrado: secretos y credenciales de producción separados de desarrollo

Tercer ítem bloqueante de `BETA_READINESS_CHECKLIST.md` (A3) verificado, bajo el alcance aclarado en el commit `2b25b75`: higiene y separación de secretos de los componentes ya desplegados en producción (frontend en Vercel, base de datos `ahorita-production`), sin exigir el despliegue anticipado de las Edge Functions de A8/A9/A10/A11/A16-bis.

### Verificado
- Grep exhaustivo del repositorio y su historial de git: sin secretos, tokens ni credenciales hardcodeadas; `.env` nunca commiteado.
- Inventario de variables consumidas por el cliente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`): las tres diseñadas para ser públicas por su propio proveedor; ningún secreto de servidor alcanzable desde el frontend.
- Evidencia real de producción: el frontend desplegado conecta correctamente contra el project ref de `ahorita-production` (confirmado en Network y en el dashboard de Supabase); Vercel Production solo contiene las dos variables esperadas; la clave configurada es la `anon`/`public` legacy, separada de `service_role`/`secret` (nunca revelada).
- Limitación documentada con honestidad: sin comparación byte por byte ni decodificación del payload de la JWT — conclusión apoyada en evidencia convergente, no en verificación criptográfica exhaustiva.

## 2026-08-07 — A2 cerrado: frontend desplegado, PWA validada

Segundo ítem bloqueante de `BETA_READINESS_CHECKLIST.md` (A2) verificado con evidencia real: despliegue del frontend en Vercel y validación de la PWA en un dispositivo Android real y en escritorio. Incluye dos defectos reales de producción encontrados y corregidos durante la validación.

### Agregado
- `vercel.json` (nuevo): rewrites de fallback SPA para `react-router-dom`.
- `workbox-core` promovida a dependencia directa de desarrollo (antes transitiva), usada por la corrección del service worker.

### Corregido
- `src/lib/feed.js`: faltaba el import de `supabase`, causando un `ReferenceError` en producción al cargar el feed (único archivo de `src/lib/` con esta omisión; no detectado por `npm run lint` ni por el build).
- `src/sw.js`: faltaban `self.skipWaiting()` y `clientsClaim()`, dejando el service worker nuevo indefinidamente en estado "esperando a activarse" tras cada despliegue en vez de tomar control de la página — encontrado durante la prueba de actualización en escritorio.

### Verificado contra el despliegue real de Vercel y un dispositivo Android real
- Instalación, sesión, pérdida/recuperación de conectividad y persistencia de logout verificadas en un dispositivo Android real; prueba de actualización (marcador visible, añadido y retirado) repetida en Android tras la corrección del service worker, con resultado exitoso.
- En escritorio: verificación forense de invalidación de caché (Cache Storage) y de ausencia de datos residuales tras logout (Local/Session Storage, IndexedDB) en DevTools.
- Hallazgo aclarado, no defecto: feed vacío en producción — causa real fue el vencimiento de los eventos de semilla (`0012_seed_events.sql`), confirmado con consulta directa a la base de producción; sin cambios en `compose_feed()` ni en los seeds.
- Limitación metodológica documentada explícitamente: la invalidación de caché y la ausencia de residuales tras logout se verificaron de forma forense solo en escritorio; en Android se verificaron de forma funcional (comportamiento observado), no forense (sin inspección directa de Cache Storage/almacenamiento del dispositivo).
- Sin soporte offline completo: la PWA no navega entre rutas sin conexión — limitación declarada, no una prueba fallida.

## 2026-07-29 — A1 cerrado: infraestructura Supabase de producción operativa

Primer ítem bloqueante de `BETA_READINESS_CHECKLIST.md` (A1) verificado con evidencia real contra el proyecto de producción `ahorita-production`. Incluye una corrección preproducción de la migración `0040`, la única de las 46 corregida reabriendo su propio archivo en vez de hacia adelante, y el primer bootstrap real de administrador y backfill editorial.

### Corregido
- `supabase/migrations/0040_fase6_bloque3_motor_editorial.sql`: se extrajo el backfill de `events.editor_pick → editorial_selections` (que exigía un administrador ya existente y abortaba toda la secuencia de migraciones si no lo encontraba) hacia una herramienta operativa separada. Ninguna versión había llegado a aplicarse contra ningún proyecto remoto; justificado porque el defecto aborta la aplicación completa antes de que cualquier migración posterior pueda alcanzarse, haciendo inviable una corrección hacia adelante. Sin cambio de comportamiento del producto ni de las garantías de Fase 6 — misma semántica histórica del backfill, ahora ejecutada como paso operativo separado. Prueba de equivalencia funcional documentada en `PROJECT.md`.

### Agregado
- `supabase/scripts/backfill_editorial_selections.sql` (nuevo): herramienta operativa idempotente, sin parámetros, que migra los eventos legacy con `editor_pick = true` hacia `editorial_selections`, atribuidos al administrador real ya sembrado por `bootstrap_admin.sql`. Mismo patrón que `bootstrap_admin.sql` — fuera de `supabase/migrations/` deliberadamente.
- `BETA_READINESS_CHECKLIST.md`: ítem A1 marcado **Hecho**; nueva nota bajo la tabla de la sección A documentando la corrección de `0040` y la condición permanente para futuras aplicaciones desde cero (A14, CI, entornos nuevos).
- `supabase/README.md`: addendum de corrección preproducción junto a la entrada de `0040`; nueva sección "Sembrar el primer administrador y el backfill del Motor Editorial".

### Verificado contra `ahorita-production` real
- `db push --include-all`: las 46 migraciones aplicadas sin error, en una sola pasada, incluida `0040` ya corregida (salida conservada en `db_push_output.txt`).
- `migration list`: las 46 versiones confirmadas en Local y Remote (`migration_list_post_push.txt`).
- Verificación estructural: las 4 funciones públicas del Motor Editorial confirmadas por catálogo del sistema (`pg_proc`).
- Cuenta Auth real del administrador creada; disparador de `profiles` confirmado (exactamente una fila); `bootstrap_admin.sql` ejecutado, exactamente un administrador.
- `backfill_editorial_selections.sql`: 3 eventos migrados en la primera ejecución, 0 en una segunda ejecución inmediata (idempotencia real, no solo de código) — conteo final de 3 filas, sin duplicados, `decided_by` coincidente con el administrador sembrado.
- Hallazgo aclarado, no defecto: `candidatos_editorial()` solo mostraba 2 de las 3 selecciones — causa real localizada en `pg_get_functiondef`: vigencia propia del evento (`coalesce(e.end_at, e.start_at) >= now()` en `editorial_eligible`), no `es.ends_at` ni ningún fallo del backfill.

## 2026-07-25 — Registro de `BETA_READINESS_CHECKLIST.md`

Se registra como archivo del proyecto la checklist de preparación para la beta real en Cuenca, construida en dos rondas de revisión crítica más una evaluación específica de tres incorporaciones potenciales (gestión de identidad, push transaccional, distribución en tiendas). Explícitamente **no** es un documento canónico — es una checklist operativa viva, subordinada a `ETAPA_PRODUCTO_VIVO.md`, sin filosofía ni contrato propios. Sin código, sin migraciones, sin cambios funcionales.

### Agregado
- `BETA_READINESS_CHECKLIST.md` (nuevo): 22 ítems bloqueantes antes de la primera persona real (A1-A22, incluyendo A16-bis de notificaciones push transaccionales y A5 ampliado con verificación de cambio de dispositivo), 3 verificaciones de la primera semana de beta (B1-B3), y 4 condiciones antes de ampliar el grupo piloto (C1-C4). Incluye una sección explícita de exclusiones justificadas por ausencia de evidencia, no por costumbre: login social, cambio de contraseña/correo desde la UI, distribución en Google Play/TestFlight.

### Cambiado (referencias cruzadas)
- `PROJECT.md`: nueva sección "BETA READINESS CHECKLIST — REGISTRO COMO INSTRUMENTO OPERATIVO (2026-07-25)" — contexto histórico, por qué no se creó un documento canónico, rondas de revisión, decisión final.

### Verificado
- Revisión cruzada de `MASTERPLAN.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md` y `ETAPA_PRODUCTO_VIVO.md`: sin contradicciones. La checklist no introduce ninguna decisión conceptual nueva ni ocupa ningún número de fase — no requirió cambios en `MASTERPLAN.md`.

## 2026-07-25 — Adopción de `ETAPA_PRODUCTO_VIVO.md` como documento canónico

Tras el cierre de la Fase 7 y dos rondas de análisis estratégico, se adopta una nueva etapa —no una fase técnica más del `MASTERPLAN.md`— dedicada a validar el producto con negocios y personas reales en Cuenca antes de autorizar cualquier fase de crecimiento (Fase 8 en adelante). El documento maduró a través de cuatro rondas explícitas de revisión del Product Owner antes de su adopción. Sin código, sin migraciones, sin cambios funcionales — estrategia de producto pura.

### Agregado
- `ETAPA_PRODUCTO_VIVO.md` (nuevo, documento canónico independiente): guía estratégica de la etapa "El Producto Vivo", subordinada a `VISION_MAESTRA.md` y `PRODUCT_MANIFESTO.md`/`PRODUCT_STRATEGY.md`, par conceptual de `AI_PHILOSOPHY.md`/`ARCHITECTURE.md`.

### Cambiado (referencias cruzadas)
- `MASTERPLAN.md`: párrafo de relación con los demás documentos actualizado; nueva sección "Etapa — El Producto Vivo (entre la Fase 7 y la Fase 8) ✅ ADOPTADA (2026-07-25)"; nueva condición en "Qué nunca debería empezar antes de otra cosa" — ninguna fase a partir de la Fase 8 se autoriza sin cumplir los criterios medibles de `ETAPA_PRODUCTO_VIVO.md` §20.
- `PROJECT.md`: nueva sección "ETAPA \"EL PRODUCTO VIVO\" — ADOPCIÓN DEL DOCUMENTO CANÓNICO (2026-07-25)" — contexto histórico, proceso de maduración en cuatro rondas, motivo de creación, decisión final y verificación de consistencia documental.

### Verificado
- Revisión cruzada de `VISION_MAESTRA.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `MASTERPLAN.md` y `ETAPA_PRODUCTO_VIVO.md`: sin contradicciones. El argumento de "masa crítica inexistente" del nuevo documento opera sobre un eje distinto al de la matriz de dependencias técnicas del `MASTERPLAN.md` — aclarado explícitamente en la nueva sección de ese documento, no una contradicción.

## 2026-07-24 — Fase 7: auditoría transversal final y cierre

Auditoría de los cinco bloques como un único sistema (mismo estándar del cierre de la Fase 6): pipeline completo, consentimiento, privacidad/aislamiento, borrado, exportación, eliminación de cuenta, integración frontend/backend, documentación, migraciones, concurrencia/idempotencia y rendimiento. Sin contradicciones arquitectónicas. Cuatro hallazgos importantes corregidos antes del cierre (ninguno de diseño, todos operativos); dos documentados como deuda; documentación canónica sincronizada; cuatro limitaciones deliberadas confirmadas sin cambio.

### Agregado
- `supabase/migrations/0046_fase7_cierre_correcciones_operativas.sql`: índice único parcial que garantiza una sola solicitud de eliminación de cuenta pendiente por persona (hallazgo H1).
- `ConfirmationModal.jsx`: prop opcional `confirmDisabled` (retrocompatible con sus otros nueve usos) — defensa de doble clic en el frontend, nunca la única garantía.

### Corregido
- **H1** (importante, concurrencia/defecto funcional): un doble clic real podía crear dos solicitudes de eliminación pendientes; la interfaz solo cancelaba la primera, dejando la segunda invisible y destinada a ejecutarse igual. Resuelto con el índice único parcial de `0046` + reconocimiento explícito del código `23505` en `lib/privacy.js` (responde con la solicitud ya existente) + `confirmDisabled` en el frontend.
- **H2** (importante, defecto funcional): `process-account-deletions` no era idempotente si `deleteUser` ya tenía éxito pero el cierre de `data_requests` fallaba — la solicitud quedaba atrapada para siempre. Ahora reconoce con seguridad que la cuenta ya no existe y cierra la trazabilidad sin repetir ningún trabajo destructivo.
- **H3** (importante, concurrencia): carrera entre la cancelación de la persona y el procesamiento por lotes. Ahora un `update ... where status = 'pendiente'` atómico reclama las solicitudes vencidas (pasándolas a `en_proceso`, estado ya existente desde la Fase 1) — frontera exacta después de la cual la cancelación ya no tiene efecto, verificada con concurrencia real de Postgres en ambos sentidos.
- **H4** (importante, defecto funcional): `context.ts` no degradaba como el resto del pipeline — un lugar borrado o un fallo transitorio producía un 500 crudo. Ahora degrada de forma independiente por fuente (lugares/eventos/editorial) y cae al contexto de ciudad o, en último caso, a un contexto vacío válido — nunca una excepción sin manejar.
- `MASTERPLAN.md`: sección "Fase 7" corregida — ya no describe la tabla `ai_sessions` (nunca construida), ahora describe el esquema real; marcada ✅ CERRADA.
- `ROADMAP.md`: Fase 7 agregada a fases completas y marcada cerrada.
- `supabase/README.md`: descripción de `export-user-data`/`process-account-deletions` actualizada al comportamiento real.

### Documentado como deuda (sin corrección en esta ronda)
- H5: `data_requests.type = 'exportacion'` sin ningún consumidor — la trazabilidad real vive en `consent_records`.
- H8: carrera sin bloqueo explícito al crear la primera conversación activa de una persona (clave primaria evita corrupción; un turno concurrente puede no persistirse).

### Verificado
- Postgres 16 real, las 46 migraciones reproducidas desde una base limpia. H1 (violación de unicidad, cancelar y recrear, reversión limpia). H3 (concurrencia real de Postgres en ambos sentidos de la carrera, vía transacciones con `pg_sleep`). H2 (escenario real de cuenta ya eliminada con `data_requests` huérfana + prueba funcional de 5 casos). H4 (prueba funcional de 6 casos). `tsc --strict`, build y lint limpios.

**Fase 7 — Guía IA v2 — declarada oficialmente cerrada.**

## 2026-07-24 — Fase 7, Bloque 5: experiencia unificada de transparencia, corrección y borrado

Quinto y último bloque técnico de la Fase 7. Consolida en `SettingsPage` toda la experiencia de privacidad de la persona: Memoria de Sesión, Conocimiento Permanente y Afinidad (ya existentes, sin cambios de lógica) junto con exportación de datos y solicitud de eliminación de cuenta, expuestas por primera vez desde la interfaz — el mecanismo ya existía desde la Fase 1, Bloque 5, pero nunca había tenido pantalla. **Sin mecanismos nuevos**: reutiliza exactamente `export-user-data`, `data_requests` y `consent_records`. El análisis conceptual incorporó, en tres rondas, los principios de ciclo de vida de la información, separación entre transparencia y funcionamiento, y simplicidad para la persona — ninguno en contradicción con la arquitectura existente.

### Agregado
- `src/lib/privacy.js` (nuevo): `getDataRequests`, `requestAccountExport` (invoca `export-user-data` y, solo tras éxito, registra `consent_records` con `event_type: 'exportacion_solicitada'`), `requestAccountDeletion` (inserta en `data_requests` + `consent_records` con `event_type: 'eliminacion_solicitada'`), `cancelAccountDeletion`.
- `src/features/settings/PrivacyIntro.jsx`, `SessionMemoryStatus.jsx`, `AccountDataSection.jsx`, `PrivacySection.jsx` (nuevos): la única experiencia de privacidad. `SessionMemoryStatus` es puramente informativo (activa/duración/enlace a la conversación) — la acción de borrar la Memoria de Sesión permanece, sin mover, en `GuideChat.jsx`. `AccountDataSection` reutiliza `ConfirmationModal` (ya existente) para la irreversibilidad de la eliminación de cuenta.
- `supabase/migrations/0045_fase7_bloque5_privacidad_unificada.sql`: único cambio de esquema del bloque — un disparador `before insert` en `data_requests` que calcula `scheduled_for = requested_at + 30 días` para `type = 'eliminacion'` cuando no se manda explícitamente, del lado del servidor (nunca del reloj del cliente), decisión explícita del Product Owner.

### Cambiado
- `supabase/functions/ai-guide/memory.ts`: `fetchExistingConversation()` ahora también devuelve `startedAt`/`lastActivityAt` — ya se leían internamente para otro propósito, nunca se habían expuesto en esta lectura de hidratación.
- `supabase/functions/ai-guide/index.ts`: la acción `get_conversation` incluye esos dos campos en su respuesta — mismo contrato, sin ninguna acción nueva.
- `src/pages/SettingsPage.jsx`: `AffinitySection`/`PermanentKnowledgeSection`, antes montadas sueltas, ahora se consolidan dentro de `<PrivacySection />` — sin pantalla ni ruta nueva.

### Verificado
- Postgres 16 real, las 45 migraciones en orden: el disparador calcula correctamente los 30 días cuando no se manda `scheduled_for`; no sobreescribe un valor explícito; `exportacion` nunca recibe `scheduled_for`; verificado también bajo un rol de bajo privilegio real (`authenticated`, `auth.uid()` simulado), no solo como superusuario. Reversión de la migración confirmada limpia.
- `tsc --strict` sobre `memory.ts`/`index.ts`: cero errores nuevos, solo los diagnósticos de referencia preexistentes. Build y lint del frontend limpios.

## 2026-07-23 — Fase 7, Bloque 4: auditoría final y sincronización documental

Auditoría final del Bloque 4 (18 puntos exigidos, exclusivamente sobre la implementación ya terminada), mismo rigor que las auditorías finales de la Fase 6 y del Bloque 3. Tres hallazgos, ninguno crítico: dos observacionales, documentados sin corrección; uno importante, corregido en esta entrada.

### Corregido (exclusivamente documental — sin cambios de código, migraciones, Edge Functions ni frontend)
- **La jerarquía de ocho niveles ya implementada en el prompt de `decision.ts` (Bloque 4) no estaba reflejada en `AI_PHILOSOPHY.md §9`**, que seguía mostrando la jerarquía original de cinco niveles, y `FASE7_CONTRATO_ARQUITECTONICO.md` prometía explícitamente que esa jerarquía "sigue vigente sin cambios". `AI_PHILOSOPHY.md §9` actualizado a los ocho niveles (restricciones duras → seguridad → pedido explícito → Conocimiento Permanente → afinidad real → confianza/verificación → editorial → patrocinado nunca por encima), con la referencia cruzada de la sección de verificación corregida de "(Cuarto, arriba)" a "(Sexto, arriba)". `FASE7_CONTRATO_ARQUITECTONICO.md` registra ahora una enmienda explícita documentando el refinamiento como excepción aprobada. `FASE7_FILOSOFIA_GUIA_IA.md §8` corregido de "tercer nivel" a "quinto nivel" (posición real de Afinidad tras el refinamiento). Verificado por búsqueda exhaustiva que ninguna otra referencia a la jerarquía de cinco niveles permanece en ningún documento vigente del proyecto.

### Documentado como observación (sin corrección, por decisión explícita)
- Ausencia de validadores de runtime explícitos para los campos tipo-enum de `AffinityInsight` — bajo riesgo real porque `affinity_profile()` los produce mediante `CASE` fijos en Postgres, nunca texto libre.
- Una de las cuatro prohibiciones de lenguaje del prompt (evidencia histórica nunca como vigente) vive en el bloque de datos entregado al modelo en vez del bloque de reglas — sin efecto funcional.

## 2026-07-23 — Fase 7, Bloque 4: conexión de El Razonador con el Motor de Afinidad

Cuarto bloque técnico de la Fase 7. El Razonador consulta, bajo demanda y nunca como prerrequisito de su pipeline, la dimensión `categoria` del perfil de Afinidad ya calculado por el Motor de Afinidad (Fase 6) — nunca la reconstruye, nunca escribe en ella. La Afinidad describe preferencia relativa, nunca identidad, nunca decide sola: solo desempata entre alternativas que el resto de la jerarquía ya dejó elegibles. Diez precisiones del Product Owner cerraron el análisis conceptual en cuatro rondas; ninguna en contradicción con la arquitectura existente. **Primer bloque de la Fase 7 sin ninguna migración nueva.**

### Agregado
- `supabase/functions/ai-guide/affinity.ts` (nuevo): resuelve el actor propio desde `auth.uid()`, consulta `affinity_profile()` con el propio token de quien llama, filtra a la dimensión `categoria` y solo a las categorías ya presentes en el contexto real del turno (minimización dentro del propio pipeline) — nunca expone el peso numérico crudo. Degrada honestamente a vacío ante cualquier fallo.

### Cambiado
- `supabase/functions/ai-guide/index.ts`: compuerta de consulta bajo demanda (`ownerId && context.type === 'city'`), sin ninguna llamada adicional al proveedor de IA.
- `supabase/functions/ai-guide/decision.ts`: jerarquía de prioridad extendida de cinco a ocho niveles (restricciones duras → seguridad → pedido explícito → Conocimiento Permanente pertinente → Afinidad real → confianza/verificación → editorial → patrocinado nunca por encima); nueva `describeAffinityInsights()` traduce cada entrada a lenguaje de certeza relativa. Sin ningún campo nuevo en `Decision`/`ReasonerOutput` — la influencia de Afinidad cabe en `reason`/`priorityTrace`, ya existentes desde el Bloque 1.
- `supabase/functions/export-user-data/index.ts`: agrega el perfil agregado de Afinidad (`affinity_profile()`, nunca `affinity_contributions` cruda), llamado con el token de quien pide la exportación.
- `supabase/functions/ai-guide/expression.ts`: sin cambios — confirma la conclusión ya adelantada en el análisis conceptual.

### Hallazgo técnico (encontrado durante la auditoría previa al diseño, no una contradicción)
- `places` no tiene ningún vínculo estructural con `actors` (a diferencia de `events`/`editorial`, que sí podrían resolverlo). Conectar la dimensión `actor_seguido` en esta iteración habría producido cobertura asimétrica. El Product Owner confirmó limitar esta iteración a la dimensión `categoria`, difiriendo `actor_seguido`.
- El perfil de Afinidad nunca se había incluido en `export-user-data` desde la Fase 6 — vacío preexistente, corregido en este bloque por decisión explícita.

### Verificado
- Postgres 16 real (sin migración nueva que verificar): simulación de extremo a extremo con contribuciones reales (categoría con evidencia reciente → `activa`; categoría antigua + corrección `atenuar` real → `historica`, confirmando que "histórico" exige una compensación negativa real, nunca solo el paso del tiempo); filtro de categorías pertinentes correcto contra datos reales; aislamiento estricto entre personas y frente a invitado (mecanismo ya construido en la Fase 6, sin cambios).
- `tsc --strict`: cero errores nuevos. Regresión de los tres validadores (9/9, sin cambios de comportamiento). `describeAffinityInsights()` verificado de forma aislada (3/3 casos). Build y lint limpios, sin cambios de frontend.

## 2026-07-23 — Fase 7, Bloque 3: auditoría final y correcciones

Auditoría final del Bloque 3 (exclusivamente sobre la implementación ya terminada, sin funcionalidades ni ideas nuevas), mismo rigor que el cierre de la Fase 6. Sin hallazgos en RLS, aislamiento, `consent_records`, consentimiento explícito, degradación segura ni exportación. Cuatro hallazgos: dos corregidos, dos documentados como limitación conocida por decisión del Product Owner.

### Corregido
- **El Razonador podía re-proponer un candidato ya presentado o ya rechazado en la misma conversación.** El prompt lo prohibía, pero nada persistía esa señal (`permanentKnowledgeCandidate` nunca formaba parte de los turnos de la Memoria de Sesión). Solución mínima sin memoria paralela ni estados nuevos: la mención del candidato ahora se integra en la propia respuesta hablada (ver corrección siguiente), que ya se persiste como turno normal — la próxima llamada al Razonador ve directamente su mención anterior en el hilo.
- **El campo `reason` del candidato llegaba a la persona sin pasar por La Expresión**, rompiendo para esa superficie el principio de que "El Razonador nunca habla directamente con la persona". `supabase/functions/ai-guide/expression.ts`: `express()` recibe ahora también el candidato (nunca los hechos guardados, nunca el contexto crudo) y decide, con sus propias palabras, cómo comunicarlo — siempre como invitación a confirmar, nunca como algo ya guardado. `GuideChat.jsx` ya no muestra el `reason` crudo en el banner.

### Documentado como limitación conocida (sin corregir, por decisión explícita)
- La etiqueta de auditoría `revocado` no tiene hoy ningún camino real en la interfaz que la produzca (el único botón de borrado usa siempre `asRevocation: false`) — mecanismo ya construido, a la espera de una futura superficie que distinga explícitamente "revocar" de "borrar".
- El nombre de una categoría puede aparecer en los logs de la Edge Function ante una entrada inválida — mismo patrón de logging usado en todo `ai-guide` desde bloques anteriores, no una desviación de este bloque; queda para una futura revisión transversal de observabilidad.

### Verificado
- `tsc --strict` sin errores nuevos. Regresión de `validateDecision()`/`validateMemoryInstruction()`/`validatePermanentKnowledgeCandidate()` sin cambios. Build y lint del frontend limpios.

## 2026-07-23 — Fase 7, Bloque 3: Conocimiento Permanente de la Persona, no-afinidad

Tercer bloque técnico de la Fase 7. Guarda datos estables y explícitamente confirmados sobre una persona (idioma, estilo de respuesta, restricción alimentaria, movilidad, accesibilidad, dato financiero declarado), distintos de la Memoria de Sesión, el historial autorizado, la Afinidad y los datos de cuenta. El Razonador solo **propone un candidato** — nunca crea un "hecho": la interfaz confirma, y únicamente la acción explícita de la persona produce la escritura. Cinco bifurcaciones conceptuales y cuatro precisiones técnicas resueltas por el Product Owner antes de autorizar la implementación.

### Agregado
- `supabase/migrations/0044_fase7_bloque3_conocimiento_permanente.sql` (nuevo): `permanent_knowledge_categories` (catálogo cerrado y semánticamente estable para siempre, seis categorías iniciales, `treatment_policy` reservado sin uso funcional), `permanent_knowledge_facts` (sin ninguna política de RLS) y `permanent_knowledge_audit_log` (tabla de trazabilidad dedicada, resolución de un hallazgo arquitectónico — ver más abajo — sin ninguna política de RLS, nunca el valor). Cinco funciones `security definer` (`pk_get_facts`, `pk_save_fact`, `pk_delete_fact`, `pk_delete_all_facts`, `pk_get_audit_summary`), identidad siempre desde `auth.uid()`.
- `supabase/functions/ai-guide/permanentKnowledge.ts` (nuevo): lectura para El Razonador con degradación honesta a vacío; escrituras exclusivas de acciones explícitas de interfaz.
- `src/features/settings/PermanentKnowledgeSection.jsx` (nuevo): transparencia y corrección de los hechos vigentes + historial de auditoría (solo operación/categoría/fecha, nunca el valor), mismo estilo que `AffinitySection.jsx`.

### Cambiado
- `supabase/functions/ai-guide/decision.ts`: `PermanentKnowledgeCandidate` como tercera salida del envoltorio del Razonador, con la misma disciplina de validación que `Decision`/`MemoryInstruction`; ocho condiciones conservadoras para categorías normales y regla más estricta (debe originarse en palabras ya expresadas por la persona) para categorías reforzadas.
- `supabase/functions/ai-guide/index.ts`: nuevas acciones explícitas (`save_permanent_fact`, `delete_permanent_fact`, `delete_all_permanent_facts`, `get_permanent_knowledge`), ninguna alcanzable desde el flujo conversacional normal.
- `supabase/functions/export-user-data/index.ts`: hechos vigentes y resumen de auditoría nacen exportables.
- `src/lib/aiGuide.js` / `src/features/ai/GuideChat.jsx`: banner de candidato con confirmación reforzada para categorías sensibles; `src/pages/SettingsPage.jsx` integra la nueva sección de transparencia.

### Hallazgo arquitectónico (encontrado y resuelto durante la auditoría previa)
- El diseño aprobado planteaba reutilizar `consent_records` para la trazabilidad de este bloque; la auditoría encontró que esa tabla tiene, desde la Fase 1, RLS con lectura administrativa directa — en contradicción con el principio recién aprobado de ausencia total de acceso administrativo, ya que incluso el nombre de una categoría revela información sensible por sí solo. El Product Owner confirmó construir una tabla de trazabilidad dedicada y sin RLS (Opción B, doce garantías explícitas). `consent_records` permanece completamente intocada.

### Verificado
- Postgres 16 real: guardado/corrección en el mismo lugar, las tres vías de rechazo (categoría/subtipo/confirmación reforzada), borrado físico individual y total, aislamiento estricto (dos personas, anónimo, administrador) confirmado también con consultas directas a la tabla cruda, rechazo de inserción directa, cascada de eliminación de cuenta, migración reversible confirmando que `consent_records` queda intocada.
- Verificación de tipos equivalente a `deno check` vía `tsc --strict` (shim corregido tras confirmar el comportamiento real de `.rpc()` instalando el paquete real): cero errores nuevos.
- Validación de `validatePermanentKnowledgeCandidate()` (9 casos) y regresión de `validateDecision()`/`validateMemoryInstruction()` sin cambios de comportamiento. Build y lint del frontend limpios.

## 2026-07-23 — Fase 7, Bloque 2: Memoria de Sesión

Segundo bloque técnico de la Fase 7. Da continuidad a la única conversación activa de cada persona autenticada, sin importar la superficie desde la que la continúe (contexto/`placeId` siguen siendo entradas del turno, nunca identidad de la conversación). Invitados sin cambios de fondo: sin persistencia server-side. Ocho bifurcaciones conceptuales y cuatro ajustes técnicos resueltos por el Product Owner antes de autorizar la implementación.

### Agregado
- `supabase/migrations/0043_fase7_bloque2_memoria_sesion.sql` (nuevo): `ai_active_conversations` (fila única por persona) y `ai_conversation_turns` (append-only, retracciones marcadas nunca borradas), sin ninguna política de RLS — acceso exclusivo mediante seis funciones `security definer` que derivan la identidad siempre de `auth.uid()`. Expiración on-read (2 horas, configurable, calibración inicial), reinicio honesto sin recuperar conversaciones cerradas, escritura atómica del intercambio persona+guía+retractación.
- `supabase/functions/ai-guide/memory.ts` (nuevo): la Memoria de Sesión — identidad desde el propio token de quien llama, "contexto conversacional vigente" como único contrato hacia El Razonador, degradación honesta ante cualquier fallo de lectura/escritura.
- `src/features/ai/GuideChat.jsx`: hidratación de la conversación activa al abrir el chat, señal no técnica de conversación nueva/expirada, consentimiento explícito para asociar una conversación de invitado a una cuenta nueva, borrado explícito desde la interfaz.

### Cambiado
- `supabase/functions/ai-guide/decision.ts`: `decide()` consume el `ConversationalContext` genérico en vez de "mensajes" (agnosticismo reforzado — la representación interna es exclusiva de la Memoria de Sesión); nuevo `MemoryInstruction` (retractación explícita) como salida secundaria, validado con la misma disciplina que `Decision`, sin alterar su contrato.
- `supabase/functions/ai-guide/index.ts`: orquesta identidad → Memoria de Sesión → contexto → Razonador → Expresión → persistencia; nuevas acciones administrativas (`delete_conversation`, `import_guest_conversation`, `get_conversation`).
- `supabase/functions/export-user-data/index.ts`: la conversación activa nace exportable.
- `src/lib/aiGuide.js`: contrato de petición actualizado (`text` + turno nuevo para autenticados, `guestHistory` solo para invitados).

### Verificado
- Postgres 16 real: aislamiento estricto entre personas y frente a un administrador, expiración simulada con purga on-read, retracción (ambos alcances) preservando trazabilidad y excluida de lectura, escritura atómica (contenido vacío rechazado sin turno a medias), importación de conversación de invitado en orden, borrado explícito, cascada de eliminación de cuenta, migración reversible y reaplicable.
- Degradación de memoria (lectura y escritura) probada de forma aislada: nunca bloquea el turno ni finge continuidad.
- Regresión de `validateDecision()` (15/15) + validación del nuevo envoltorio `{decision, memoryInstruction}` (6 casos nuevos).
- Verificación de tipos equivalente a `deno check` vía `tsc --strict`: cero errores nuevos. Build y lint limpios.
- **Limitación documentada**: sin marcas de tiempo reales por turno en el camino de invitado (no registradas nunca por `GuideChat.jsx`); sin comportamiento en vivo del modelo medible en este entorno (mismas limitaciones de `deno`/`ANTHROPIC_API_KEY` ya documentadas en el Bloque 1).

## 2026-07-23 — Fase 7, Bloque 1: separación Razonador/Expresión

Primer bloque técnico de la Fase 7, siguiendo la metodología específica de esta fase (análisis conceptual → escenarios de conversación → diseño técnico → implementación → verificación → documentación). Reestructura la Edge Function `ai-guide` de un único prompt monolítico a un pipeline de dos pasos con frontera de datos explícita: Contexto → El Razonador → Decisión estructurada e inmutable → La Expresión → Respuesta final. Además corrige un defecto real preexistente, descubierto durante la auditoría previa a este bloque, no una funcionalidad nueva.

### Agregado
- `supabase/functions/ai-guide/context.ts` (nuevo): construye el contexto permitido (lugar o ciudad); no interpreta ni decide.
- `supabase/functions/ai-guide/decision.ts` (nuevo): El Razonador — produce y valida (`validateDecision()`) una `Decision` estructurada (`dominantMode`, `supportingModes`, `content`, `narrative`, `reason`, `resolutionRoute`, `priorityTrace`, `actions`, `noAnswer`), sin intentar nunca reparar un campo ausente.
- `supabase/functions/ai-guide/expression.ts` (nuevo): La Expresión — traduce una `Decision` ya tomada en lenguaje natural; solo importa el tipo `Decision`, sin ninguna vía de código hacia el contexto crudo.

### Corregido
- **`buildCityContext()` consultaba `editorial_posts`**, tabla eliminada desde la migración `0010_events.sql`, muy anterior a la Fase 6 — cualquier pregunta a la Guía IA sin `placeId` (el camino de Inicio y Explorar, la mayoría del uso real) fallaba con un error de Postgres. Reemplazada por la RPC oficial `candidatos_editorial()` (Fase 6), la misma ya usada por `src/lib/editorial.js` — sin inventar una interpretación nueva de elegibilidad editorial.

### Cambiado
- `supabase/functions/ai-guide/index.ts`: reescrita para orquestar el pipeline de dos pasos, con decisión y respuesta de seguridad fijas si El Razonador o La Expresión fallan. Respuesta `{reply, actions}` — aditiva, `src/lib/aiGuide.js`/`GuideChat.jsx`/`GuideCapsule.jsx` sin cambios.

### Verificado
- Postgres 16 real: ocho escenarios editoriales exigidos (cero contenido, selección vigente, vencida, oculta, evento finalizado, autor con verificación revocada, contenido de Ahorita Editorial con y sin selección) — todos correctos.
- `validateDecision()`: 15 casos sintéticos (3 válidos, 12 inválidos), transpilados con esbuild y ejecutados en Node ante la ausencia de `deno` en este entorno — los 15 se comportaron como se esperaba.
- Separación estructural Razonador/Expresión confirmada por inspección del grafo de importaciones.
- Verificación de tipos equivalente a `deno check` vía `tsc --strict` contra un shim fiel a `@supabase/supabase-js`/`@anthropic-ai/sdk`: cero errores nuevos.
- Build y lint limpios (sin cobertura de `supabase/functions/`, limitación ya conocida).
- **Limitación documentada honestamente**: sin `ANTHROPIC_API_KEY` configurada para la Edge Function ni `deno` instalado en este entorno, no fue posible medir la latencia/costo real de las dos llamadas encadenadas al proveedor de IA — pendiente contra un proyecto Supabase real desplegado.

## 2026-07-23 — Fase 7: contrato arquitectónico conceptual adoptado

Con la filosofía de la Guía IA ya adoptada, se construyó `FASE7_CONTRATO_ARQUITECTONICO.md` — arquitectura conceptual sin sesiones, tablas, funciones, RPC, prompts ni proveedor de tecnología de inteligencia artificial, siguiendo el mismo espíritu que `FASE6_CONTRATO_ARQUITECTONICO.md` tuvo para la Fase 6. Encargo explícito: una arquitectura que sobreviva al proveedor tecnológico. Dos rondas de revisión, la segunda resolviendo cuatro precisiones antes de la aprobación final. Ningún código, migración ni diseño técnico — trabajo exclusivamente de arquitectura conceptual.

### Agregado

- `FASE7_CONTRATO_ARQUITECTONICO.md` (nuevo): cuatro componentes conceptuales — Memoria de Sesión (pasiva), Conocimiento Permanente no-afinidad (consentimiento explícito como condición necesaria, nunca suficiente), El Razonador (consulta la Afinidad, nunca la reconstruye) y La Expresión (nunca decide contenido, solo estilo) —, ambos, Razonador y Expresión, deliberadamente agnósticos de tecnología: separan su lógica y garantías permanentes de la tecnología reemplazable que las ejecuta. Cadena de responsabilidad de un solo sentido, fronteras explícitas entre memoria/afinidad/razonamiento, explicabilidad extendida a "por qué recuerdo esto de ti", y un mapeo tentativo de cinco bloques reordenado para que la separación Razonador/Expresión exista desde el origen y para que memoria y conocimiento permanente nazcan con sus propias garantías de corrección y borrado, nunca como una capa tardía.

### Cambiado

- `MASTERPLAN.md`, sección Fase 7: agregada la referencia a `FASE7_CONTRATO_ARQUITECTONICO.md` como contrato arquitectónico de la fase; "Módulos que incluye" actualizado para nombrar los cuatro componentes conceptuales.
- `PROJECT.md`: nueva sección "FASE 7 — CONTRATO ARQUITECTÓNICO ADOPTADO (2026-07-23)" con el proceso de dos rondas, las cuatro precisiones incorporadas y la verificación de consistencia realizada.

## 2026-07-23 — Fase 7: filosofía de la Guía IA adoptada

Con la Fase 6 cerrada, análisis previo de la siguiente fase natural del proyecto (sin código ni diseño de solución) seguido de la construcción de `FASE7_FILOSOFIA_GUIA_IA.md` — autoridad filosófica permanente de la Guía IA para la Fase 7, subordinada a `VISION_MAESTRA.md` y construida consolidando `AI_PHILOSOPHY.md`, no reemplazándolo. Tres rondas de refinamiento crítico, cada punto propuesto evaluado por separado antes de aceptarlo. Ningún código, migración ni diseño técnico — trabajo exclusivamente filosófico.

### Agregado

- `FASE7_FILOSOFIA_GUIA_IA.md` (nuevo): veintitrés principios permanentes que gobernarán el futuro contrato arquitectónico de la Fase 7. Distingue tres categorías que nunca deben confundirse (contexto temporal de una conversación, conocimiento permanente no-afinidad, afinidad del Motor de Afinidad); establece un principio de memoria veraz (nunca inventar un recuerdo); extiende la prohibición de NLP/embeddings del Motor de Afinidad a la conversación con la Guía IA; establece que ningún conocimiento pasa de temporal a permanente sin consentimiento explícito de la persona; que la conversación pertenece siempre a la persona, nunca al sistema; que la Guía IA nunca define la identidad de alguien (extensión directa de un principio ya vigente del Motor de Afinidad); y cierra con el principio de que la persona siempre es más grande que el perfil que el sistema tiene de ella, y que la memoria se mide por selectividad, nunca por volumen acumulado.

### Cambiado

- `MASTERPLAN.md`, sección Fase 7: agregada la referencia a `FASE7_FILOSOFIA_GUIA_IA.md` como autoridad filosófica de la fase; precisada la conexión de "el motor de recomendaciones de la Fase 6" a "el Motor de Afinidad de la Fase 6".
- `PROJECT.md`: nueva sección "FASE 7 — FILOSOFÍA DE LA GUÍA IA ADOPTADA (2026-07-23)" con el proceso completo de las tres rondas, los principios incorporados, y las tensiones heredadas sin resolver a propósito.

## 2026-07-23 — Auditoría final de liberación de la Fase 6: cinco hallazgos resueltos

Segunda auditoría de cierre, deliberadamente más crítica que la primera (actuando como auditor externo, sin asumir que algo estaba correcto solo por haberse implementado antes). Encontró cinco hallazgos reales — uno crítico, cuatro importantes — todos resueltos en la misma ronda, sin abrir ningún frente de trabajo nuevo ni tocar la arquitectura de seis componentes ya aprobada.

### Corregido

- **(Crítico)** `reason_code` de Editorial llegaba crudo (p. ej. `seleccionado_equipo`) hasta la pantalla del usuario, sin ninguna traducción — `src/lib/feed.js`: nueva `EDITORIAL_REASON_LABELS`/`resolveComposedReason()`, la capa de presentación que el propio diseño del Bloque 3 ya anticipaba pero nunca se había construido. Sin cambios en la base de datos.
- **(Importante)** Contradicción interna en `FASE6_CONTRATO_ARQUITECTONICO.md` entre "aumentar el peso de cercanía" y el principio de que la cercanía nunca es señal de puntuación — sección "Cómo evolucionará el sistema..." reescrita para describir la degradación honesta y emergente que el sistema realmente implementa. Corrección puramente documental.
- **(Importante)** Riesgo de división por cero en `compose_feed()` si una futura recalibración dejara algún peso en 0 — `supabase/migrations/0042_fase6_cierre_correccion_division_cero.sql`, guarda `greatest(peso, 0.0001)` sobre el divisor. Mismo resultado bit a bit para cualquier calibración ya vigente.
- **(Importante)** Lista de "Commits principales de la fase" en `PROJECT.md` con formato inconsistente (hashes reales solo para el Bloque 4) — corregida con los hashes reales de los quince commits de la fase.
- **(Importante)** Afirmación cuantitativa no verificada ("quince principios permanentes incorporados") en el resumen ejecutivo de `PROJECT.md` — retirada la cifra específica.

### Verificado

- Postgres 16 real (42 migraciones desde cero): `compose_feed()` produce exactamente la misma composición/orden/deduplicación que antes de la migración `0042`; un ítem editorial de prueba muestra ahora una frase legible en vez del código crudo; regresión completa de los cuatro bloques.
- Build y lint limpios. Relectura completa de `MASTERPLAN.md`, `ARCHITECTURE.md`, `ROADMAP.md` y `FASE6_CONTRATO_ARQUITECTONICO.md` para confirmar que ninguna referencia cruzada quedó rota.

## 2026-07-23 — FASE 6 CERRADA: Descubrimiento inteligente v2

Cierre formal de la Fase 6 completa, tras una auditoría explícita de siete puntos (código y migraciones, coherencia documental, código, pureza arquitectónica, principios permanentes, rendimiento, deuda técnica consolidada) presentada antes de escribir cualquier corrección — misma metodología ya usada para el cierre de la Fase 4 y la Fase 5B. Ningún código nuevo; solo auditoría y documentación.

### Auditoría (hallazgo presentado y resuelto con autorización explícita)

- `MASTERPLAN.md` (sección Fase 6) y `ARCHITECTURE.md` (§21) todavía describían el plan original de "feed híbrido de puntuación" (tablas `affinity_scores`/`feed_config`) que quedó completamente reemplazado, antes de implementarse, por `FASE6_FILOSOFIA_DESCUBRIMIENTO.md`/`FASE6_CONTRATO_ARQUITECTONICO.md`. Ninguna otra inconsistencia documental, de código, de arquitectura o de principios permanentes sobrevivió la auditoría.

### Corregido

- `MASTERPLAN.md`: sección "Fase 6" reescrita para describir la arquitectura real de seis componentes (Motor de Afinidad, Motor de Garantías, Motor Editorial, Compositor del Feed), con nota explícita de corrección.
- `ARCHITECTURE.md`: §21 "Algoritmo del feed" reescrita, retirando la recomendación de fórmula híbrida ya superada, con nota explícita de corrección.

### Agregado

- `PROJECT.md`: nueva sección "FASE 6 CERRADA — Descubrimiento inteligente v2 (2026-07-23)" — resumen ejecutivo de los cuatro bloques, objetivo original vs. resultado final, arquitectura lograda, decisiones de producto, ocho problemas encontrados y corregidos (consolidado), verificaciones realizadas, deuda técnica consolidada en tres categorías (heredada/propia/futura), qué habilita para la Fase 7, y commits principales.
- `ROADMAP.md`: Fase 6 agregada a "Fases completas" (ítem 13) y marcada ✅ en el resumen de fases futuras; nuevo bullet de deuda técnica de Fase 6.

## 2026-07-22 — Fase 6, Bloque 4: Compositor del Feed

Último componente de la Fase 6. Fusiona las seis entradas (Afinidad, Novedad, Diversidad, Equidad, Serendipia, Editorial) en una composición determinista, deduplicada, con anti-monopolio y paginación por clave de identidad. Componente puro: no aprende, no escribe, no modifica afinidades ni decisiones editoriales.

### Agregado

- `supabase/migrations/0041_fase6_bloque4_compositor_feed.sql`: `discovery_calibration()` extendida con las proporciones y constantes del Compositor; `candidatos_editorial()` extendida con `zone_id`; `candidatos_afinidad()` (nueva, la pieza que le faltaba a Afinidad); tipo `compose_feed_item` y función `compose_feed()` (entrelazado por colas justas ponderadas, anti-monopolio en una pasada, paginación por cursor).
- `src/lib/feed.js`: `getComposedFeed()` — reutiliza sin cambios las funciones de obtención y mapeo existentes.

### Cambiado

- `src/pages/FeedPage.jsx`: usa `getComposedFeed` en vez de `getFeed`; agrega paginación ("Cargar más") y la razón de composición como subtítulo. `getFeed()` se conserva intacta como camino de reversión.

### Corregido durante la verificación

- Propiedad de ítems compartidos entre carriles: una prioridad fija dejaba a Diversidad/Serendipia en cero pese a tener candidatos reales cuando su universo coincidía con el de Novedad — reemplazada por escasez primero (menos candidatos totales gana) y desempate por rotación determinística.
- Segunda pasada de anti-monopolio: colocaba diferidos en orden fijo, repitiendo violaciones entre sí — reemplazada por una búsqueda del primer diferido no violatorio en cada paso.
- Rendimiento: comprobaciones de ventana con `unnest()+count()` correlacionado (663 ms/página) reemplazadas por `array_positions()+cardinality()` nativo (115 ms/página, ~5.8×), verificado con `EXPLAIN ANALYZE` contra 210 eventos/69 negocios.

### Verificado

- Postgres 16 real, RLS con roles de bajo privilegio (`authenticated` no-admin y `anon`), deduplicación, anti-monopolio, paginación, filtro de canal, y reversión ejecutada de verdad (con el hallazgo de que `discovery_calibration()`/`candidatos_editorial()` deben restaurarse a su forma previa, no solo eliminarse, por ser extensiones en el mismo lugar). Regresión completa de Bloques 1-3.
- Build y lint limpios. Playwright no ejecutado por la misma limitación de entorno ya declarada en el Bloque 3 (sin instancia local de Supabase).

## 2026-07-22 — Fase 6, Bloque 3: Motor Editorial

Tercer bloque de la Fase 6 (ver `FASE6_CONTRATO_ARQUITECTONICO.md`). Decide qué contenido curado por el equipo está seleccionado y produce el universo completo de candidatos editoriales elegibles — nunca decide cantidad, posición ni interleaving (responsabilidad del futuro Compositor). Nuevo principio permanente incorporado al contrato: "Editorial nunca existe para corregir al algoritmo; existe para aportar criterio humano allí donde el algoritmo, por naturaleza, nunca puede sustituirlo."

### Agregado

- `supabase/migrations/0040_fase6_bloque3_motor_editorial.sql`: tabla `editorial_selections` (fila única mutable por `(target_type, target_id)`, sin ninguna política de escritura directa); `set_editorial_selection()`/`revoke_editorial_selection()` (único camino de escritura, `security definer`, solo `is_admin()`); `validate_editorial_selection_target()` (trigger que rechaza contenido inexistente o una Promoción disfrazada de Publicación); `candidatos_editorial()` (todos los candidatos elegibles, sin límite, `reason_code` crudo); `editorial_selection_public()` (lectura pública segura, nunca expone `decided_by`/`revoked_by`); backfill de `events.editor_pick` con administrador determinístico (falla explícitamente si no existe ninguno).
- `src/lib/editorial.js` (nuevo): capa de datos del Motor Editorial.

### Cambiado

- `src/lib/feed.js`: `pickEditorSelection()` lee el conjunto de eventos seleccionados desde el nuevo mecanismo en vez de `event.editor_pick` — mismo comportamiento visible en el Feed.
- `src/pages/admin/AdminEventEditorPage.jsx`: la casilla "Incluir en Selección del editor" ya escribe/lee contra `editorial_selections`, no contra la columna legacy.
- `events.editor_pick` queda legacy (sin eliminarse) — sin nuevas escrituras desde la aplicación.

### Verificado

- Postgres 16 real (40 migraciones desde cero): backfill exacto sin duplicados; los 7 candidatos esperados frente a autor revocado/contenido oculto/evento finalizado/Promoción, todos correctamente ausentes; rechazo de Promoción, contenido inexistente, ventana inválida y autoselección de negocio; reactivación completa con `created_at` preservado; `geo_status` correcto; cero candidatos sin relleno; selección vencida ausente; RLS con roles de bajo privilegio (lectura cruda admin-only, escritura directa imposible incluso con `GRANT`); defensa en profundidad del `check` de pareo; lectura pública sin exponer identidad administrativa; reversión completa ejecutada de verdad; regresión de Bloques 1 y 2.
- Build y lint limpios.
- **Verificación visual (Playwright) no ejecutada**: este entorno no tenía una instancia local de Supabase disponible para probar el flujo completo en navegador — declarado honestamente en `PROJECT.md`, no se reclama una verificación que no ocurrió.

## 2026-07-22 — Fase 6, Bloque 2 (adenda): calibración geográfica

Revisión de las dos constantes geográficas señaladas en el informe final del bloque, antes de su cierre definitivo.

### Agregado

- `supabase/migrations/0039_fase6_bloque2_calibracion_geografica.sql`: `discovery_calibration()` (única fuente de verdad para todas las constantes del bloque, no solo las geográficas); `geo_eligible()` ahora devuelve un estado (`zona_manual`/`confirmada_cercana`/`planificacion_futura`/`sin_restriccion`/`NULL`) en vez de un booleano; nueva columna `geo_status` en las cuatro funciones `candidatos_*`.

### Corregido

- Radio único de 5 km reemplazado por dos radios según temporalidad: 3 km (inmediato, Promociones/Publicaciones siempre, Eventos cercanos en el tiempo) y 15 km (planificación, exclusivamente Eventos futuros más allá de 3 días).
- Exención total de radio para planificación futura reemplazada por el radio ampliado (15 km) — nunca elimina la restricción por completo.
- Constantes ya no repetidas como literales en cada función — centralizadas en `discovery_calibration()`.

### Verificado

Postgres 16 real (39 migraciones desde cero): las diez combinaciones geográficas pedidas (promoción/evento dentro y fuera de cada radio, zona manual, sin coordenadas, sin ubicación, sin IP), verificación end-to-end con coordenadas reales a través de `candidatos_novedad()`, regresión completa del Bloque 1 y de los cuatro carriles sin cambios de comportamiento. Build y lint limpios.

## 2026-07-22 — Fase 6, Bloque 2: Motor de Garantías

Segundo bloque de la Fase 6, tras análisis conceptual (20 puntos), tres precisiones conceptuales y diseño técnico con adenda (rotación determinística de serendipia, responsabilidad exacta de diversidad, propietario de la restricción geográfica) explícitamente aprobados. Produce, por carril (novedad, diversidad, equidad, serendipia), un conjunto de candidatos elegibles con su razón de explicabilidad — nunca decide el Feed final. Principio permanente incorporado a `FASE6_CONTRATO_ARQUITECTONICO.md`: la elegibilidad siempre ocurre antes que las garantías.

### Agregado

- `supabase/migrations/0038_fase6_bloque2_motor_garantias.sql`: `discoverable_content()` (universo elegible — Eventos/Publicaciones/Promociones vigentes y verificados, excluye por completo al actor de sistema "Ahorita Editorial"); `geo_eligible()` (restricción geográfica dura compartida, fórmula haversine, zona manual > geolocalización > degradación honesta, exención de planificación futura); `candidatos_novedad()`, `candidatos_equidad()`, `candidatos_diversidad()` (tope de 3 por actor), `candidatos_serendipia()` (rotación determinística por `hashtext(actor + día calendario)`, nunca `random()`, excluye categorías con afinidad alta y activa).

### Verificado

Postgres 16 real (38 migraciones desde cero): elegibilidad de base (verificación, vigencia), novedad (ventana de 7 días), equidad (baja frecuencia de 30 días, sin relajar filtros base), diversidad (tope por actor), serendipia (exclusión por afinidad, estabilidad dentro del mismo día, renovación al día siguiente, rotación distinta entre actores, todo sin ninguna tabla de historial), geografía (autorizada, sin permiso, zona manual, sin coordenada, planificación futura), carril vacío sin relleno artificial, candidato en dos carriles sin deduplicación prematura, regresión completa del Bloque 1 sin cambios. Build y lint limpios (sin cambios de frontend — no existe todavía consumidor de estos candidatos).

## 2026-07-22 — Fase 6, Bloque 1 (segunda adenda): estado de evidencia

Precisión final antes de la aprobación conceptual del Bloque 1. Sin rediseño — un campo nuevo en la lectura y una reauditoría sin cambios de código.

### Agregado

- `supabase/migrations/0037_fase6_bloque1_estado_de_evidencia.sql`: `affinity_profile()` gana `evidence_status` ('activa'/'historica'), calculado a partir del peso decaído sin piso (`decayed_weight > 0`) — distingue una afinidad con evidencia todavía viva de una sostenida únicamente por el piso tras una revocación, sin rastrear qué contribución individual fue revocada. La confianza se degrada un nivel cuando `evidence_status = 'historica'`.
- `AffinitySection.jsx`: nueva etiqueta "Sin señales activas — antecedente histórico" en lenguaje neutral, nunca una afirmación en presente sobre seguir/guardar/desear asistir.

### Verificado

Postgres 16 real (37 migraciones desde cero): seguir→dejar de seguir→volver a seguir muestra la transición activa→histórica→activa correctamente, con confianza degradada mientras dura el estado histórico; revocación parcial (1 de 3 señales) permanece 'activa'; decaimiento puro sin revocación (365 días) permanece 'activa' — distingue revocación real de mera antigüedad; reauditoría de la contribución multidimensional de seguimiento confirma exactamente una fila por dimensión por acción, sin duplicación, con el ledger completo verificado directamente. Build y lint limpios.

## 2026-07-22 — Fase 6, Bloque 1 (adenda): resolución indirecta y revocación

Adenda técnica tras auditoría solicitada antes de aprobar definitivamente el Bloque 1. Dos brechas reales encontradas y corregidas hacia adelante (no reabre `0035`).

### Agregado

- `supabase/migrations/0036_fase6_bloque1_resolucion_indirecta_y_revocacion.sql`: `public.resolve_affinity_category_zone()` (resolución compartida categoría/zona, usada por inserción y revocación); `public.record_affinity_revocation()` (`after delete on interactions`) — registra una fila de compensación append-only cuando se elimina una interacción alternable, sin borrar ni mutar la contribución original.

### Corregido

- **Resolución indirecta por autor**: Promoción (nunca tuvo categoría propia) y Publicación sin categoría propia ahora heredan categoría/zona del negocio autor; seguir un negocio ahora también aporta a su categoría/zona (además de `actor_seguido`); Evento ahora resuelve su zona vía `business_id` cuando el organizador es un negocio conocido. Ninguna ruta nueva infiere zona desde coordenadas.
- **Evidencia histórica vs. señal activa**: deshacer una interacción alternable ahora hace caer el peso calculado hacia el piso de inmediato (vía una fila de compensación negativa), en vez de conservar indefinidamente el valor pleno de una señal ya revocada — sin borrar el hecho histórico de que la señal existió.
- **Defecto real encontrado durante el análisis, antes de escribir código**: el trigger de revocación habría violado la clave foránea `affinity_contributions.actor_id` durante la eliminación en cascada de una cuenta (el actor padre ya es invisible dentro de la misma transacción) — prevenido con una guarda explícita, verificada eliminando una cuenta real con ledger existente.

### Verificado

Postgres 16 real (36 migraciones desde cero): me gusta en Promoción, publicación/comentario sin regresión, evento con y sin zona confiable, seguir negocio con doble contribución, revocación de me_gusta/guardado/seguimiento/quiero_ir cayendo exactamente al piso, soft-delete de comentario sin generar revocación, cascada de eliminación de cuenta sin error de clave foránea, imposibilidad estructural de reconstruir el objeto guardado (sin columna `target_id`), regresión de decaimiento y umbral de refinamiento. Build y lint limpios.

## 2026-07-22 — Fase 6, Bloque 1: Motor de Afinidad

Primer bloque de la Fase 6 (Descubrimiento inteligente v2). Construye el Motor de Afinidad: produce, para cada persona, una descripción legible y corregible de qué le interesa a partir de `interactions` — nunca decide qué se muestra en ningún Feed. Evidencia como registro append-only (nunca un contador mutable), cálculo de peso/confianza/estado siempre en el momento de leer, decaimiento exponencial con piso (nunca hacia cero), y tres acciones de corrección explícita (atenuar/reiniciar/desconocido), todas implementadas como filas agregadas, nunca como borrado.

### Agregado

- `supabase/migrations/0035_fase6_bloque1_motor_afinidad.sql`: tabla `affinity_contributions` (append-only, RLS habilitado sin ninguna política de lectura); `record_affinity_contribution()` (`security definer`, disparado `after insert on interactions`, resuelve categoría/zona según el tipo de contenido); `apply_affinity_correction()` (`security definer`, las tres correcciones aprobadas); `affinity_profile()` (`security definer stable`, calcula peso decaído con piso, confianza cualitativa y estado de corrección con ventana de vigencia de 30 días).
- `lib/affinity.js` (nuevo): `getAffinityProfile(actorId)`, `applyAffinityCorrection({category, followedActorId, correction})`.
- `src/features/settings/AffinitySection.jsx` (nuevo), integrado en `SettingsPage.jsx` (`/ajustes`): única superficie donde una persona ve y corrige su propio perfil de afinidad.
- `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` y `FASE6_CONTRATO_ARQUITECTONICO.md`: autoridad filosófica y arquitectónica de toda la Fase 6, incluidos cinco principios permanentes del Motor de Afinidad registrados durante este bloque.

### Corregido (encontrado durante la verificación contra Postgres real, antes de cualquier commit)

- Referencia a una constante (`v_reset_recency_days`) usada antes de declararse en `affinity_profile()`.
- Tipo incompatible en `make_interval(days => ...)` — el parámetro exige `int`, la constante era `numeric` — corregido con un cast explícito.
- Privacidad: fuga por comparación con `NULL` (mismo patrón ya visto en la Fase 5B, Bloque 3) — `v_owner_profile_id <> auth.uid()` es `NULL` (no `true`) cuando no hay sesión, dejando pasar la lectura a un invitado anónimo. Corregido con `is distinct from`.

### Verificado

Postgres 16 real (35 migraciones desde cero, múltiples veces): cómputo básico (categoría, categoría×zona, actor seguido, exclusión de Promoción y de zona en Eventos), privacidad/RLS completa (ajena, invitado, negocio), las tres acciones de corrección, ventana de vigencia del estado de corrección, decaimiento con piso sobre 365 días simulados, garantía append-only (deshacer no borra la contribución), umbral de refinamiento categoría×zona (2 vs. 3), regresión de comentarios sobre Evento. Build y lint limpios.

### Limitación de entorno

Sin proyecto Supabase real desplegado — misma limitación ya documentada desde la Fase 1; afecta la verificación de `/ajustes` con datos reales autenticados.

## 2026-07-22 — Fase 5B, Bloque 3: comentarios generalizados (Evento y Publicación)

Generaliza los comentarios (antes exclusivos de Evento, sobre `event_comments`) a Evento y Publicación por igual, sobre `interactions`/`interaction_comments` — Promoción queda deliberadamente excluida. Introduce un actor de sistema "Cuenta eliminada" para anonimizar comentarios de cuentas eliminadas sin perder el contenido de terceros, y un índice único parcial que permite múltiples comentarios del mismo actor sobre el mismo contenido sin romper la unicidad de los otros seis tipos de interacción.

### Agregado

- `supabase/migrations/0034_fase5b_bloque3_comentarios_generalizados.sql`: catálogo de tipos ampliado con `'comentario'`; índice único parcial (`interactions_unique_toggle_idx`, excluye `type = 'comentario'`); actor de sistema "Cuenta eliminada"; tabla `interaction_comments` (soft-delete de dos estados, `check` a nivel de base de datos, `parent_comment_id` sin exponer todavía); `enforce_comment_rules()` (visibilidad, exclusividad de Evento/Publicación, exclusión explícita de Promoción, límite de tasa); `protect_comment_soft_delete()` (única transición de `UPDATE` permitida); backfill campo por campo de `event_comments`; `event_comments_sync_count` deshabilitado (tabla legacy, sin eliminar).
- `lib/interactions.js`: `listComments`, `createComment`, `deleteComment`.
- `lib/publications.js`: `getPublication`.
- `src/features/social/CommentsSection.jsx` (nuevo): componente compartido de comentarios — lista, formulario con estado `busy` (previene doble envío), distinción "autor eliminado" vs. "comentario eliminado", eliminar solo el propio comentario.
- `src/pages/PublicationDetailPage.jsx` (nueva) + ruta `/publicacion/:id`.
- `supabase/functions/process-account-deletions/index.ts`: reasigna `interactions` `type = 'comentario'` del usuario a "Cuenta eliminada" antes de `auth.admin.deleteUser`; aborta la eliminación si la reasignación falla.

### Cambiado

- `EventSheet.jsx`: reemplaza su implementación en línea de comentarios (sobre `event_comments`) por `CommentsSection`.
- `lib/events.js`: retira `listEventComments`/`createEventComment`, sin ningún llamador tras el cambio anterior.
- `PublicationFeedCard.jsx`: "Ver más" navega a `/publicacion/:id` en vez de expandir la descripción en el sitio.

### Corregido (encontrado durante la verificación contra Postgres real, antes de cualquier commit)

- Constraint de dos estados con fuga de `NULL` (`char_length(btrim(body))` sobre `body is null` evaluaba `NULL`, no `false`) — envuelto en `coalesce`.
- Correlación fragil del backfill por `(target_id, created_at)` — reescrita como bucle procedural con correspondencia 1:1 garantizada.
- Doble conteo de `comments_count` (4→8) por crear el trigger de conteo antes del backfill — reordenado (mismo patrón ya usado en el Bloque 1).
- Promoción comentable a nivel de base de datos (el chequeo de `target_type` no distinguía `subtype`) — añadido el rechazo explícito de `subtype = 'promocion'`.
- Política de `UPDATE` sin `with check` explícito — ni el dueño ni un admin podían completar su propia eliminación porque RLS reutilizaba `using (deleted_at is null)` también como chequeo de la fila resultante — corregido con un `with check` propio.

### Verificado

Postgres 16 real (34 migraciones desde cero, múltiples veces), doble conteo, migración campo por campo, índice único parcial contra los seis tipos toggle y `comentario`, dos cuentas eliminadas reasignadas al mismo actor sobre Evento y Publicación sin conflicto, límite de tasa, soft-delete (transición válida, rechazo de doble-eliminación, rechazo de cambio estructural), RLS por rol (propio/ajeno/admin/Promoción/borrador/`target_type` inválido/invitado/actor de sistema), reversión completa en escenario limpio. Build y lint limpios.

### Limitación de entorno

Sin proyecto Supabase real desplegado — misma limitación ya documentada desde la Fase 1; afecta en particular la verificación end-to-end de `process-account-deletions`.

## 2026-07-21 — Fase 5B, Bloque 2: reacciones "Quiero ir" y "Ya fui"

Construye por primera vez las dos reacciones reservadas en `interactions.type` desde la Fase 1. Exclusivas de Eventos, coexistentes sin exclusión mutua, visibles únicamente en `EventSheet` (nunca en las tarjetas del Feed).

### Agregado

- `supabase/migrations/0033_fase5b_bloque2_reacciones_evento.sql`: `enforce_event_reaction_timing()` (trigger `before insert` sobre `interactions`, `security definer`) — rechaza "ya_fui" antes de que el evento comience, rechaza una nueva activación de "quiero_ir" después de `coalesce(end_at, start_at)`, y rechaza cualquier intento de escribir estos dos tipos contra un `target_type` distinto de `'event'`. Nunca restringe `DELETE`.
- `lib/interactions.js`: `getMyEventReactions`, `getEventReactionCounts` (conteo en vivo, sin columnas desnormalizadas), `toggleEventInteraction` (única función de escritura para Eventos, valida el tipo contra una lista de permiso).
- `src/features/events/EventReactionChips.jsx`: dos chips independientes con conteo, estado activo/inactivo/ocupado, `aria-pressed`, y nota breve cuando están deshabilitados por la compuerta temporal.
- `AI_PHILOSOPHY.md`: nueva sección "La jerarquía de señales declaradas sobre un Evento" — documenta Me gusta/Quiero ir/Ya fui/check-in futuro como señales de fuerza creciente, y que "Ya fui" nunca equivale a un check-in validado.

### Cambiado

- `EventSheet.jsx`: integra los chips nuevos, mismo patrón `requireAuth` ya usado en las tarjetas del Feed.
- `toggleEventLike` (Bloque 1) retirada en favor de `toggleEventInteraction`; `toggleSavedEvent` (Bloque 1) ahora delega en la misma función en vez de duplicar su cuerpo. `FeedPage.jsx` actualizado.

### Verificado

Postgres 16 real (33 migraciones desde cero, dos veces), los siete escenarios de la compuerta temporal y de exclusividad, coexistencia simultánea, conservación y eliminación de una intención histórica, deduplicación, RLS de actor ajeno y de sesión ausente, conteos exactos, `events.likes_count` sin interferencia, reversión completa sin pérdida de datos. Build y lint limpios.

### Limitación de entorno

Sin proyecto Supabase real desplegado — misma limitación ya documentada desde la Fase 1.

## 2026-07-21 — Fase 5B, Bloque 1: Eventos y Lugares migran a `interactions`

Primer bloque de la Fase 5B: cierra la deuda de "cambio de fuente de verdad" dejada pendiente desde el cierre del Bloque 4 de la Fase 1. "Me gusta" y "guardado" de Eventos y Lugares dejan de vivir en `post_likes`/`saved_events`/`saved_places` y pasan a `interactions`, con reconciliación bidireccional (no un backfill simple).

### Agregado

- `supabase/migrations/0032_fase5b_bloque1_fuente_de_verdad_interacciones.sql`: reconciliación bidireccional (inserta lo que falta, elimina huérfanos) de `post_likes`(event/place) y `saved_events`/`saved_places` contra `interactions`; `sync_event_likes_count_from_interactions()` (nuevo trigger sobre `interactions`, `security definer`) reemplaza a `sync_event_likes_count()` (deshabilitado, no eliminado); `post_likes.target_type` ya no admite filas nuevas de `'event'`/`'place'` (`check` `not valid`, sin afectar filas históricas).
- `lib/interactions.js`: `listMyLikedEventIds`/`toggleEventLike`, `listMySavedEventIds`/`toggleSavedEvent`, `listMySavedPlaceIds`/`toggleSavedPlace`/`listMySavedPlaces`.

### Cambiado

- `FeedPage.jsx`, `SavedEventsContext.jsx`, `SavedPlacesContext.jsx`, `SettingsPage.jsx` migrados a la nueva capa de datos.
- `postLikes.js`/`savedEvents.js`/`savedPlaces.js` marcados como legacy (parcial el primero, completo los otros dos) con nota de cabecera; sin cambio de comportamiento exportado.

### Corregido

- **Hallazgo encontrado y corregido antes del commit**: el trigger nuevo, sin `security definer` en su primera versión, no lograba actualizar `events.likes_count` para un actor autenticado sin privilegios de administrador — la política RLS de `events` bloqueaba el `update` interno. Defecto heredado del trigger original (nunca tuvo `security definer` tampoco), nunca antes detectado porque toda verificación previa se hizo con rol de servicio o superusuario. Corregido agregando `security definer set search_path = public`.

### Verificado

- Postgres 16 real, las 32 migraciones aplicadas en orden contra una base limpia (dos veces). Reconciliación bidireccional probada con inserción de filas faltantes y eliminación de huérfanos simultáneamente. `events.likes_count` verificado con un actor real no administrador. Privacidad de "guardado" y publicidad de "me gusta" sin cambios. `post_likes` bloquea nuevas filas de `event`/`place`, sigue aceptando `status`/`question` sin ningún cambio. Deduplicación por `unique` confirmada. Trigger viejo confirmado deshabilitado (`tgenabled='D'`). Reversión completa ejecutada de verdad, sin pérdida de datos en ninguna tabla legacy. Build y lint limpios.

### Limitación de entorno

Sin proyecto Supabase real desplegado — Playwright se limitó a confirmar ausencia de errores de ejecución tras el refactor, misma limitación documentada desde la Fase 1.

## 2026-07-21 — Cierre de la etapa conceptual y metodología permanente de trabajo

El Product Owner declaró oficialmente cerrada la etapa de construcción conceptual del proyecto y aprobó la adopción de `VISION_MAESTRA.md` como definitiva. `VISION_MAESTRA.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `AI_PHILOSOPHY.md`, `ARCHITECTURE.md` y `MASTERPLAN.md` quedan congelados salvo decisión estratégica excepcional; `ROADMAP.md`, `PROJECT.md` y `CHANGELOG.md` continúan como registro de ejecución. La prioridad vuelve al desarrollo del producto.

### Agregado

- `PROJECT.md`: nueva sección "METODOLOGÍA PERMANENTE DE TRABAJO" — el flujo de nueve pasos obligatorio para toda fase futura (revisar la Visión Maestra, analizar coherencia filosófica, detectar contradicciones antes de código, presentar análisis, esperar aprobación explícita, implementar solo el alcance aprobado, verificar contra Postgres real/RLS/Playwright/build/lint, documentar, no avanzar de bloque sin aprobación), el criterio permanente ("¿esta decisión fortalece la Visión Maestra?") y el principio de evolución por coherencia, no por acumulación de funciones.

### Nota

- Ningún código, componente ni funcionalidad fue modificado — cambio exclusivamente documental, de registro de metodología.

## 2026-07-21 — Adopción formal de `VISION_MAESTRA.md` como autoridad conceptual máxima del proyecto

Pausa estratégica solicitada explícitamente por el Product Owner tras el cierre de la Fase 4, antes de autorizar cualquier fase nueva: ningún código, ninguna migración, ninguna funcionalidad — trabajo puramente conceptual sobre la identidad de Ahorita, desarrollado en tres iteraciones (análisis profundo de los trece temas fundacionales, segunda iteración centrada en el ciudadano/identidad editorial/IA/ciudad viva/utilidad sobre atención, y revisión editorial final) hasta quedar aprobado y congelado.

### Agregado

- `VISION_MAESTRA.md` — documento nuevo, máxima autoridad conceptual de todo el proyecto. Trece secciones: esencia, misión, visión a cinco años, filosofía del producto (incluye el principio de responsabilidad ética: accesibilidad, equidad de representación del criterio local, riesgo de que una recomendación exitosa dañe lo que recomienda), diferenciación, economía local, inteligencia artificial, identidad editorial, comunidad, experiencia de usuario, descubrimiento, el ciudadano, y una sección final de tensiones estratégicas sin resolver, nombradas con la misma honestidad que el resto del documento.
- `PROJECT.md`: nueva sección "VISIÓN MAESTRA ADOPTADA" — registro formal de cuándo, por qué, propósito, alcance, cómo debe usarse y la jerarquía documental resultante.

### Cambiado

- `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `AI_PHILOSOPHY.md`, `ARCHITECTURE.md`, `MASTERPLAN.md`, `ROADMAP.md`, `README.md`, `PROJECT.md`: referencias de autoridad actualizadas para reflejar que `VISION_MAESTRA.md` es ahora la máxima autoridad conceptual, y que el resto de los documentos quedan subordinados a ella (directamente o a través de `PRODUCT_MANIFESTO.md`).

### Verificado

- Ninguna funcionalidad, componente, migración ni comportamiento de la aplicación fue tocado — cambio exclusivamente documental.
- Sin contradicciones ni referencias obsoletas entre los ocho documentos de autoridad tras la actualización cruzada.

### Nota

- Documento declarado explícitamente congelado por el Product Owner: no se modifica por ideas nuevas aisladas ni por conveniencia de una fase futura — cualquier cambio requiere una nueva decisión estratégica explícita.

## 2026-07-19 — Cierre formal de la Fase 4: Contenido social ampliado, el Feed como centro

Cierre formal solicitado tras completar los cuatro bloques (Feed como contrato central, Publicaciones, Promociones, Compartidos) y la corrección del último hallazgo pendiente (riel de acciones recortado). Los cuatro bloques del alcance aprobado en `FASE4_CONTRATO_ARQUITECTONICO.md` quedaron implementados, verificados y aprobados por separado; el principio rector de la fase (nunca migrar `events` antes de validar el nuevo núcleo) se sostuvo sin excepciones.

### Documentación (sin cambios de código)
- `PROJECT.md`: nueva sección "FASE 4 CERRADA — Contenido social ampliado, el Feed como centro (2026-07-19)" — resumen ejecutivo de los cuatro bloques, objetivo original vs. resultado final, arquitectura lograda, decisiones de producto, relación con `PRODUCT_MANIFESTO.md`/`PRODUCT_STRATEGY.md`, cómo la fase fortalece los cinco pilares del producto, problemas encontrados y su resolución, confirmación de que Events permaneció intacto, convivencia temporal entre Events y el núcleo de Publicaciones, señales nuevas disponibles para la futura Guía IA, deudas técnicas consolidadas, funcionalidades deliberadamente no construidas, dependencias habilitadas para las fases siguientes, criterios de cierre funcional, listado de pruebas acumuladas y commits principales de cada bloque.
- `ROADMAP.md`: Fase 4 movida de "en progreso" a "Fases completas" (ítem 11); deuda técnica acumulada actualizada para incluir la Fase 4.
- `FASE4_CONTRATO_ARQUITECTONICO.md`: nueva sección de cierre formal al final del documento, apuntando al detalle completo en `PROJECT.md`.
- Checkpoint de Git: tag `checkpoint-fase4-feed-social`.

### Pendiente, no forma parte de esta fase
Ninguna Fase 5B (ni ninguna otra fase futura del `MASTERPLAN.md`) queda autorizada ni iniciada por este cierre. Las deudas técnicas registradas (validación end-to-end contra Supabase real, canje físico de Promoción reservado para la Fase 9, concurrencia real del `unique` de `interactions`, consolidación futura de `events` sobre el núcleo compartido, entre otras heredadas de fases anteriores) permanecen como pendientes obligatorios antes de producción, documentadas en `PROJECT.md` y `ROADMAP.md`.

## 2026-07-19 — Corrección: fila estática de acciones en Publicación/Promoción

Corrección puntual, aprobada explícitamente, del hallazgo del Bloque 4 (riel de acciones recortado en contenido corto sin imagen). Alcance acotado a la solución elegida: no reabre arquitectura, no toca `FeedCard.jsx` (Eventos nunca tuvo el problema).

### Agregado
- `src/features/feed/ContentActionsRow.jsx`: fila estática de Me gusta/Compartir/Guardar, compartida entre Publicación y Promoción, siempre en flujo normal del documento después del contenido — nunca flotante, nunca depende de una altura mínima artificial.

### Cambiado
- `PublicationFeedCard.jsx`/`PromotionFeedCard.jsx`: reemplazan `SocialActions` (riel flotante) por `ContentActionsRow`. El bloque de foto (cuando existe) pasa a tener una altura propia y acotada en vez de llenar toda la tarjeta.

### Verificado
Playwright (`test_fase4_bloque4_fix.js`, 9 escenarios): las seis combinaciones exigidas (Publicación/Promoción × corta sin imagen/larga sin imagen/con imagen) con los tres controles verificados clickeables vía `elementFromPoint` (no solo presentes en el DOM); estado activo/inactivo y ocupado confirmados con interacción real. Regresión completa de Eventos, Publicaciones, Promociones y Compartir sigue pasando. Build y lint limpios. Capturas antes/después adjuntas.

## 2026-07-19 — Fase 4, Bloque 4: Compartidos fortalecen el Feed

Cuarto y último bloque de la Fase 4 — alcance deliberadamente pequeño e instrumental: convertir cada acción real de compartir (Evento, Publicación, Promoción, Perfil de persona o negocio) en una señal medible dentro de `interactions`, sin cambiar la experiencia nativa de compartir. Sin migración nueva — `interactions` ya estaba preparada para esto desde el Bloque 1 de la Fase 1 (`'compartir'` en el `check` de `type`, `target_type` genérico, `unique(actor_id, type, target_type, target_id)`).

### Agregado
- `src/hooks/useShareContent.js`: hook único que reemplaza las cuatro implementaciones casi idénticas de `handleShare` (Evento, Publicación, Promoción, Perfil). Compartir nunca se bloquea por falta de sesión; la interacción solo se registra con sesión real; cancelar el diálogo nativo nunca es un error; un fallo al registrar nunca revierte el compartir que ya ocurrió.
- `registerShare()` en `src/lib/interactions.js`: trata un conflicto de unicidad (23505, segundo intento sobre el mismo contenido) como éxito idempotente, nunca como error.

### Cambiado
- `ActionBar.jsx`: Compartir ya no vive solo dentro del bloque de negocio — ahora también aparece en el perfil de una persona (antes ausente).

### Verificado
Postgres 16 real con roles de bajo privilegio: un actor solo registra a nombre propio, no puede registrar por otro ni borrar interacciones ajenas, segundo intento sobre el mismo contenido no duplica fila. Playwright (11 escenarios + 1 verificación adicional): completar, cancelar, fallback de copiar enlace (éxito y fallo), visitante sin bloqueo y sin registro, segundo intento sin error visible, las cinco superficies (Evento/Publicación/Promoción/Perfil persona/Perfil negocio). Regresión completa de Fases 1-3 y Bloques 1-3 sigue pasando sin cambios de mocks. Build y lint limpios.

### Hallazgo documentado, sin decidir arreglo
Al probar Compartir sobre contenido corto sin imagen se descubrió que el riel de acciones de `PublicationFeedCard`/`PromotionFeedCard` puede quedar recortado por `overflow: hidden` — defecto preexistente del Bloque 2, no introducido por este bloque. Implica una decisión de diseño real (varias soluciones válidas); queda documentado en `PROJECT.md` para que el Product Owner decida antes de tocarlo.

## 2026-07-19 — Fase 4, Bloque 3: Promociones alimentan el Feed

Tercer bloque de la Fase 4. Incorpora siete ajustes de producto acordados al aprobar el diseño: ventana de anticipación de 24 horas ("Empieza hoy"/"Empieza mañana"), reutilización estricta del criterio de orden por distancia a "ahora" (sin algoritmo nuevo), sin "Quiero ir" (exclusivo de Eventos), restricciones siempre visibles, beneficio exigido como frase completa, doble etiqueta temporal siempre junta ("Publicado hace…" + "Válido hasta…"), y ventana de gracia de 3 horas tras finalizar ("Finalizó hace…") antes de desaparecer del Feed. Incluye además la corrección de un hallazgo de seguridad del Bloque 2: la RLS de `publications` no volvía a exigir verificación al reactivar/publicar contenido ya existente.

### Agregado
- `supabase/migrations/0031_fase4_bloque3_promociones.sql`: detalle `promotion_details` sobre el núcleo `publications` (subtype `promocion`); `actor_can_author_promotion()` (Ahorita Editorial excluido permanentemente); `enforce_publication_publish_authorization()` (corrige el hallazgo de verificación, aplica a Publicación y Promoción); `promotion_status()` (seis fases, única fuente de verdad computada); `list_feed_promotions()` (función pública estrecha); inmutabilidad de `ended_early_at`.
- `src/lib/promotions.js`, extensión de `src/lib/time.js` (etiquetas de fase) y de `src/lib/interactions.js` (me gusta/guardado sobre Promociones).
- `src/lib/feed.js`: Promociones como tercera fuente real, con `sortAt` calculado por fase.
- `src/features/feed/PromotionFeedCard.jsx`, `src/features/profile/PromotionComposerSheet.jsx`, `src/features/profile/PromotionsSection.jsx`.

### Corregido
- Hallazgo de seguridad del Bloque 2: un negocio que pierde la verificación ya no puede publicar un borrador ni reactivar contenido oculto (antes sí podía, por un vacío en la RLS de `update` de `publications`).
- Corrección visual (afecta también al Bloque 2): la etiqueta de tipo de tarjeta ("Promoción"/"Publicación") se superponía al nombre del autor cuando el contenido no tiene imagen; ahora fluye en el documento en ese caso, sin afectar el caso con imagen.

### Verificado
Postgres 16 real con roles de bajo privilegio: negocio vigente crea y publica, negocio sin verificar rechazado incluso en borrador, "Ahorita Editorial" siempre rechazado, beneficio corto y fechas inválidas rechazados por la base de datos, un negocio que **pierde** la verificación (transición real `aprobado → vencido` vía `service_role`) queda bloqueado al publicar/reactivar pero conserva edición y eliminación, `promotion_status()` correcto en sus seis fases, `ended_early_at` inmutable, `list_feed_promotions()` solo expone fases públicas. Playwright (5 escenarios): Feed con Promoción completa, sin comentarios ni "Quiero ir", etiqueta propia para promociones programadas, compatibilidad sin promociones, visitante sin sección montada. Regresión completa de Fases 1-3 y Bloques 1-2 sigue pasando (se agregaron mocks de `rpc/actor_can_author_promotion` y `rpc/list_feed_promotions` en archivos de prueba de sesiones anteriores; la misma inestabilidad de doble-toque de la Entrega 6 se confirmó de nuevo como ruido de entorno). Build y lint limpios.

## 2026-07-19 — Fase 4, Bloque 2: Publicaciones alimentan el Feed

Segundo bloque de la Fase 4. Incorpora cinco ajustes de producto acordados al aprobar el diseño: protección contra publicaciones accidentales (frontend, sin mecanismo nuevo de base de datos), límite de 500 caracteres exigido por restricción real de base de datos, edición transparente (`published_at` protegido por trigger, "Editado" siempre con fecha original visible), pérdida de verificación (el contenido ya publicado nunca desaparece; solo se bloquea crear contenido nuevo), y preparación de permalink (satisfecha por construcción con el `id` uuid estable, sin campo adicional).

### Agregado
- `supabase/migrations/0030_fase4_bloque2_publicaciones.sql`: núcleo `publications` + detalle `publication_posts`; `public.actor_can_author_publication()`; triggers de protección de `published_at` y de `updated_at` del detalle. `events` intacto.
- `src/lib/publications.js`, extensión de `src/lib/interactions.js` (me gusta/guardado sobre Publicaciones, reutilizando `interactions` sin migración).
- `src/lib/feed.js`: Publicaciones como segunda fuente real; `mergeFeedSources` pasa a ordenar por distancia absoluta respecto a "ahora" (retrocompatible: con una sola fuente, eventos, da el mismo resultado que antes).
- `src/features/feed/PublicationFeedCard.jsx`, `src/features/profile/PublicationComposerSheet.jsx`, `src/features/profile/PublicationsSection.jsx`, `src/pages/admin/AdminEditorialPage.jsx` (Ahorita Editorial).

### Verificado
Postgres 16 real con roles de bajo privilegio: negocio verificado publica, no verificado rechazado, administrador operativo activo con éxito, revocado rechazado de inmediato (crear y editar), tercero ajeno rechazado, solo admin de plataforma publica como "Ahorita Editorial", borrador/oculto invisibles fuera de su dueño, texto >500 caracteres rechazado, `published_at` protegido tras ocultar-y-republicar, "Editado" correcto en ambos sentidos. Playwright (3 escenarios): feed mezclado con jerarquía visual, compatibilidad sin publicaciones, visitante sin sección montada. Regresión completa de Fases 1-3 y Bloque 1 sigue pasando (se corrigió, en archivos de prueba de sesiones anteriores, la falta de mock para la nueva llamada a `publications`; una falla puntual de doble-toque de la Entrega 6 se confirmó de nuevo como inestabilidad de entorno, no regresión). Build y lint limpios.

## 2026-07-18 — Fase 4, Bloque 1: el Feed como contrato central

Primer bloque de la Fase 4, rediseñada tres veces antes de implementarse bajo `PRODUCT_MANIFESTO.md` y `PRODUCT_STRATEGY.md` — ver `FASE4_CONTRATO_ARQUITECTONICO.md` (autoridad de diseño de esta fase). Principio rector: nunca migrar un sistema estable (`events`) antes de validar completamente el nuevo (núcleo de Publicaciones, bloques siguientes). La fase se ordena alrededor del Feed, no de la base de datos.

### Agregado
- Documentos fundacionales nuevos: `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `FASE4_CONTRATO_ARQUITECTONICO.md`.
- `src/lib/feed.js`: `mapEventToFeedItem` (extraído, con `sortAt` como criterio de orden compartido entre fuentes) y `mergeFeedSources(...sources)` — contrato de composición multi-fuente, hoy invocado con una sola fuente real (Eventos), por lo que el resultado es idéntico al feed anterior.

### Sin cambios (a propósito)
`events`, `lib/events.js`, `EventSheet`, la administración de eventos y todas las interacciones existentes sobre eventos — cero diferencia observable para el usuario, criterio de aceptación explícito de este bloque.

### Verificado
Build y lint limpios. Playwright (5 escenarios): sin errores de JS, todos los eventos mockeados presentes, orden por cercanía temporal preservado, "Selección del editor" preservada, tratamiento visual "portada" del primer evento preservado. Regresión general (Inicio/Explorar/Perfil) sin errores. Sin migraciones — este bloque no toca la base de datos.

### Retirado del plan
La antigua Fase 5A ("Seguir negocios") del `MASTERPLAN.md` — su alcance ya fue absorbido por la Fase 3 (Entregas 2 y 6); no se implementará como fase independiente.

## 2026-07-18 — Cierre funcional de la Fase 3: Identidad social plena

Cierre formal solicitado tras completar la Entrega 7 y responder con transparencia si correspondía una Entrega 8. La planificación original del Bloque C (fijada al aprobar la Entrega 4) nombraba una séptima entrega de "validación visual final"; se sustituyó silenciosamente por "búsqueda y descubrimiento" al delegarse el alcance, sin señalarlo como sustitución en su momento. Reconocida la sustitución, se concluyó que ninguna deuda pendiente justificaba una Entrega 8 solo para extender artificialmente el Bloque C — todas las deudas reales ya están registradas por nombre. Se cierra oficialmente el Bloque C y, con él, la Fase 3 desde el punto de vista funcional.

### Documentación (sin cambios de código)
- `PROJECT.md`: nueva sección "FASE 3 CERRADA — Identidad social plena (2026-07-18)" — resumen ejecutivo de los tres bloques (A, B, C con sus 7 entregas), arquitectura lograda, funcionalidades implementadas, decisiones de diseño, problemas encontrados y su resolución (incluida la sustitución de la Entrega 7), deudas técnicas pendientes consolidadas, dependencias habilitadas para las fases siguientes, y los criterios que sustentan el cierre funcional.
- `ROADMAP.md`: Fase 3 movida de "próxima fase" a "Fases completas" (ítem 10), con el mismo nivel de detalle que las Fases 1 y 2; deuda técnica acumulada actualizada para incluir la Fase 3 en la validación pendiente contra un proyecto Supabase real.
- Checkpoint de Git: tag `checkpoint-fase3-identidad-social`.

### Pendiente, no forma parte de esta fase
Ninguna Fase 4 (ni ninguna otra fase futura del `MASTERPLAN.md`) queda autorizada ni iniciada por este cierre. Las deudas técnicas registradas (Storage, verificación end-to-end contra Supabase real, gestión visual de `actor_managers`, retiro de `follows`, entre otras) permanecen como pendientes obligatorios antes de producción, documentadas en `PROJECT.md` y `ROADMAP.md`.

## 2026-07-18 — Fase 3, Bloque C, Entrega 7: búsqueda y descubrimiento de negocios

El objeto de esta entrega no vino dictado de antemano — se definió con un análisis de 18 puntos que propuso cerrar la deuda técnica más citada del Bloque C (desde la Entrega 2): sin descubrimiento/búsqueda de negocios conectado a ninguna pantalla, pese a que `actor_search_index` (Bloque A/B) ya existía completa y poblada.

### Ajustes de producto exigidos antes de implementar
- Búsqueda Actor-céntrica (`actor_types` como parámetro, no una función específica de negocios) para no rediseñar cuando se agreguen otros tipos de actor.
- Categorías rápidas de acceso directo en el estado inicial de `/buscar`, reutilizando la misma búsqueda existente — sin ranking ni recomendaciones.

### Agregado
- `supabase/migrations/0029_fase3_bloqueC_entrega7_busqueda_actores.sql`: `public.search_actors(search_query, category_filter, actor_types)` — filtra `status='aprobado'` dentro de la propia función (nunca confiado solo a RLS), category_filter exacto sobre `businesses.category`, sin ranking por popularidad ni personalización (reservado para la Fase 6).
- `src/lib/actorSearch.js`: `searchActors({query, category, types})`.
- `src/features/search/ActorResultCard.jsx`: tarjeta de negocio, mismo lenguaje visual que `PlaceCard`.
- `SearchPage.jsx`: extendida (misma ruta `/buscar`) — categorías rápidas antes de escribir; secciones "Lugares"/"Negocios" siempre separadas, cada una se dibuja solo si tiene resultados reales.

### Verificado
Migración contra Postgres 16 real como visitante anónimo: negocio aprobado encontrado por texto y por categoría; negocio pendiente nunca aparece aunque el nombre coincida exactamente; búsqueda por contenido de bio/descripción funciona; sin query ni categoría devuelve 0 filas; personas nunca aparecen filtrando por `types=['negocio']`. Playwright (6 escenarios): chips iniciales, secciones separadas, sección vacía no se renderiza, sin resultados con mensaje honesto, navegación a perfil. Regresión completa de las Entregas 1-6 (43 escenarios) sigue pasando — una falla puntual de temporización en un escenario de doble-toque de la Entrega 6 se confirmó como inestabilidad del entorno (repetición aislada limpia), no una regresión real. Build y lint limpios.

## 2026-07-18 — Fase 3, Bloque C, Entrega 6 (seguimiento): documentar reconciliación como legacy

Recomendación de arquitectura aprobada al cerrar la Entrega 6: `reconcile_follows_to_interactions()` debe quedar documentada expresamente como herramienta de una sola ejecución, no una operación normal del sistema, para evitar que se reejecute sobre datos ya consolidados.

### Agregado
- `supabase/migrations/0028_fase3_bloqueC_entrega6_documentar_reconciliacion_legacy.sql`: `comment on function` — puramente documental, verificado contra Postgres 16 real, sin cambiar ninguna columna, política ni comportamiento.

## 2026-07-18 — Fase 3, Bloque C, Entrega 6: consolidación del seguimiento y experiencia social

Precedida por un análisis de 18 puntos que concluyó que esta entrega debía tratarse como consolidación de arquitectura/seguridad/experiencia, no como funcionalidad social nueva — la mayoría ya existía, solo para negocios.

### Bifurcación resuelta con aprobación explícita
`follows` (persona→persona, Fase 1) e `interactions` (cualquier actor, Entrega 2) eran dos sistemas de seguimiento desconectados. Se migró el seguimiento de personas a `interactions`, convirtiéndola en la única fuente de verdad futura; `follows` queda como legacy de solo respaldo (no se elimina en esta entrega).

### Agregado
- `supabase/migrations/0027_fase3_bloqueC_entrega6_seguimiento_unificado.sql`: reconciliación puntual `follows` → `interactions` (inserta drift faltante, elimina huérfanos persona→persona sin respaldo real); `reconcile_follows_to_interactions()` reutilizable (solo admin, únicamente copia hacia adelante); trigger `prevent_self_interaction` — bloquea a nivel de base de datos seguirte a ti mismo, seguir tu propio negocio, y guardarlo como propietario/administrador operativo.
- `src/hooks/useActorSocialState.js`: estado compartido entre `ActionBar`/`ActivityStrip` — contadores reactivos, optimista con reversión exacta, `busy` por acción, mensaje de error transitorio.
- `src/lib/interactions.js`: `listFollowedProfileIds`, `describeInteractionError`.
- `src/lib/actorProfile.js`: `getActorIdForProfile`.
- `ActionBar.jsx`/`ActivityStrip.jsx`: ahora también para actores persona (antes exclusivo de negocio); "Cómo llegar" abre `DirectionsSection` completo en vez de un enlace básico.
- `AboutSection.jsx`: teléfono/WhatsApp pasan a ser texto informativo (ya no duplican los botones de `ActionBar`).
- `FollowContext.jsx`: reescrito sobre `interactions`, misma forma pública — `AuthorTag.jsx` no necesitó ningún cambio.

### Eliminado
- `src/lib/follows.js` — sin más referencias (la tabla en la base de datos no se toca).

### Incidencia encontrada y corregida antes de cualquier commit
La primera versión de `reconcile_follows_to_interactions()` también eliminaba interacciones sin fila de `follows` correspondiente — correcto solo en el instante exacto de la migración, pero habría borrado seguimientos nuevos legítimos si se reejecutaba después del corte. Encontrado probando la función contra Postgres real con datos que reproducían el escenario; corregido dejando la eliminación de huérfanos únicamente en la reconciliación puntual (una sola vez, dentro de la migración), nunca en la función reutilizable.

### Verificado
Migración y trigger contra Postgres 16 real: seguir persona/negocio, autointeracción rechazada (uno mismo, negocio propio, negocio administrado), tercero sigue/deja de seguir, RLS impide suplantar o borrar interacciones ajenas, duplicado rechazado por `unique`, reversión real probada (trigger removido → auto-seguimiento posible → reaplicado). Playwright (10 escenarios + 1 de `AuthorTag`): contadores reactivos, botón oculto para autointeracción, "Cómo llegar" enriquecido, reversión ante error con mensaje, doble-toque una sola escritura, `AuthorTag` escribe en `interactions` nunca en `follows`. Regresión completa de las Entregas 1-5 (33 escenarios) sigue pasando. Build y lint limpios.

## 2026-07-18 — Fase 3, Bloque C, Entrega 5: selector de perfil unificado

A partir de esta entrega, nueva metodología para el resto del proyecto: cada entrega futura se presenta primero como un análisis de 18 puntos (arquitectura, UX/UI, product design, auditoría técnica) antes de escribir código, cuestionando activamente el diseño previo — no solo confirmando la funcionalidad pedida.

Sin ninguna migración nueva — toda la seguridad (`actor_belongs_to_current_user`, `actor_managers`) ya existía desde el Bloque A.

### Bifurcación resuelta con aprobación explícita
El encargo original describía un selector agregado sobre `ProfilePage.jsx` (estética heredada de la Fase 1, inconsistente con el sistema editorial del Bloque C). Se propusieron dos opciones — agregarlo sin tocar la estructura, o unificar el perfil personal al mismo `/actor/:actorId` que ya usan los negocios, retirando `ProfilePage.jsx` — y una sub-pregunta sobre mover ajustes a `/ajustes`. El usuario aprobó la opción de unificación y `/ajustes`.

### Agregado
- `src/hooks/useMyActorId.js`: resuelve el `actor_id` persona del usuario autenticado.
- `src/lib/actorProfile.js`: `listMyManagedActors(profileId)` — negocios propios + administrados (activos), deduplicados y etiquetados por rol.
- `src/features/profile/ProfileSwitcherSheet.jsx`: hoja de selección — "Tú", cada negocio propio/administrado, "Registrar un negocio".
- `src/pages/SettingsPage.jsx` (reemplaza a `ProfilePage.jsx`): cuenta, intereses, guardados, push, admin, cerrar sesión — sin "Mis negocios" (reemplazada por el selector).
- `src/pages/MyProfileRedirectPage.jsx`: `/perfil` pasa a ser un punto de entrada estable que redirige a `/actor/:miActorId`.
- `ActorProfilePage.jsx`: íconos de selector (mi perfil o cualquier negocio editable) y ajustes (solo mi perfil de persona) en el encabezado.
- `BottomNav.jsx`: la pestaña "Perfil" apunta directamente a `/actor/:miActorId`.

### Eliminado
- `src/pages/ProfilePage.jsx` — sin más referencias en el código.

### Verificado
Build y lint limpios. Playwright: BottomNav y encabezado en mi propio perfil (selector + ajustes, sin lápiz); selector muestra "Tú"/negocio propio/negocio administrado/"Registrar un negocio"; clic en negocio administrado navega a su perfil; negocio propio visto como editor (lápiz + selector, sin ajustes); negocio de un tercero sin ninguno de los tres íconos; `/perfil` redirige a `/actor/:miActorId`; `/ajustes` sin "Mis negocios". Regresión completa de las Entregas 1-4 (26 escenarios) sigue pasando.

## 2026-07-18 — Fase 3, Bloque C, Entrega 4: edición de horarios y catálogo

### Agregado
- `supabase/migrations/0026_fase3_bloqueC_ocultar_coleccion.sql`: `business_catalog_collections.is_visible` + política pública ajustada (hallazgo presentado y aprobado antes de implementar).
- `src/lib/businessHours.js`: `replaceBusinessHours` (reemplazo completo del horario semanal), `findOverlappingIntervals` (validación previa, mismo criterio que el trigger de Postgres), CRUD de horarios especiales.
- `src/lib/catalog.js`: CRUD completo de colecciones e ítems para el editor, `moveItemsOutOfCollection` (decisión explícita antes de eliminar una colección con elementos).
- `src/features/profile/HoursEditor.jsx` (horario regular, guardado propio staged), `SpecialHoursEditor.jsx` (excepciones, inmediato), `CatalogEditor.jsx` + `CatalogItemSheet.jsx` (colecciones e ítems, inmediato).
- `ActorEditPage.jsx`: secciones "Horarios" y "Catálogo", exclusivas de negocios.

### Corrección encontrada durante esta entrega
`listBusinessCatalog` (Entrega 2, perfil público) no filtraba colecciones ocultas — solo ítems. Con `is_visible` recién agregado a las colecciones, un propietario viendo su propio perfil público habría visto sus colecciones ocultas. Corregido antes de cualquier commit.

### Verificado
Migración y RLS contra Postgres 16 real: propietario/administrador operativo activo pueden editar; administrador **revocado** pierde el acceso; tercero bloqueado; administrador de plataforma con acceso global; solapamiento de horarios rechazado por el trigger existente. Playwright: horario variado guardado, solapamiento rechazado antes de guardar, horario especial agregar/eliminar, catálogo vacío → crear colección → agregar ítem con precio "desde", ítem variable/agotado, eliminar colección con elementos → decisión explícita, tercero bloqueado. Regresión completa de las Entregas 1-3 (19 escenarios) sigue pasando. Build y lint limpios.

## 2026-07-18 — Fase 3, Bloque C, Entrega 3: edición del perfil

Sin ninguna migración nueva — toda la seguridad (propietario legal o administrador operativo activo, terceros bloqueados) ya existía desde el Bloque A; esta entrega es la primera vez que el frontend la usa para escribir.

### Agregado
- `src/lib/uploadValidation.js`: validación de tipo (jpeg/png/webp) y tamaño (máx. 5 MB) antes de subir.
- `src/lib/actorMedia.js`: alta/baja/reordenamiento de `actor_media`, límite de 12 fotos (decisión de producto).
- `src/lib/actorProfile.js`: `canEditActor`, `updateActorProfileDetails`.
- `src/components/ui/MediaUploader.jsx`: props opcionales `aspectRatio`/`round` + validación — sin romper los usos existentes (lugares/eventos).
- `src/features/profile/GalleryEditor.jsx`: galería con reordenamiento por flechas, cada acción se guarda de inmediato (a diferencia de logo/portada/bio).
- `src/pages/ActorEditPage.jsx` + ruta `/actor/:actorId/editar`: logo, portada, bio y galería con snapshot/dirty, estado de guardado, confirmación al salir, vista previa reutilizando `ActorProfileHeader`.
- `ActorProfilePage.jsx`: ícono de edición visible solo cuando `canEditActor()` es verdadero.

### No implementado a propósito
Editores de horarios y catálogo — quedan para la Entrega 4.

### Verificado
Build y lint limpios. Playwright con sesión autenticada real de supabase-js simulada (primera vez en este proyecto): tercero bloqueado, propietario/admin operativo con editor completo, dirty-tracking + guardado con `PATCH` correcto, confirmación al salir con cambios sin guardar, validación de tipo y tamaño rechazando archivos inválidos sin llamar a Storage, carga de logo válida, galería agregar/eliminar. Regresión de Feed/Explorar/Perfil y de los perfiles públicos de las Entregas 1-2 sin cambios de comportamiento.

## 2026-07-18 — Fase 3, Bloque C, Entrega 2: Centro del Negocio

Precedida por una propuesta de diseño funcional y visual aprobada explícitamente antes de escribir código (jerarquía, prioridad de acciones, organización de contenido, estrategia contra espacios vacíos, adaptabilidad por rubro, componentes, integraciones futuras).

### Agregado
- `src/lib/interactions.js`: contadores y toggle de seguir/guardar para cualquier actor, vía `interactions` (Fase 1, Bloque 4) — sin ninguna migración nueva.
- `src/lib/catalog.js`, `src/lib/businessHours.js`: catálogo agrupado por colección; horario semanal con días consecutivos agrupados.
- `src/lib/events.js`: `listBusinessEvents`. `src/lib/actorProfile.js`: `listActorMedia`.
- `src/features/profile/{ActivityStrip,ActionBar,CatalogSection,EventsShelf,GallerySection,AboutSection,GuideTeaser}.jsx`: cada uno se auto-consulta y no se monta sin datos reales.
- `ActorProfileHeader.jsx`: respaldo sin foto ahora teñido por categoría (antes color plano).

### Bifurcación resuelta sin migración
"Seguir" un negocio no tenía dónde escribir (`follows` solo admite personas). Se usó `interactions`, genérica desde la Fase 1 Bloque 4 pero nunca antes escrita por el frontend — `follows`/`saved_places` quedan intactos.

### No implementado a propósito
Historias, reels/publicaciones, promociones, "negocios similares" — sin tabla ni dato real todavía; reservados a nivel de diseño, no de código, siguiendo la misma regla de "sin contenido real, no se dibuja".

### Verificado
Build y lint limpios. Playwright (red interceptada): negocio completo (catálogo con 2 colecciones, evento, galería, 128/342 guardados-seguidores, horario agrupado); negocio disperso (ninguna sección de contenido se dibuja, actividad en 0 mostrada honestamente); visitante sin sesión tocando "Seguir" redirige a `/login`. Regresión de Feed/Explorar/Perfil sin excepciones.

### Limitación de entorno
Misma de la Entrega 1 (sin Docker/Supabase real) más: no fue posible simular una sesión autenticada real de supabase-js para probar "seguir/guardar" de extremo a extremo — verificado por código contra la RLS de `interactions` ya probada en la Fase 1.

## 2026-07-18 — Fase 3, Bloque C, Entrega 1: perfil público unificado

Primera entrega del Bloque C ("Centro del Negocio") y primera vez que la Fase 3 toca `src/`. Solo lectura.

### Agregado
- `supabase/migrations/0025_fase3_bloqueC_insignia_publica.sql`: `public.actor_verification_badge(actor_id)` — función pública y estrecha que calcula vigente/en_gracia/vencida/no_verificado sin exponer ninguna fila de `verifications` ni sus campos sensibles.
- `src/lib/actorProfile.js`, `src/lib/time.js` (formateador de hora en zona Cuenca): capa de datos del perfil público.
- `src/features/profile/{ActorProfileHeader,VerificationBadge,BusinessOpenStatus}.jsx`: tarjeta de identidad unificada (persona o negocio) — foto/portada/nombre/bio/categoría/insignia en vivo/estado abierto-cerrado/dirección y zona.
- `src/pages/ActorProfilePage.jsx` + ruta `/actor/:actorId` en `src/App.jsx`.
- `src/pages/ProfilePage.jsx`: "Mis negocios" enlaza al nuevo perfil público.

### Bifurcación de permisos resuelta antes de implementar
`verifications` es privada por diseño (Fase 2) — un visitante anónimo no podía calcular la insignia. Se presentaron 3 alternativas, se aprobó la función pública estrecha (opción recomendada).

### Verificado
- Migración 0025 contra Postgres 16 real: los 4 estados calculados correctamente; `anon` puede llamar la función pero sigue sin poder leer `verifications` directamente; reversión completa.
- Playwright (8 escenarios, red interceptada con datos que reproducen los estados verificados en Postgres): persona visitante, negocio vigente/en_gracia/vencido/no_verificado, horario nocturno, negocio cerrado con zona, usuario autenticado (mismo contenido que visitante — sin vista diferenciada por rol todavía).
- Regresión de Feed/Explorar/Perfil sin excepciones de JS; build y lint limpios.

### Limitación de entorno documentada
Sin Docker ni proyecto Supabase real disponibles en este sandbox, el Playwright valida el frontend contra red interceptada, no un flujo end-to-end contra Auth+PostgREST+RLS en vivo — deuda técnica obligatoria sumada a la ya existente de Fases 1-2.

## 2026-07-18 — Fase 3, Bloque B: horarios, catálogo y ubicación estructurada

Segundo bloque de la Fase 3 del `MASTERPLAN.md`. Aditivo sobre las Fases 1-2 y el Bloque A. Cero cambios en `src/`.

### Agregado
- `supabase/migrations/0024_fase3_bloqueB_horarios_catalogo_ubicacion.sql`: `business_hours` (horario regular, múltiples intervalos por día, turnos que cruzan medianoche, 24 horas, días cerrados, con validación de superposición vía trigger); `business_special_hours` (excepciones por fecha con prioridad absoluta sobre el horario regular); `business_open_status()` (función central en PostgreSQL, zona horaria `America/Guayaquil`, que calcula abierto ahora/próxima apertura/próximo cierre); `business_catalog_collections`/`business_catalog_items` (colecciones flexibles por negocio, sin taxonomía rígida por rubro); extensión de `refresh_actor_search_index()` para incluir el catálogo; `businesses.zone_id` (columna nueva, sin backfill — ver hallazgo abajo).

### Hallazgo documentado (no un defecto)
`businesses.zone_id` no pudo backfilearse: a diferencia de `places.area` (Bloque 4, Fase 1), `businesses` no tiene ningún campo de texto libre de zona, y `zones` no tiene geometría. Se agregó la columna vacía en vez de inventar una coincidencia débil.

### Dos incidencias encontradas y corregidas antes del commit
1. El cálculo de "abierto ahora" evaluaba el horario de hoy y de ayer con la misma lógica simétrica, causando que un negocio apareciera abierto un día que no tiene horario propio (por contaminación del día anterior) y que un turno nocturno pareciera abierto antes de empezar su propio turno. Corregido separando el cálculo en dos evaluaciones asimétricas explícitas.
2. "Próximo cierre" no capturaba el cierre de un turno nocturno en curso (consultado a la 01:00 dentro de un turno 20:00–02:00, reportaba el cierre del lunes siguiente en vez de las 02:00 de esa misma madrugada) — el bucle de eventos futuros no incluía el día anterior. Corregido extendiendo el bucle para incluir explícitamente el día anterior.

Ambas detectadas probando contra Postgres 16 real, ninguna llegó a un commit sin corregir.

### Verificado
- Las 24 migraciones aplicables contra Postgres 16 real, con datos de 5 rubros distintos (restaurante, barbería, ferretería, hotel, consultorio legal).
- Horario diurno, dos intervalos el mismo día, turno que cruza medianoche (con consulta a la 01:00), 24 horas, día cerrado, feriado que anula el horario regular, próxima apertura y próximo cierre — todos correctos tras las dos correcciones.
- Validaciones y triggers: solapamiento rechazado, formas inválidas del `check` rechazadas, colección de otro negocio rechazada, precio numérico con `price_type='variable'` rechazado.
- Búsqueda extendida al catálogo funcionando, con refresco automático en cada cambio.
- RLS con roles de bajo privilegio: dueño legal y administrador operativo gestionan correctamente; terceros bloqueados; intento de delegación por un administrador operativo rechazado; usuario anónimo lee negocio aprobado; administrador de plataforma con acceso global.
- Aislamiento de la Fase 2 reconfirmado: el administrador operativo, con permiso de tabla otorgado explícitamente, fue rechazado por RLS al intentar insertar en `verifications`.
- Reversión completa sin errores (incluida la restauración de `refresh_actor_search_index` a su versión del Bloque A); build y lint sin cambios; `src/` no tocado.

## 2026-07-18 — Fase 3, Bloque A: perfil unificado y administración

Primer bloque de la Fase 3 del `MASTERPLAN.md` (reformulada en tres bloques: A perfil unificado/administración, B información estructurada, C perfiles visibles/editables — "Centro del Negocio"). Aditivo sobre las Fases 1-2, sin tocar `verifications`/`actor_roles`.

### Agregado
- `supabase/migrations/0023_fase3_bloqueA_perfil_administracion.sql`: `actor_profile_details` (bio/logo/portada, 1:1 con cualquier actor, auto-creada por trigger); `actor_managers` (administración operativa delegable, distinta de `businesses.owner_id` — solo el propietario legal o un admin de plataforma agregan/revocan); `actor_media` (galería preparada); `actor_search_index` (búsqueda básica con `tsvector` nativo, sin motor externo). `public.actor_editable_by_current_user()` compone pertenencia legal + administración operativa — deliberadamente no usada en `verifications`.

### Cuatro ajustes de producto incorporados
"Centro del Negocio" (Bloque C futuro, estructura ya preparada colgando de `actor_id`); estructura multimedia preparada (`actor_media`, interfaz pendiente); búsqueda básica (`tsvector`, extensible en Bloque B con catálogo); colecciones flexibles de catálogo (aplica al Bloque B).

### Incidencia encontrada y corregida antes del commit
El trigger de auto-creación no copiaba `businesses.description` al `bio` de negocios nuevos (a diferencia del backfill, que sí lo hacía para los existentes) — detectado probando la creación de un negocio posterior a la migración, corregido antes de cualquier commit.

### Verificado
- Las 23 migraciones aplicables contra Postgres 16 real.
- Auto-creación con siembra correcta de `bio` tras la corrección.
- Búsqueda básica funcionando (encuentra por nombre/bio/categoría, se actualiza en cada edición).
- Administración operativa real: un administrador no propietario editó el perfil con éxito.
- Escalada de permisos rechazada (un administrador no puede agregar a otro); terceros ajenos bloqueados; revocación real con motivo verificada.
- Guard de tipo de actor (solo negocio/organizador pueden tener administradores).
- Aislamiento de la Fase 2 confirmado explícitamente: un administrador operativo activo no pudo insertar en `verifications` (rechazado por RLS, no por falta de permiso).
- Reversión completa sin errores; build y lint sin cambios; `src/` no tocado.

### Nota
`businesses.description` se verificó en el código real: se escribe una sola vez al registrar el negocio, sin ningún editor posterior — `actor_profile_details.bio` es la fuente de verdad desde ahora, la columna antigua queda como histórica hasta que una fase posterior confirme que puede retirarse.

## 2026-07-18 — FASE 2 CERRADA: verificación robusta y roles granulares

Cierre formal de la Fase 2 completa del `MASTERPLAN.md`, tras la aprobación de los dos bloques (esquema de verificación/roles, ciclo de vida/vigencia/renovación). Checkpoint de Git: tag `checkpoint-fase2-verificacion-roles`.

Completa en arquitectura, migraciones (`0020`-`0022`), RLS, lógica PostgreSQL, documentación y pruebas locales contra Postgres 16 real. **No lista para producción** hasta validar contra un proyecto Supabase real: `process-verification-lifecycle`, bucket y políticas de Storage reales, `CRON_SECRET`/variables de entorno, tarea programada de vencimiento, generación de URLs firmadas, flujo completo de carga/revisión de evidencias, limpieza de evidencias, interfaz de solicitud/revisión, y regresión extremo a extremo en un entorno desplegado — registrado como deuda técnica obligatoria en `PROJECT.md`.

Durante el Bloque B se encontraron y corrigieron tres defectos reales antes de cualquier commit, el más importante un defecto de pertenencia de Actor heredado del Bloque A — ninguno llegó a producción.

## 2026-07-17 — Fase 2, Bloque B: ciclo de vida, vigencia y renovación de verificaciones

Segundo bloque de la Fase 2 del `MASTERPLAN.md`. Periodo de gracia de 30 días (coherencia con el Bloque 5); bucket privado de evidencias construido en este bloque, un único archivo por solicitud.

### Agregado
- `supabase/migrations/0021_fase2_bloqueB_ciclo_vida_verificaciones.sql`: `public.actor_belongs_to_current_user(actor_id)` (corrige la pertenencia de Actor para negocio/organizador, ver más abajo); columnas nuevas en `verifications` (`revoked_by`/`revoked_at`, snapshots automáticos al aprobar); `verification_status_log`/`verification_notices`/`evidence_access_log`; trigger de protección de campos con guarda anti-autoaprobación incondicional; `vencido` solo alcanzable por el proceso automatizado.
- `supabase/migrations/0022_fase2_bloqueB_storage_evidencias.sql`: bucket privado `verification_evidence` (PDF/JPG/PNG, 10MB), un archivo por solicitud vía ruta fija. No verificable contra Postgres local (depende de `storage`, mismo motivo que `0002_storage.sql`).
- `supabase/functions/process-verification-lifecycle`: avisos (reutilizando `send-push`) + vencimiento automático, protegida con `CRON_SECRET`, independiente de `process-account-deletions`.

### Tres defectos encontrados y corregidos durante la implementación (antes de cualquier commit)
1. **Pertenencia de Actor rota para negocio/organizador** (defecto del Bloque A): las políticas comparaban solo `actors.profile_id`, que siempre es `NULL` para un actor negocio/organizador — bloqueaba el caso central de este bloque. Se detuvo la implementación y se pidió aprobación explícita antes de corregir, por tratarse de políticas ya aprobadas y enviadas. Corregido con una función reutilizable que cubre los cuatro casos (persona, negocio/organizador, sistema, negocio sin propietario).
2. **Auto-aprobación posible para un admin dueño de un negocio**: al corregir el punto 1, se descubrió que en PostgreSQL las cláusulas `WITH CHECK` de todas las políticas permisivas de `UPDATE` se combinan con `OR` sin importar cuál política autorizó — el `WITH CHECK` laxo de la política de administradores podía rescatar una actualización entrada por la política del propio actor. Corregido con una guarda incondicional en el trigger, inmune a la interacción entre políticas.
3. **Auditoría de revocación atribuida al admin equivocado**: el trigger de auditoría tomaba `reviewed_by` (de la aprobación original) en vez de `revoked_by` (quien realmente revocó). Corregido para usar el campo correcto según el tipo de transición.

### Verificado
- Las 21 migraciones aplicables (`0001`-`0021`) contra Postgres 16 real, con un administrador que también es dueño de un negocio (deliberado, para probar el caso crítico).
- Los seis escenarios de pertenencia pedidos, todos correctos tras la corrección.
- Ciclo completo real: solicitud, evidencia, revisión, aprobación con snapshot automático.
- Auto-aprobación rechazada en el caso crítico (admin dueño de su propio negocio); un segundo admin sí pudo aprobar.
- `vencido` inalcanzable por RLS normal; `expires_at` protegido de cambios aislados.
- Periodo de gracia de 30 días probado con dos casos reales (dentro y fuera de gracia), simulando el rol de servicio.
- Auditoría exacta tras la corrección del defecto 3.
- `verification_notices` idempotente; reversión completa sin errores; build/lint sin cambios, `src/` no tocado.

## 2026-07-17 — Fase 2, Bloque A: esquema de verificación y roles granulares

Primer bloque de la Fase 2 del `MASTERPLAN.md`. Aditivo y deliberadamente invisible: `profiles.is_admin`/`public.is_admin()` permanecen exactamente iguales, ninguna política RLS existente se toca.

### Agregado
- `supabase/migrations/0020_fase2_bloqueA_verificacion_roles.sql`: `roles` (catálogo, agregar un rol nuevo es un `INSERT`), `actor_roles` (asignación many-to-many sobre `Actor`, nunca se borra una fila — se revoca con `revoked_at`), `verifications` (asociada a `Actor`, no a `businesses`; evidencia solo referenciada, nunca almacenada en la tabla), `role_audit_log` (poblada únicamente por trigger). Trigger que impide asignar un rol o verificación a un actor tipo `sistema`. RLS que impide que cualquiera —incluido un administrador real— apruebe su propia verificación. Backfill: administradores actuales → rol `administrador`; negocios aprobados → verificación `aprobado` con un año de vigencia (`origin='migracion'` en ambos casos).
- `AI_PHILOSOPHY.md`: la Guía IA distingue tres estados de confianza (verificado/vencido/no verificado, nunca el criterio principal de recomendación, solo desempate); documentada la visión futura de cuentas oficiales institucionales vía verificación de Actor, sin privilegios administrativos adicionales.

### Verificado
- Las 20 migraciones (`0001`-`0020`) contra Postgres 16 real, con 2 administradores, 2 usuarios normales, 1 negocio aprobado y 1 pendiente.
- Reconciliación exacta del backfill; tablas existentes completamente intactas.
- Escalada de privilegios rechazada (auto-asignación y asignación a terceros por un no-admin); asignación y revocación reales por un admin, con auditoría automática y motivo conservado.
- Ningún actor tipo `sistema` puede recibir rol ni verificación.
- Auto-aprobación de verificación rechazada incluso para un administrador real sobre su propia verificación; un segundo administrador sí pudo aprobarla.
- `role_audit_log` visible solo para administradores.
- Reversión completa ejecutada de verdad, sin errores (a diferencia del Bloque 5, no toca ninguna restricción de tabla existente).
- Build y lint sin cambios; `git status` confirma que `src/` no fue tocado.

### Nota
Análisis técnico previo completo (comparación de tres modelos de roles, matriz de permisos por módulo, justificación de Actor sobre Business para verificación, alcance de Editor/Curador vs. Moderador) presentado y aprobado antes de escribir la migración — incluida la decisión de no crear un rol "Partner"/"Institución" nuevo, resuelto en cambio con un futuro valor de `verification_type`.

## 2026-07-17 — FASE 1 CERRADA: ecosistema social, modelo de datos fundacional

Cierre formal de la Fase 1 completa del `MASTERPLAN.md`, tras la aprobación de los cinco bloques (esquema, identidad, contenido, interacciones y territorio, privacidad). Checkpoint de Git: tag `checkpoint-fase1-ecosistema-social`.

Completa en arquitectura, migraciones (`0015`-`0019`), restricciones, RLS, lógica PostgreSQL, documentación y pruebas locales contra Postgres 16 real. **No lista para producción** hasta validar contra un proyecto Supabase real: `export-user-data`, `process-account-deletions`, autenticación JWT real, `auth.admin.deleteUser`, variables de entorno/secretos, permisos de las Edge Functions, ejecución programada del periodo de gracia, eliminación real de archivos en Storage, exportación completa de datos reales, y el flujo extremo a extremo de solicitud/cancelación/eliminación — registrado como deuda técnica obligatoria, no como mejora opcional, en `PROJECT.md`.

Queda documentado expresamente: una eliminación definitiva es irreversible; no existe restauración completa tras anonimizar/borrar datos personales; la futura interfaz de eliminación debe comunicar esto al usuario; los QR deberán invalidarse cuando esa entidad exista (Fase 9); los archivos de Storage requieren un flujo de borrado explícito antes de producción.

## 2026-07-17 — Fase 1, Bloque 5: privacidad (consentimiento, exportación y eliminación de cuenta)

Quinto y último bloque de la Fase 1 del `MASTERPLAN.md`. A diferencia de los Bloques 1-4, introduce comportamiento real — es su propósito explícito: activar el mecanismo de `consent_records`, que se adelantó vacío desde el Bloque 1.

### Agregado
- `supabase/migrations/0019_bloque5_privacidad.sql`: `consent_records` gana consentimiento versionado (`consent_key`/`document_version`, retirable sin borrar historial) y pierde su FK hacia `auth.users` para sobrevivir a la eliminación de la cuenta; `data_requests` (tabla nueva) como flujo de trabajo independiente del log de consentimiento; `questions`/`answers`/`statuses`/`event_comments.author_id` pasan de `cascade` a `set null` (anonimización, el contenido colaborativo sobrevive); `businesses.owner_id` pasa a `set null` con un trigger que fuerza `status = 'sin_propietario'` cuando el dueño desaparece, sin bloquear la eliminación ni borrar el negocio.
- `supabase/functions/export-user-data`: el usuario autenticado obtiene sus propios datos en JSON, derivando su identidad del token de sesión — nunca de un `userId` de parámetro.
- `supabase/functions/process-account-deletions`: procesa (protegida por un secreto compartido) las solicitudes de eliminación cuyo periodo de gracia de 30 días venció, invocando `auth.admin.deleteUser`.
- `AI_PHILOSOPHY.md`: nuevo Principio no negociable 11 — la Guía IA nunca comparte información privada entre usuarios ni usa una conversación privada de una persona para responderle a otra.

### Hallazgos críticos encontrados en el análisis previo (resueltos antes de implementar)
1. `answers.question_id` cascadeaba desde `questions` — borrar la cuenta de quien preguntó habría borrado también las respuestas de terceros.
2. `consent_records.user_id` cascadeaba desde `auth.users` — habría destruido la evidencia de consentimiento/eliminación justo cuando más se necesita.

### Decisiones de producto (cuatro bifurcaciones aprobadas)
Periodo de gracia de 30 días cancelable; anonimizar autores de contenido colaborativo en vez de borrarlo; conservar `consent_records`/`data_requests` sin cascada; negocios sin propietaria pasan a `sin_propietario` (no se bloquea la eliminación, no se borra el negocio, un admin reasigna después).

### Verificado
- Postgres 16 real, las 19 migraciones en orden, con datos de prueba reales (una pregunta con respuesta ajena, un negocio aprobado, tres usuarios).
- Consentimiento versionado con retiro: historial completo conservado, estado vigente = fila más reciente.
- RLS de `data_requests` con roles de bajo privilegio: cada usuario ve y cancela solo lo suyo.
- Eliminación definitiva simulada de verdad (borrado real del `auth.users` de prueba): perfil/actor cascadearon; el negocio quedó `sin_propietario` con `owner_id` NULL (trigger verificado); la pregunta sobrevivió anonimizada; la respuesta ajena sobrevivió intacta (Hallazgo 1 resuelto); `consent_records`/`data_requests` sobrevivieron completos (Hallazgo 2 resuelto).
- RLS del negocio huérfano: invisible para un usuario normal, visible y reasignable por un admin.
- Reversión probada en dos escenarios: limpia sin errores contra una base sin eliminaciones reales; falla exactamente donde se esperaba (`author_id` ya no admite `not null`) contra un estado que ya procesó una eliminación real — límite genuino, no un defecto.
- Build y lint sin cambios; `git status` confirma que `src/` no fue tocado.

### Nota de verificación honesta
Las dos Edge Functions no pudieron probarse contra un proyecto Supabase real en este entorno (sin proyecto desplegado ni API de administración de Auth disponible) — a diferencia de la migración SQL, que sí tiene el mismo nivel de prueba real que los Bloques 1-4. Recomendado verificarlas end-to-end antes de producción.

### Deuda técnica
Sin interfaz de usuario todavía para consentimiento/exportación/eliminación desde la app; sin mecanismo de disparo temporal (`pg_cron` u otro) configurado para `process-account-deletions`; sin transferencia de propiedad de negocio de autoservicio; invalidación de QR documentada como requisito para cuando esa entidad exista (no existe hoy); rectificación de datos fuera de alcance.

## 2026-07-17 — Fase 1, Bloque 4: interacciones y territorio (post_likes/saved_places/saved_events/follows → interactions, places.area → zones)

Cuarto bloque de la Fase 1 del `MASTERPLAN.md`. Precedido por un análisis previo formal (aprobado antes de escribir código) que investigó los lectores/escritores reales del frontend y encontró un hallazgo de privacidad relevante, resuelto antes de implementar.

### Agregado
- `supabase/migrations/0018_bloque4_interacciones_territorio.sql` (nuevo): backfill de `post_likes` (→ `me_gusta`), `saved_places`/`saved_events` (→ `guardado`) y `follows` (→ `seguimiento`, hacia el Actor del perfil seguido) en `interactions`; `places.zone_id` (columna nueva) poblada únicamente donde `places.area` coincide exactamente con una `zones.name` existente. Reemplaza la política de lectura pública de `interactions` por una que excluye el tipo `guardado`.

### Decisión de privacidad
Se encontró que la política pública heredada de `interactions` (Bloque 1) habría hecho públicos los guardados al migrarlos, cuando `saved_places`/`saved_events` son privados hoy. Se presentó como bifurcación y se aprobó: los guardados son visibles solo para su dueño o para un administrador (uso justificado caso por caso, sin tabla de auditoría en este bloque — ver nota de alcance en `PROJECT.md`).

### Verificado
- Las 18 migraciones (`0001`-`0018`) ejecutadas contra un Postgres 16 real, con datos de prueba incluyendo un lugar con zona deliberadamente no coincidente (caso límite).
- Reconciliación exacta de conteos (10 interacciones) y comparación campo por campo (`diff`) contra las tablas de origen para los cuatro mapeos.
- `places.zone_id`: 10/11 lugares resueltos; el caso no coincidente quedó en NULL, sin corrección silenciosa.
- `events.likes_count` coincide exactamente con el conteo real en `interactions` para los 5 eventos.
- Idempotencia de la lógica de datos confirmada (reejecutar inserta/actualiza 0 filas).
- RLS de privacidad de "guardado" probada con roles de bajo privilegio reales: cada usuario ve solo lo suyo, las interacciones públicas siguen visibles para todos, y un admin ve todos los guardados.
- Un actor no puede crear ni borrar interacciones de otro actor (verificado con intentos reales rechazados por RLS).
- Tablas de origen completamente intactas (conteos y `diff` idénticos antes/después).
- Estrategia de reversión ejecutada de verdad, restaura el estado exacto previo.
- Build y lint del frontend sin cambios; `git status` confirma que solo se agregó el archivo de migración.

### Nota
Queda como condición obligatoria (impuesta antes de este bloque y ya extendida por simetría a `event_details`): ninguna parte de la aplicación puede empezar a leer `interactions` o `places.zone_id` sin una fase separada de reconciliación final, cambio controlado de fuente de verdad, actualización del frontend, pruebas de regresión, periodo de convivencia, reversión disponible y retiro posterior de las estructuras antiguas.

## 2026-07-17 — Fase 1, Bloque 3: contenido (separa datos de eventos hacia event_details)

Tercer bloque de la Fase 1 del `MASTERPLAN.md`: primer caso real de datos fluyendo por el patrón "núcleo genérico + tabla de detalle" de Publicación. Sin cambio de comportamiento visible para el usuario.

### Agregado
- `supabase/migrations/0017_bloque3_contenido.sql` (nuevo): copia `start_at`/`end_at`/`price`/`ticket_url`/`organizer` de cada `event` existente hacia `event_details` (backfill, protegido con `where not exists`). `events` conserva todas sus columnas intactas — separación deliberadamente aditiva, no física.

### Verificado
- Las 17 migraciones (`0001`-`0017`) ejecutadas contra un Postgres 16 real, con 6 eventos de prueba incluyendo el caso límite `end_at IS NULL` + `organizer` distinto de nulo.
- Copia exacta campo por campo, verificada con `diff` contra una foto de `events` capturada antes de migrar — coincidencia total en las 6 filas.
- `events` queda byte a byte idéntica antes/después (mismo `diff`, cero diferencias).
- Idempotencia confirmada: reaplicar la migración inserta 0 filas nuevas.
- RLS de `event_details` sigue cascadeando correctamente la visibilidad de `events` (probado con un rol de bajo privilegio real): el detalle de un evento en `borrador` queda oculto, igual que el propio evento.
- Estrategia de reversión ejecutada de verdad: `delete from event_details` restaura la tabla vacía sin tocar `events`.
- Build y lint del frontend sin cambios; `git status` confirma que solo se agregó el archivo de migración.

### Nota
Dos bifurcaciones arquitectónicas se presentaron y resolvieron antes de escribir la migración (detalle completo en `PROJECT.md`): (1) separación aditiva vs. física — se optó por aditiva, para no romper el código de la aplicación que hoy lee/escribe directamente `events`; (2) fotografía puntual vs. sincronización en vivo — se optó por fotografía puntual, igual criterio que `actors.display_name` en el Bloque 2, para no agregar costo de escritura permanente a la tabla de mayor tráfico del sistema por sincronizar un dato que nada lee todavía. Ambas quedan como deuda técnica documentada (no urgente) a resolver el día que una fase futura conecte código de verdad a `event_details`.

## 2026-07-17 — Fase 1, Bloque 2: identidad (vincula profiles/businesses con actors)

Segundo bloque de la Fase 1 del `MASTERPLAN.md`, con alcance estrictamente acotado a vincular identidad — sin tocar events, interacciones, zonas, privacidad ni la interfaz.

### Agregado
- `supabase/migrations/0016_bloque2_identidad.sql` (nuevo): backfill de un actor `persona` por cada `profile` existente y uno `negocio` por cada `business` existente; dos triggers `security definer` (`on_profile_created_actor`, `on_business_created_actor`) que crean el actor correspondiente para cada perfil/negocio nuevo de ahora en adelante, con el mismo patrón que `handle_new_user`.

### Verificado
- Las 16 migraciones (`0001`-`0016`) ejecutadas contra un Postgres 16 real, con datos de prueba incluyendo el caso límite de un perfil sin `username`.
- Conteos idénticos antes/después en `profiles` y `businesses` — cero filas tocadas.
- Reconciliación exacta: cero perfiles/negocios sin actor, cero con más de uno.
- Los triggers probados con inserciones reales nuevas (un signup simulado y un registro de negocio bajo RLS real con un rol de bajo privilegio, no como superusuario), confirmando que funcionan incluso sin permiso directo de ese rol sobre `actors`.
- Estrategia de reversión ejecutada de verdad (no solo descrita): `drop trigger`/`drop function` + borrar las filas `persona`/`negocio` de `actors` restaura exactamente el estado previo al bloque.
- Build y lint del frontend sin cambios.

### Nota
Decisión de alcance documentada con transparencia en `PROJECT.md`: se agregaron los dos triggers (además del backfill pedido explícitamente) para que "una correspondencia verificable" sea una garantía permanente, no solo válida en el instante de la migración — señalado como una interpretación, no como algo pedido literalmente palabra por palabra. `actors.display_name` es una fotografía del momento de creación, sin sincronización posterior — limitación conocida y documentada, sin efecto visible hoy porque ningún código de la aplicación lee todavía esa columna.

## 2026-07-17 — Fase 1, Bloque 1: esquema fundacional (primera implementación del ecosistema social)

Primer bloque de código real de la Fase 1 del `MASTERPLAN.md`, tras la aprobación de la propuesta definitiva de ejecución. Puramente estructural — invisible para el usuario final.

### Agregado
- `supabase/migrations/0015_bloque1_esquema_fundacional.sql` (nuevo): seis tablas nuevas, sin tocar ninguna tabla existente — `cities` (con "Cuenca"), `zones` (hija de `cities`, con "Centro Histórico" y "Turi" — las únicas zonas reales en uso hoy), `actors` (tipos persona/negocio/organizador/sistema, con los actores de sistema "Guía IA" y "Ahorita Editorial" ya creados, y una restricción que impide combinaciones inválidas de tipo/referencia), `interactions` (polimórfica, catálogo me_gusta/quiero_ir/ya_fui/guardado/seguimiento/compartir), `event_details` (primer caso del patrón núcleo+detalle, vacía), `consent_records` (línea base de privacidad, vacía).

### Verificado
- Las 14 migraciones existentes (`0001`-`0014`) más la nueva `0015` se ejecutaron contra un Postgres 16 real (con un stub del esquema `auth` de Supabase), no solo se revisaron visualmente.
- Conteos idénticos antes/después en todas las tablas existentes (cero filas perdidas o alteradas).
- Restricciones de `actors` verificadas con datos reales (rechazan persona+business_id y sistema+profile_id).
- RLS de `interactions`, `event_details`, `cities` y `consent_records` verificada funcionalmente con dos usuarios simulados y un rol de bajo privilegio (nunca como superusuario) — no solo revisión de las políticas escritas.
- Build y lint del frontend sin cambios — no se tocó ninguna línea de código de la aplicación en este bloque.

### Nota
Ninguna de las tablas nuevas está todavía conectada a la aplicación ni a los datos existentes — esa vinculación es el Bloque 2 (identidad), pendiente de aprobación del Product Owner antes de empezar, según lo acordado.

## 2026-07-17 — Revisión arquitectónica previa a la Fase 1: cinco decisiones + visión de motor de experiencias

Antes de autorizar la implementación, el Product Owner pidió analizar cinco puntos de diseño de largo plazo (Actor, Publicación, Interacción, Ciudad, Guía IA) y aprobó las cinco recomendaciones. Se actualiza la documentación fundacional para incorporarlas.

### Cambiado
- `ARCHITECTURE.md` (§9-11, §36): Actor gana un tercer tipo, **Sistema/Institucional**, con las identidades "Guía IA" y "Ahorita Editorial"; Publicación se formaliza con el patrón **núcleo genérico + tabla de detalle por subtipo** (Carrusel queda explícitamente excluido como subtipo); Interacción incorpora **Compartir** y una preparación para respuestas anidadas, dejando **Reportar** fuera, como su propia entidad de moderación; se agrega la entidad **Zona** como hija de Ciudad (un solo nivel, con referencia opcional a una zona padre para crecer sin comprometerse a más niveles todavía); se documenta la visión de la Guía IA como Actor y como futuro motor de experiencias.
- `AI_PHILOSOPHY.md`: nueva sección 16, "La Guía IA como Actor del sistema y motor de experiencias (visión futura, no implementada)" — deja constancia de que la Guía IA deberá evolucionar hacia combinar lugares, eventos, promociones y servicios en planes completos, sin comprometer todavía ninguna fase ni plazo. La sección de cierre "La visión definitiva" pasa a ser la 17.
- `MASTERPLAN.md`: registro de decisiones ampliado con los puntos 12-16; Fase 1 rediseñada para incluir Actor tipo Sistema (con sus dos filas), el patrón núcleo+detalle aplicado primero a Eventos (`event_details`), la entidad Zona (con migración del campo de texto libre `places.area`), y el tipo de interacción Compartir; Fase 4 y Fase 5B actualizadas para reflejar que heredan estas piezas de la Fase 1 en vez de crearlas; matriz de dependencias y sección de v2.0 actualizadas.

### Nota
Ningún archivo de código ni migración real se tocó — puramente planificación y arquitectura, tal como se pidió explícitamente. La implementación de la Fase 1 (Bloque 1) espera la aprobación final de la propuesta de ejecución presentada.

## 2026-07-17 — Filosofía y comportamiento de la Guía IA (AI_PHILOSOPHY.md)

Tras aprobar el MASTERPLAN, el usuario pidió definir "el corazón del proyecto" antes de autorizar la Fase 1: un documento completamente independiente, autoridad absoluta sobre toda decisión relacionada con la IA, puramente de comportamiento de producto — sin modelos, APIs, LLMs ni arquitectura técnica.

### Agregado
- `AI_PHILOSOPHY.md` (nuevo): filosofía completa, personalidad, principios no negociables, qué puede/nunca debe hacer, cómo razona, decide, prioriza información, maneja incertidumbre, aprende del usuario y adapta sus respuestas; cómo aprovecha toda la información del ecosistema; cinco casos de razonamiento trabajados a partir de los ejemplos del usuario ("tengo 10 dólares", "estoy aburrido", "estoy con mi novia", "la una de la madrugada", "nunca he venido a Cuenca"); un recorrido fase por fase de `MASTERPLAN.md` explicando qué capacidad de razonamiento nueva le aporta cada una a la Guía IA (presentada explícitamente como el hilo conductor del proyecto, no una fase más); y el capítulo de cierre "La visión definitiva de la Guía IA".

### Cambiado
- `README.md` y `PROJECT.md`: enlazan `AI_PHILOSOPHY.md` como autoridad absoluta sobre IA, al mismo nivel que `ARCHITECTURE.md` sobre el resto del ecosistema.

### Nota
Ningún archivo de código se tocó — exclusivamente filosofía de producto, sin mención de modelos, proveedores ni implementación técnica, tal como se pidió explícitamente.

## 2026-07-17 — Plan Maestro de Desarrollo (MASTERPLAN.md)

El usuario aprobó `ARCHITECTURE.md` como base oficial y pidió convertirlo en un plan de desarrollo accionable, actuando como CTO/Arquitecto Principal/Product Manager — sin código, sin migraciones, sin componentes, solo planificación.

### Agregado
- `MASTERPLAN.md` (nuevo): plan maestro con 13 fases de desarrollo (más la Fase 0 de línea base ya completada), cada una con objetivo, problema que resuelve, módulos, dependencias, bloqueos, tablas nuevas, entidades nuevas, APIs externas, migraciones, riesgos, pruebas necesarias y criterio de terminado. Incluye una matriz de dependencias de todos los módulos importantes (mismo formato que el ejemplo de la Guía IA entregado por el usuario), y un análisis explícito de qué puede desarrollarse en paralelo, qué nunca debe empezar antes de otra cosa, y qué puede esperar a una v2.0.
- Reordenamiento justificado respecto a las 8 fases (A-H) esbozadas en `ARCHITECTURE.md` §60: se dividen en 13 fases más granulares (cada una con un criterio de terminado verificable en semanas, no meses) y se separa la integración de Azu Taxi de la fase de comercio, porque no comparte dependencias reales con el manejo de pagos/reservas y no debería heredar ese riesgo regulatorio.

### Cambiado
- `ROADMAP.md`: la sección "próxima fase" deja de listar un alcance social suelto y pasa a apuntar a `MASTERPLAN.md` como la única hoja de ruta oficial de desarrollo, con el resumen de las 13 fases.

### Nota
Ningún archivo de código (`src/`, `supabase/migrations/`) se tocó en esta entrada — exclusivamente planificación, tal como se pidió explícitamente.

## 2026-07-17 — Documento fundacional de arquitectura del ecosistema

Cambio de enfoque explícito del usuario: de "desarrollador de pantallas" a "Arquitecto Principal del producto". Se solicitó un documento de visión y arquitectura de 60 puntos para todo el ecosistema (identidad, roles, módulos, modelo conceptual de datos, flujos, descubrimiento, IA, QR, comercio futuro, riesgos y roadmap), sin ningún código, componente ni implementación.

### Agregado
- `ARCHITECTURE.md` (nuevo): documento fundacional. Cubre los 60 puntos solicitados organizados en 13 partes, más una parte final con módulos adicionales propuestos y justificados (onboarding/alianzas institucionales, soporte, internacionalización, cumplimiento legal, feature flags, observabilidad, preparación multi-ciudad) que no estaban en la lista original del usuario. Señala explícitamente varias recomendaciones de replanteo sobre lo ya construido — la más importante: generalizar `events`/`places`-como-contenido, y las tablas paralelas de likes/guardados/comentarios, bajo abstracciones únicas de "Actor", "Publicación" e "Interacción", siguiendo el patrón `target_type`/`target_id` que `post_likes` ya demuestra parcialmente.

### Cambiado
- `README.md`: la descripción del proyecto pasa de "red social hiperlocal" a "ecosistema urbano inteligente", y ahora enlaza `ARCHITECTURE.md` como primer documento a leer.
- `PROJECT.md`: nueva nota al inicio señalando que `ARCHITECTURE.md` es la autoridad de visión de producto; `PROJECT.md` es el registro de implementación y debe ajustarse a `ARCHITECTURE.md`, no al revés.

### Nota
Ningún archivo de código (`src/`, `supabase/migrations/`) se tocó en esta entrada — es exclusivamente documentación, tal como se pidió explícitamente ("no quiero que implementes absolutamente nada").

## 2026-07-17 — Fase de administración de eventos y lugares: cerrada

El usuario aprobó la fase completa (CRUD + ajustes finales) y pidió cerrarla formalmente antes de empezar el sistema social. Sin cambios de código en este punto — solo documentación y un checkpoint de Git.

### Agregado
- `ROADMAP.md` (nuevo): mapa de fases completas y la próxima fase (sistema social), explícitamente marcada como no iniciada hasta recibir arquitectura y requisitos definitivos.
- `PROJECT.md`: sección "✅ FASE CERRADA — Administración de eventos y lugares" con checklist de funcionalidades completas, limitaciones conocidas, y desglose de qué datos son reales/de prueba/fallback.
- Tag de Git `checkpoint-admin-eventos-lugares` (commit `abf12ed`, rama `claude/esto-tengo-2wzbnj`) — punto estable para volver si una fase futura necesita revertirse.

## 2026-07-17 — Cierre de la fase administrativa: ajustes finales

Siete ajustes puntuales pedidos tras aprobar la fase de administración completa de eventos y lugares, antes de pasar a publicaciones sociales.

### Agregado
- `src/hooks/useUnsavedChangesGuard.js`: confirma antes de salir si hay cambios sin guardar — cubre cerrar/recargar pestaña (`beforeunload`) y el botón atrás del navegador (`popstate` interceptado).
- `src/components/ui/SaveStatusPill.jsx`: indicador de estado de guardado (sin guardar / guardando / guardado / error) en el encabezado de cada editor.
- `src/components/ui/ActionsMenu.jsx`: menú de acciones (⋮) por elemento en los listados — editar, duplicar, ocultar/publicar, eliminar — en lugar de botones sueltos.
- `supabase/migrations/0014_updated_at_and_creator.sql`: `updated_at` en `events`/`places` (mantenido por trigger `set_updated_at`), y `created_by` en `places` (`events` ya lo tenía).
- Búsqueda por dirección/nombre en `LocationPicker` (Nominatim/OpenStreetMap, sesgada a Cuenca), con resultados desplegables y desplazamiento animado del mapa al elegir uno.
- `CHANGELOG.md` (este archivo).

### Cambiado
- `AdminEventEditorPage`/`AdminPlaceEditorPage`: rastrean un snapshot del formulario para detectar cambios sin guardar; el botón "volver" pide confirmación si hay cambios pendientes; `handleSave` reporta éxito/error visualmente en vez de fallar en silencio.
- `AdminEventsListPage`/`AdminPlacesListPage`: cada fila ahora muestra "actualizado hace…" y el autor (cuando existe); las acciones se agrupan en `ActionsMenu`; "eliminar" pasó a pedir confirmación explícita también desde el listado (antes solo existía esa confirmación dentro del editor).
- `lib/events.js#listAllEventsForAdmin` / `lib/places.js#listAllPlacesForAdmin`: hacen join con `profiles` vía `created_by` para traer el nombre de usuario del creador.
- `src/index.css`: nueva animación `ahorita-spin` para el ícono de "guardando…".

### Verificado
- Build y lint limpios.
- Flujo E2E con Playwright + Supabase mockeado: cambios sin guardar detectados correctamente, confirmación al intentar salir, guardado exitoso (pill "Guardado"), guardado fallido simulado (pill "Error al guardar" sin ocultarse detrás de "cambios sin guardar"), menú de acciones, y búsqueda de ubicación.

## 2026-07-17 — Administración completa de eventos y lugares

- Migración `0013_admin_lifecycle.sql`: `events` gana `status`/`organizer`/`publish_at`/`expires_at`; `places` gana `status` + políticas RLS de `update`/`delete` que no existían; el `select` público de ambas tablas pasa a respetar `status = 'publicado' OR is_admin()`.
- Nuevas páginas `/admin/eventos` y `/admin/lugares` (listado con búsqueda/filtros) y sus editores (`AdminEventEditorPage`/`AdminPlaceEditorPage`), organizados en 7 secciones progresivas: información principal, fotografías, fecha y disponibilidad (horario en lugares), ubicación, entradas y contacto, publicación y visibilidad, vista previa (con `FeedCard`/`PlaceCard` reales).
- Componentes nuevos: `ConfirmationModal`, `MediaUploader`, `LocationPicker`, `FormSection`.
- `AdminPage.jsx` simplificado a dashboard; se retiran los formularios inline de creación, superados por los editores nuevos.

## 2026-07-17 — Coherencia semántica de fotografía + curaduría manual real

- `CategoryFallback`/`ImageWithFallback`: fallback editorial de marca por categoría cuando no hay foto real o falla la carga — nunca una foto genérica ni temáticamente incoherente.
- `events.editor_pick`: "Selección del editor" pasa de un heurístico automático a una fuente de verdad manual real, marcable desde el panel.

## Fases anteriores (resumen)

Ver `PROJECT.md` para el detalle completo de cada fase. En orden:

1. Proyecto base, sistema de diseño (Fraunces + Inter), Supabase, login/registro.
2. Cuadrícula de lugares + muro de lugar (Bottom Sheet).
3. Stories por canal, tarjeta editorial, filtro de canal.
4. Guía IA vía Claude (Edge Function de Supabase).
5. Perfil de usuario, registro de negocios, panel de admin simple, PWA.
6. Rediseño premium del feed ("Inicio" pasa a ser solo eventos): mapa Leaflet + CARTO, "Cómo llegar", notificaciones push reales, sistema de diseño editorial (tipografía, ritmo del feed, duotono de fotos), Guía IA como cápsula, "Selección del editor".
