# AHORITA — BETA READINESS CHECKLIST

**Subordinada a `ETAPA_PRODUCTO_VIVO.md`.** No es un documento canónico, no tiene autoridad conceptual propia, no introduce ningún contrato arquitectónico ni ninguna filosofía nueva. Es una **checklist operativa viva**: una lista de verificación con criterio objetivo por ítem, pensada para marcarse conforme avanza la preparación real de Ahorita para recibir personas y negocios reales en Cuenca.

**Creada el 2026-07-25**, tras el cierre de la Fase 7 y la adopción de `ETAPA_PRODUCTO_VIVO.md`. No ocupa ningún número de fase de `MASTERPLAN.md` — ese documento ya la referencia en su sección "Etapa — El Producto Vivo (entre la Fase 7 y la Fase 8)" a través de la autoridad de `ETAPA_PRODUCTO_VIVO.md`, sin necesidad de mencionar este archivo directamente.

**Cómo usarla.** Cada ítem tiene un objetivo, un criterio objetivo de verificación, la evidencia que debe conservarse, y un estado. El estado inicial de todo ítem es **Pendiente**; se actualiza a **En progreso** o **Hecho** solo cuando la evidencia exigida exista realmente — nunca por intención o por trabajo parcial. Ningún ítem se marca "Hecho" sin su evidencia correspondiente conservada (capturas, registros, logs, documentos reales).

**Qué no es.** No reemplaza ni compite con ningún documento canónico. No introduce funcionalidad nueva — cada ítem es, o una verificación de algo ya construido, o una configuración operativa mínima ya implícita en decisiones previas del proyecto. Si en el camino de completarla surge una decisión conceptual nueva (por ejemplo, qué hacer si el costo real de la Guía IA excede el presupuesto aceptado), esa decisión se documenta en `PROJECT.md` como lo que es — una decisión puntual —, no se disuelve dentro de esta checklist ni la convierte en un documento distinto.

---

## A. Condiciones bloqueantes antes de admitir a la primera persona real

