-- Fase 3, Bloque C, Entrega 6 (seguimiento adicional aprobado explícitamente):
-- documenta a nivel de base de datos que `reconcile_follows_to_interactions()`
-- es una herramienta de una sola ejecución para el corte follows ->
-- interactions, no una operación normal del sistema — recomendación de
-- arquitectura del Product Owner al aprobar la Entrega 6, para que nadie en
-- el futuro la interprete como un mecanismo de sincronización a programar
-- periódicamente. Puramente documental: no cambia ninguna columna, política
-- ni comportamiento ya aprobado.
comment on function public.reconcile_follows_to_interactions() is
  'Herramienta LEGACY de una sola ejecución (Fase 3, Bloque C, Entrega 6): reconcilia follows -> interactions durante la ventana de convivencia posterior al corte, solo copiando hacia adelante (nunca elimina). No es una operación normal del sistema ni debe programarse para correr periódicamente sobre datos ya consolidados — su único uso previsto es si follows recibe una escritura fuera de banda (ej. una corrección manual vía SQL Editor) mientras follows siga viva como respaldo. Ver PROJECT.md.';