| # | Objetivo | Criterio objetivo | Evidencia a conservar | Estado |
|---|---|---|---|---|
| A1 | Infraestructura Supabase de producción operativa | Las 46 migraciones aplicadas sin error, en orden, contra el proyecto real; cada tabla nueva responde a una consulta real; adicionalmente, para el Motor Editorial (migración `0040`, corregida antes de este despliegue — ver nota bajo esta tabla): las 4 funciones públicas confirmadas por catálogo del sistema, y las 3 selecciones editoriales legacy verificadas (conteo exacto, `target_type`, `decided_by`, sin duplicados, idempotencia de `backfill_editorial_selections.sql` confirmada por segunda ejecución) | `db_push_output.txt` + `migration_list_post_push.txt` + resultados conservados de las 7 consultas de verificación del Motor Editorial | Hecho |
| A2 | Frontend desplegado, PWA validada | Instalable sobre HTTPS; actualización a versión nueva sin romper sesión; invalidación de caché correcta; recuperación tras pérdida de conexión; cierre de sesión sin datos privados residuales visibles; probado en un Android real y un navegador de escritorio | Capturas/video del recorrido en ambos dispositivos | Pendiente |
| A3 | Secretos de producción propios y separados de desarrollo | La app funciona de punta a punta usando solo credenciales de producción, desde un dispositivo fuera de la red de desarrollo | Confirmación de que ninguna clave de desarrollo quedó activa en producción | Pendiente |
| A4 | Buckets de Storage reales con políticas RLS | Subir/leer un archivo real; un archivo privado de evidencia de verificación permanece inaccesible públicamente | Prueba de acceso denegado documentada | Pendiente |
| A5 | Registro/login real de punta a punta, incluyendo cambio de dispositivo | Una persona real se registra, confirma correo, cierra e inicia sesión sin intervención del equipo; además, esa misma persona inicia sesión en un segundo dispositivo y conserva sus guardados, seguimientos, historial y preferencias sin pérdida | Registro real ejecutado y documentado, incluyendo la prueba en el segundo dispositivo | Pendiente |
| A6 | Matriz de permisos RLS reproducible contra JWT reales | Tabla con columnas rol / recurso / operación / caso permitido / caso prohibido / resultado esperado / resultado real, cubriendo persona común, negocio/organizador y administrador, incluyendo intentos cruzados entre dos personas distintas — sin ninguna fila en rojo | La matriz completa, llenada con resultados reales | Pendiente |
| A7 | Trigger de creación de `profiles` contra Auth real | Un registro real produce exactamente una fila de perfil, sin duplicados ni huérfanos | Verificación en la tabla real | Pendiente |
| A8 | Guía IA: control de gasto antes del primer uso real | Estimación conservadora + alerta/tope real configurado en el proveedor + presupuesto máximo aceptado explícito + mecanismo que puede cortar temporalmente solo el acceso a la Guía IA sin afectar el resto de la app | Captura de configuración del proveedor + prueba del mecanismo de corte | Pendiente |
| A9 | Límite de tasa por persona verificado en producción | Una persona real enviando mensajes muy rápido recibe una respuesta de límite clara, no un error genérico | Prueba real documentada | Pendiente |
| A10 | `export-user-data` contra Auth Admin API real | Exportación real de una cuenta de prueba contiene exactamente sus datos, sin fuga de otra persona | Archivo exportado real revisado | Pendiente |
| A11 | `process-account-deletions` contra Auth Admin API real | Solicitud real: crear, cancelar, ejecutar; reasignación real a "Cuenta eliminada"; incluye el caso de borrado parcialmente ya ejecutado (H2) | Registro del ciclo completo ejecutado | Pendiente |
| A12 | Invocación periódica confirmada para procesos programados | `pg_cron`, programador externo, o decisión explícita documentada de invocación manual del fundador a esta escala | Configuración o decisión documentada | Pendiente |
| A13 | Términos de servicio y política de privacidad mínimos | Documento real, accesible desde la app, publicado antes del primer registro real | Enlace/captura del documento publicado | Pendiente |
| A14 | Respaldo restaurado en entorno aislado (nunca sobre la base activa) | Backup restaurado con éxito; tablas y relaciones íntegras; estrategia de Auth+Storage compatible verificada; estimación real de punto y tiempo de recuperación (RPO/RTO) | Registro de la restauración de prueba + cifras de RPO/RTO | Pendiente |
| A15 | Alerta mínima ante fallo crítico | Notificación real al fundador dentro de minutos de un fallo simulado (Guía IA caída, feed no carga, función fallando repetidamente) | Prueba de fallo simulado y notificación recibida | Pendiente |
| A16 | Correo transaccional de producción | Confirmación de registro y recuperación de contraseña funcionan con remitente correcto, URLs de redirección de producción, SPF/DKIM si aplica, probado con más de un proveedor de correo, sin enlaces a localhost ni secretos expuestos | Correos reales recibidos, de dos proveedores distintos | Pendiente |
| A16-bis | Notificación push transaccional de producción | Una notificación push real del sistema (ej. "tu negocio fue verificado") se entrega correctamente usando las claves VAPID de producción, no las de desarrollo, con la app instalada como PWA real | Captura de la notificación recibida + confirmación de que las claves usadas son las de producción | Pendiente |
| A17 | Plan de reversión del despliegue | Versión estable identificada; frontend y Edge Functions revertibles; procedimiento ensayado al menos una vez; nunca revierte destructivamente datos ya creados por personas reales; política clara de migraciones de avance/reparación | Registro del ensayo de rollback | Pendiente |
| A18 | Instrumentación mínima de aprendizaje | Captura agregada de registros, usuarios activos, retención básica, errores, uso de Feed/mapa, conversaciones con la Guía IA, tasa de `noAnswer`, costo de IA — nunca contenido literal de conversación, nunca alimentando Afinidad o Conocimiento Permanente | Panel o consulta funcionando con datos de prueba | Pendiente |
| A19 | Canal de soporte visible y probado | Un mensaje real de reporte de fallo, solicitud de ayuda o ejercicio de derecho de privacidad llega a una persona responsable | Prueba real del canal, con tiempo de respuesta registrado | Pendiente |
| A20 | Inventario de datos operativos/semillas verificado | Administrador inicial, "Ahorita Editorial", "Cuenta eliminada", ciudades/zonas necesarias y cualquier configuración sin la cual un flujo crítico falle — todos existen, documentados, con dependencias verificadas | Lista de semillas con verificación uno a uno | Pendiente |
| A21 | Ensayo end-to-end con un negocio real reclutado para este fin | Ciclo completo de verificación (Fase 2) ejecutado sin atajos manuales en la base de datos: solicitud → evidencia real → aprobación → visible como verificado | Registro del ciclo completo | Pendiente |
| A22 | Ensayo end-to-end con una persona real reclutada para este fin | Recorrido completo: registro → confirmación → exploración → Feed/mapa → Guía IA → interacción social o guardado → privacidad → cierre de sesión → regreso posterior, sin que el equipo explique dónde tocar | Registro/video del recorrido | Pendiente |

## Nota — corrección preproducción de la migración `0040` (Motor Editorial)

Antes del primer `db push` real contra `ahorita-production`, se encontró que `0040_fase6_bloque3_motor_editorial.sql` incluía, en la misma transacción que su DDL, un backfill de `events.editor_pick` que exigía un administrador ya existente y abortaba toda la secuencia de migraciones si no lo encontraba — impidiendo que las 46 migraciones se aplicaran deterministas contra una base de datos vacía, sin intervención manual previa. Se corrigió extrayendo ese backfill a `supabase/scripts/backfill_editorial_selections.sql` (idempotente, ejecutado una vez, manualmente, después de `bootstrap_admin.sql`), dejando `0040` como DDL puro. Es la única de las 46 migraciones corregida reabriendo su propio archivo en vez de hacia adelante — justificado porque ninguna versión había llegado a aplicarse contra ningún proyecto remoto y porque este defecto aborta la aplicación completa antes de que cualquier migración posterior pueda alcanzarse. Ver el análisis completo, la prueba de equivalencia funcional y la verificación contra `ahorita-production` real en `PROJECT.md`.

Esta corrección deja una condición permanente para cualquier aplicación futura desde cero (restauración de respaldo — A14 —, CI, o un entorno nuevo): **el backfill del Motor Editorial ya no es automático** y debe ejecutarse manualmente, en este orden, después de `db push --include-all`: (1) crear la cuenta Auth real del administrador, (2) `bootstrap_admin.sql`, (3) `backfill_editorial_selections.sql`. A14, al probarse, debe verificar explícitamente que este paso no se omitió.

## B. Verificaciones obligatorias durante la primera semana de beta

| # | Objetivo | Criterio objetivo | Evidencia a conservar | Estado |
|---|---|---|---|---|
| B1 | Costo real por conversación medido | Cifra real de al menos una semana de uso piloto, comparada contra la estimación de `ETAPA_PRODUCTO_VIVO.md` §15 y contra el presupuesto máximo aceptado (A8) | Registro de costo real semanal | Pendiente |
| B2 | Instrumentación (A18) confirmada funcionando con datos reales | Los datos agregados se están capturando limpiamente con el primer grupo piloto real, sin fuga de contenido privado | Muestra de datos agregados reales revisada | Pendiente |
| B3 | Canal de soporte (A19) confirmado bajo uso real | Al menos una solicitud real de la primera semana fue atendida dentro del tiempo objetivo | Registro de la solicitud real y su tiempo de respuesta | Pendiente |

## C. Condiciones necesarias antes de ampliar el grupo piloto

| # | Objetivo | Criterio objetivo | Evidencia a conservar | Estado |
|---|---|---|---|---|
| C1 | Sostenibilidad económica confirmada | El costo real (B1) se mantiene dentro del presupuesto aceptado, o el mecanismo de límite (A8) se ajustó explícitamente | Decisión documentada | Pendiente |
| C2 | Sin fuga real de datos entre personas | Ni la matriz de RLS (A6) ni la instrumentación (A18/B2) revelaron una fuga real durante la primera semana | Confirmación explícita, sin incidentes abiertos | Pendiente |
| C3 | Respaldo probado en la práctica, si fue necesario | Si el respaldo (A14) tuvo que usarse en un incidente real, la restauración fue exitosa; si no se usó, sigue vigente la prueba de A14 | Registro del incidente y su resolución, si ocurrió | Pendiente |
| C4 | Soporte sostenible antes de sumar más personas | El canal de soporte (A19/B3) sostuvo su tiempo de respuesta objetivo con el primer grupo — señal directa de si el rol ampliado del fundador (`ETAPA_PRODUCTO_VIVO.md` §5/§21) es sostenible antes de crecer | Registro de tiempos de respuesta de la primera semana | Pendiente |

---

## Explícitamente fuera de esta checklist

Ninguno de los siguientes puntos se excluye por costumbre, por ser "genérico" o por parecer secundario — se excluye porque, hoy, no existe evidencia real de que su ausencia impida a una persona o negocio real usar Ahorita durante esta etapa. El criterio de inclusión de toda esta checklist es uniforme: se incorpora lo que la evidencia ya exige; se difiere lo que todavía no la tiene, y su eventual incorporación queda condicionada a que esa evidencia aparezca durante la beta (vía el canal de soporte, A19/B3, o la instrumentación, A18/B2).

- **Inicio de sesión con Google / Apple.** Sin evidencia de que el registro por correo genere fricción real para el tamaño de piloto que define `ETAPA_PRODUCTO_VIVO.md`. Se reevalúa si aparece evidencia real de abandono de registro o solicitud repetida.
- **Cambio de contraseña / cambio de correo desde la interfaz.** El canal de soporte (A19) resuelve hoy cualquier caso real. Se reevalúa si el volumen de estas solicitudes deja de ser manejable manualmente.
- **Distribución mediante Google Play / TestFlight.** Contradice el modelo de confianza personal de `ETAPA_PRODUCTO_VIVO.md` §5 (el fundador recluta y acompaña directamente); además, es trabajo de ingeniería nuevo, no verificación de algo ya construido. Pertenece a una futura etapa de crecimiento, no a esta.
- **CI/CD, observabilidad completa, cola de moderación, feature flags, internacionalización, preparación multi-ciudad, y cualquier funcionalidad nueva** (Historias/video, QR, comercio, monetización) — ya excluidos desde el análisis original de esta checklist.

---

*Fin del documento. Checklist operativa viva, subordinada a `ETAPA_PRODUCTO_VIVO.md`. Se actualiza directamente en este archivo conforme cada ítem se verifica con evidencia real — no se reescribe como documento distinto ni se convierte en canónico.*
