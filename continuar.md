# Continuar el desarrollo de Rosedal

Este archivo es para el agente de programación que retome el proyecto. Léelo entero antes de tocar nada. Está escrito el 2026-11-17 y refleja el estado real del código ese día.

## 1. Qué es esto, en tres líneas

Rosedal es una aplicación web en español, de uso individual, para una creadora de contenido que vende un curso y una asesoría. Sirve para pensar qué publicar, escribirlo, planificarlo y registrar a mano qué salió y con qué resultado. Todo es texto, fechas, estados, etiquetas, métricas manuales y enlaces opcionales: **no hay archivos multimedia, ni publicación automática, ni envío de correos, ni integraciones, ni IA integrada.**

## 2. Orden de lectura (obligatorio)

1. `instrucciones.txt`: el encargo original de la usuaria. Es la fuente de verdad.
2. `CLAUDE.md`: reglas innegociables, reglas de código y el apartado «Aprendizajes» (errores ya cometidos; no los repitas).
3. `.claude/PRPs/prp-rosedal-estudio-editorial.md`: el plan técnico (modelo de datos base, reglas de negocio, 13 fases).
4. `docs/00` a `docs/06`: visión, pantallas, diseño visual, datos de ejemplo, mejoras de mercado y verificación.

Si dos documentos se contradicen, manda `instrucciones.txt`, luego el PRP, luego `docs/`. Anota las contradicciones en el informe final.

## 3. Cómo trabajar con la usuaria

- Habla siempre en **español**. Ella no es técnica: no le pidas editar archivos ni ejecutar comandos salvo cuando sea imprescindible (ver «Secretos»).
- **Nunca le pidas que pegue claves, contraseñas o tokens en el chat.** Se dejan en `.env.local` y tú los lees sin imprimirlos.
- Informa con honestidad: lo que no se ha probado en la app en marcha se declara «sin comprobar». Ya hubo un caso en el que se dio por hecho algo que no se había hecho (el botón «Cerrar sesión» no existía); verifica con `Read`/`Grep` antes de afirmar.
- Reglas de código: TypeScript estricto, nunca `any`, Zod en toda entrada del usuario, archivos de 500 líneas y funciones de 50 como máximo, nombres `camelCase` / `PascalCase` / `kebab-case`, vocabulario del dominio en español (`pieza`, `frase`, `lanzamiento`, `finalidad`).
- Para crear archivos usa la herramienta **Write** (los `cat <<EOF` largos fallaron en esta máquina). Bash solo para ejecutar.
- Arranca con `npm run dev`, nunca con `next dev` ni con un puerto fijo. La máquina es Windows 11; las herramientas son Git Bash y PowerShell.

## 4. Entorno

### Pila real instalada

Next.js **16.4** (App Router, Turbopack), React 19.3, TypeScript, **Tailwind 4** (no la 3.4 que decía el PRP; la paleta está como tokens en `src/app/globals.css`), Zod, Zustand, date-fns, lucide-react, `@supabase/ssr` y `@supabase/supabase-js`. Base de datos y autenticación: **Supabase** (proyecto `nsgyavngqvjbtrccnrhc`, región Europa).

> Next 16 no es el Next que conoces. `AGENTS.md` lo avisa: consulta `node_modules/next/dist/docs/` antes de escribir código con APIs que no domines. Cosas ya aprendidas: el interceptor de peticiones es `src/proxy.ts` (no `middleware.ts`); `params` y `searchParams` son promesas (`await`); `cookies()` es asíncrono; `Cache Components` está **desactivado** a propósito en `next.config.ts` (ver `CLAUDE.md`).

### Variables de entorno (`.env.local`, ignorado por git)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_ACCESS_TOKEN=sbp_...   # solo para aplicar migraciones; revocar al terminar
```

`.env.local.example` es la plantilla. En un equipo nuevo, la usuaria debe copiarla como `.env.local` y rellenarla.

### Arrancar

```
npm install
npm run dev        # http://localhost:3000
npx tsc --noEmit   # tipos
npm run lint
npm run build      # compilación de producción (pasaba en la Fase 2)
```

Es posible que haya un servidor de desarrollo ya corriendo en el puerto 3000 (se lanzó en segundo plano y el sistema denegó pararlo). Si el puerto está ocupado, cierra ese proceso desde el administrador de tareas o reinicia la terminal.

### Cuenta de la usuaria

Existe **una** cuenta creada en Supabase (Authentication → Users). No hay registro abierto. **No tienes sus credenciales** y no debes pedirlas por el chat. Para pruebas automáticas con navegador, pídele que añada `E2E_EMAIL` y `E2E_PASSWORD` a `.env.local` (puede crear una cuenta de prueba aparte) y léelas sin imprimirlas.

### Base de datos: cómo aplicar migraciones

El conector MCP de Supabase **no funciona** (responde «Unauthorized» aunque se reconecte). El método que sí funciona:

```
node scripts/aplicar-migracion.mjs supabase/migrations/<archivo>.sql
```

Lee `SUPABASE_ACCESS_TOKEN` de `.env.local`, llama a la API de gestión de Supabase y nunca imprime el token. Para consultas de comprobación, el mismo endpoint (`POST https://api.supabase.com/v1/projects/<ref>/database/query`) acepta SQL; **usa comillas dólar (`$$texto$$`) en lugar de comillas simples** dentro de comandos `node -e`, porque las comillas simples se pierden en el paso por Bash.

Convenciones de toda tabla (ya aplicadas): `id uuid`, `user_id uuid default auth.uid()`, `es_demo bool`, `created_at/updated_at` con disparador `tocar_updated_at`, **RLS activo** con la política `propietaria` (`user_id = (select auth.uid())`), índices en `user_id` y en cada clave foránea. Los enumerados son `text` con `check`, reflejados en constantes y esquemas Zod (una sola fuente por enumerado). Borrado lógico con `eliminado_en` donde el PRP lo pide (ideas, frases, recursos y, más adelante, piezas).

Tras cada migración, comprueba con SQL que las tablas nuevas tienen RLS y política (hay una consulta de ejemplo en el historial: `pg_class` + `pg_policies`).

## 5. Estado del proyecto

### Terminado

**Fase 1: Cimientos.** Proyecto, tema visual, tipografía (Fraunces + Inter), navegación (barra lateral agrupada en ordenador; barra inferior con «+» central en móvil; pantalla «Más»), 13 secciones, inicio de sesión con Supabase (`src/app/(auth)/login`), protección de rutas en `src/proxy.ts` (sin sesión → `/login`), botón «Cerrar sesión» (barra lateral y pantalla «Más»).

**Fase 2: Catálogos y contexto** (migración `20261116000001_catalogos.sql` aplicada). Tablas `ajustes`, `pilares`, `ofertas`, `oferta_objeciones`, `recursos_marca`.
- Ajustes: marca (nombre, audiencia, tono) y pilares (crear, editar con color, archivar/restaurar).
- Ofertas: lista, creación, ficha editable, objeciones con respuesta, «Copiar argumentario», archivar.
- Recursos de marca: pestañas tono / CTA / testimonio / plano / enlace de venta, copiar, quitar a la papelera.
- Componentes compartidos: `BotonCopiar`, `MensajeResultado`, `estilos.ts`.

**Fase 3 (parte 1): captura rápida.** Migración `20261116000002_ideas_frases.sql` aplicada (tablas `ideas`, `idea_angulos`, `frases`; FK de `oferta_objeciones.idea_id`).
- `src/features/captura/`: hoja de captura (campo único, «Guardar» y «Guardar y escribir otra», borrador en `localStorage`, `Ctrl+Intro`), menú «+» en móvil y «Capturar» en barra lateral, tres botones en Hoy.
- Las capturas guardan: «+ Idea» y «+ Idea de email» → tabla `ideas` (tipos `idea` / `idea_email`); «+ Frase para B-roll» → tabla `frases` **sin recortar el texto** (los saltos de línea se conservan).

**Fase 3 (parte 2): pantalla Ideas (terminada, ver comprobaciones abajo).** `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan.
- `src/app/(app)/ideas/page.tsx`: tres pestañas por GET (`?vista=bandeja|brainstorming|preguntas`, sin parámetro = bandeja).
- `src/features/ideas/bandeja.tsx`: ideas `idea`/`idea_email` sin papelera ni archivadas, «Sin clasificar» discreto, filtros por GET (`q` saneado en `consultas.ts` antes de `.or(...)`, tipo, estado, pilar, oferta, lanzamiento, relevancia mínima, tiempo 15/30/60/más), orden recientes/prioridad/tiempo (los dos últimos se ordenan en JS).
- `src/app/(app)/ideas/[id]/page.tsx` + `formulario-idea.tsx`: ficha con autoguardado a los 800 ms (envoltorio asíncrono, sin efectos que hagan `setState`), clasificación, prioridad con atajos 15/30/60/120, notas, los 7 ángulos (`angulos.tsx`), «Copiar prompt para explorar ángulos» (`prompt.ts`: idea, audiencia, oferta, tono y ejemplos), archivar y papelera (`quitarIdea` redirige a `/ideas`); «piezas creadas a partir de esta idea» queda como avance de la Fase 4.
- `brainstorming.tsx` + `controles-tablero.tsx`: columnas por tema/pilar/oferta/problema con «Sin asignar», «Mover a…» en `<select>` (el arrastre con dnd-kit no se hizo: es opcional y queda declarado), «Nueva idea» en cada columna y «Nueva columna» (pide nombre + idea, porque las columnas salen de las ideas).
- `preguntas.tsx` + `formulario-pregunta.tsx`: lista ordenada por veces que ha aparecido, alta con palabras originales obligatorias y «Ha vuelto a aparecer».
- Etiquetas compartidas: `src/shared/components/etiquetas.tsx` (`Etiqueta`, `EtiquetaPilar`) y `src/features/ideas/etiquetas-ideas.tsx` (tipo y estado); colores de pilar en `src/shared/constants/colores-pilar.ts` (la capa `shared` no importa `features`; `features/ajustes/esquemas.ts` re-exporta).
- En `/ofertas/[id]` se muestran las ideas `tipo=objecion` con esa oferta (decisión: no se rellena `oferta_objeciones` desde Ideas).

**Comprobaciones de la Fase 3 (SQL, 2026-11-16):** RLS activo en `ideas` e `idea_angulos` con política `propietaria`; insert/lectura/borrado reales de una idea y de un ángulo (los datos se escriben, y la base de datos quedó sin restos de las pruebas); el filtro «hasta 30 minutos» reproduce el comportamiento esperado (descarta la de 45 min y la archivada, y combinado con la búsqueda «treinta» devuelve solo la esperada). **Sin comprobar en pantalla**: ver §8.

### Pendiente, en orden

**Fase 13: validación final y entrega.** Las Fases 3 a 12 están terminadas en código; las lagunas de validación visual siguen en §8 y el informe de entrega está en §10.

**Fase 12: mejoras de mercado (terminada; comprobada con sesión, no en un navegador).** Migración `20261117000009_mejoras.sql` aplicada: `pieza_cambios_fecha` (A8), `pieza_pasos` (B3), `fechas_senaladas` (B1), `piezas.perenne` y `piezas.hora_prevista` (B5), `lanzamientos.balance` (B8) y `sesion_piezas.preparado`.
- **A1 Aplicación instalable**: manifiesto en `src/app/manifest.ts` (público, sin sesión) con icono y accesos directos a «+ Idea», «+ Frase» y «+ Idea de email», que abren la hoja de captura por `?captura=…`. Iconos en `public/icono.svg` y `public/icono-mascara.svg`.
- **A2 Captura sin conexión**: si no hay red, la captura se guarda en el dispositivo (`src/features/captura/cola.ts`) y se envía sola al recuperar la conexión (`reintento.tsx`), con el aviso «Pendiente de guardar».
- **A3 Buscador global**: `Ctrl + K` en ordenador y lupa en «Más»; busca en ideas, piezas, frases, correos, ofertas y recursos y ofrece acciones («Ir al calendario», «Revisión semanal»…).
- **A4 Papelera**: pantalla en Ajustes con todo lo borrado (ideas, piezas, frases y recursos), «Restaurar» y «Vaciar la papelera».
- **A5 Copia de seguridad**: «Descargar copia (JSON)» con todas las tablas, «Exportar piezas (CSV)» y «Restaurar copia» (valida el archivo con Zod y solo deja escribir en una cuenta vacía).
- **A6 Contadores**: asunto (50), vista previa (90) y texto de publicación (2.200).
- **A8 Historial de fechas**: cada cambio de fecha prevista queda anotado (ficha, planificar y calendario) y se ve en la ficha.
- **B1 Fechas señaladas**: días que condicionan la planificación (vacaciones, una feria); se ven como marcas en la semana y en el mes.
- **B2 Ritmo semanal**: opcional y vacío por defecto; si lo pones, Hoy muestra «Reels: 2 de 3» sin avisos ni reproches.
- **B3 Pasos por pieza**: casillas propias de cada pieza con una lista de partida por formato (Ajustes).
- **B4 Ganchos y hashtags**: dos tipos más en Recursos de marca; se copian desde la ficha de la pieza.
- **B5 Contenido perenne**: marca «perenne» en la ficha y vista «Para retomar» en la biblioteca (perennes y lo que rindió bien hace más de 90 días).
- **B6 Más prompts**: ganchos alternativos, asuntos alternativos y «adaptar a otro formato», todos copiables.
- **B7 Resumen copiable**: en la revisión semanal y en el balance del lanzamiento.
- **B8 Balance de lanzamiento**: lo confirmado y lo sin atribuir por separado, con «qué repetir» y «qué no».
- **B9 Enlace con seguimiento**: añadidor de etiquetas de campaña (utm_source, utm_medium, utm_campaign) junto a la llamada a la acción.
- **B10 Modo concentración**: botón que deja la ficha solo con el texto.
- Comprobado con sesión (usuario de pruebas, borrado después): las 24 pantallas de la app responden 200 y muestran lo esperado; el manifiesto responde 200 sin sesión. **Fallo encontrado y corregido al comprobar**: la ficha de pieza (`/piezas/[id]`) devolvía 500 desde la Fase 4 porque usaba una función en línea como `action` de formulario en un componente de servidor; ahora usa `marcarEstadoPieza` (acción de servidor) y la pantalla abre bien. Todas las páginas se repasaron una a una con sesión.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan.

**Fase 11: datos de ejemplo y plantillas de partida (terminada; comprobada con sesión, no en un navegador).** Sin migración nueva.
- Ajustes → «Datos de ejemplo»: «Cargar ejemplo» y «Quitar ejemplo» (este último enseña antes cuántos elementos se borran y avisa de que lo tuyo no se toca). Todo lo sembrado va marcado con `es_demo`.
- El ejemplo es el de `docs/04-datos-demo.md`: Marta Vidal y su marca, cuatro pilares, dos ofertas con sus objeciones, el lanzamiento «Semana en Calma · edición de otoño» con sus cinco fases, cinco hitos y siete piezas, la idea central con sus tres ángulos y las tres piezas que salen de ella (reel con dos guiones, stories de tres tarjetas y el correo adaptado), tres broadcasts, la secuencia poscompra de cuatro pasos, ocho frases con sus saltos de línea (una usada, una con reel de prueba y una variante), tres piezas publicadas con sus métricas (con un cero, un pendiente y dos atribuciones), la pieza atrasada, diez ideas, el día de grabación y los recursos de marca.
- Plantillas de partida: las dos de lanzamiento (ya existían) más **cuatro de secuencia de correo** (bienvenida, lanzamiento, poscompra y upsell) y **dos de stories** (pregunta-encuesta-respuesta y antes-después). Se siembran de forma idempotente por `clave`; Ajustes las lista agrupadas por tipo con ver, editar, duplicar y eliminar (las de partida no se pueden quitar, sí copiar).
- Desde «Nueva pieza» se puede crear una secuencia de stories a partir de una plantilla.
- Comprobado con sesión: cargar el ejemplo crea 22 piezas y el resto de contenido, la segunda vez avisa de que ya está cargado, quitarlo deja la cuenta como estaba y **no borra una pieza propia** (probado), y las pantallas muestran el ejemplo (ofertas, lanzamientos, calendario, revisión, mapa, frases, email, ideas, preguntas, grabación y biblioteca). Usuario de pruebas borrado después.

**Fase 10: revisión semanal y mapa (terminada; comprobada con sesión, no en un navegador).** Migración `20261117000008_revision.sql` aplicada: `pieza_metricas` con RLS, más `piezas.aprendizaje` y `piezas.nota_retomar`.
- `/revision`: se entra por semanas con flechas; cabecera con el título y tres cifras (lo que salió, lo previsto que no salió y los datos pendientes); «Lo que salió» con las piezas de la semana, su fecha real, la prevista si difiere, el enlace y sus métricas; «Lo que no salió» con «Cambiar fecha» y «Marcar publicado»; «Datos que arrastro» con las métricas pendientes de semanas anteriores, editables allí mismo; y por pieza: «Crear adaptación», «Reutilizar» y «Retomar el…».
- Métricas: se proponen las de la finalidad y, en los correos, aperturas y clics; tres estados (campo vacío = pendiente, un número = registrado, y fuera de la lista = «no la sigo»); escribir 0 registra un cero. En compras, reservas e ingresos se anota la atribución (confirmada o sin atribuir). Al publicar una pieza se crean sus métricas en pendiente.
- `/mapa`: tabla de pilares (más «Sin pilar») por finalidades (más «Sin finalidad»), con totales, el fondo más intenso cuanto más hay, filtros de periodo, estado y lanzamiento, y la lista de las piezas de la celda al pulsarla.
- Comprobado con sesión (usuario de pruebas, borrado después): las dos pantallas responden 200, la revisión muestra las tres secciones con las métricas y las atribuciones, y el mapa filtra por pilar y muestra la celda pulsada.

**Fase 9: calendario y Hoy (terminada; comprobada con sesión, no en un navegador).** Sin migración nueva: el calendario y Hoy trabajan con las tablas que ya había.
- `/calendario`: vistas **Semana** y **Mes** conmutables, flechas de periodo, «Hoy» y el título del periodo («16-22 de noviembre», «Noviembre de 2026»). Cada pieza con fecha es una entrada, solo una aunque tenga varias versiones de guion; una secuencia de stories es una entrada («Stories · 3»). Las piezas publicadas se colocan en su **fecha real** y, si no coincide con la prevista, avisan («Prevista: …»). Los hitos de lanzamiento se ven con su propio aspecto y las fases del lanzamiento activo se marcan como una banda de color sobre los días que abarcan. Filtros combinables por formato, canal, finalidad, estado, pilar, oferta y lanzamiento, aplicados también a la bandeja.
- Bandeja «Sin fecha» (plegable, en el mismo eje que el calendario): piezas sin fecha prevista y sin publicar, sin los pasos de las secuencias de plazos relativos, con su propio buscador; desde ahí se coloca una pieza en un día con «Cambiar fecha».
- Mover piezas: cada tarjeta tiene «Cambiar fecha» (un `<select>` con los días que se están viendo y «Sin fecha»); una pieza publicada no se mueve, su fecha real se corrige desde la ficha. **El arrastre con el ratón no está hecho**: se sustituye por «Cambiar fecha», como ya se decidió con dnd-kit en las fases anteriores.
- Crear desde el calendario: cada día ofrece «+ Nueva pieza», que lleva a `/piezas/nueva` con la fecha ya puesta.
- `/hoy`: cabecera con la fecha escrita y los tres botones de captura; «Hoy publico o envío» (las piezas con fecha de hoy, con «Marcar publicado» o «Marcar enviado» y el enlace al cuerpo) y debajo las atrasadas, con «Atrasada desde el martes», la opción de publicarlas y la de cambiarles la fecha; «Tengo que preparar» (lo que vence en los próximos siete días y sigue en borrador o en preparación, con lo que falta en palabras: «Sin guion», «Falta la llamada a la acción», «Sin grabar»), el próximo día de grabación y las piezas marcadas para retomar; «Próximo hito» con el nombre del lanzamiento, la fase en curso, la fecha y los días que faltan; y al pie, los contadores de ideas sin clasificar y de frases sin usar.
- Archivos nuevos: `src/features/calendario/` (`esquemas.ts`, `consultas.ts`, `acciones.ts`, `calendario.tsx`, `semana.tsx`, `mes.tsx`, `tarjeta.tsx`, `cambiar-fecha.tsx`, `filtros.tsx`, `bandeja.tsx`) y `src/features/hoy/` (`hoy.tsx`, `publicar-ahora.tsx`). `src/shared/lib/texto.ts` recoge `sanearBusqueda`, que ahora usan Ideas, Email y el calendario.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan. Comprobaciones: las funciones puras del calendario (semana de lunes a domingo, rejilla del mes, títulos, fecha real frente a prevista) se verificaron con `tsx` y sus aserciones; con SQL se confirmó que todas las columnas que consulta la app existen y que RLS deja ver solo lo de la propietaria.
- **Comprobado con sesión real** (usuario de pruebas creado y borrado después, con datos de ejemplo): `/hoy` y `/calendario` responden 200 y muestran las piezas de hoy, la atrasada, la próxima, la sin fecha, el hito del día, el próximo día de grabación, el stories como entrada única con su número de tarjetas, la nota «Prevista: …» de la pieza publicada, la vista de mes con «+1 más», el filtro por formato, el filtro por lanzamiento y el salto de semana. No se ha mirado en un navegador ni en móvil: el aspecto, el ancho de 375 px, el arrastre y el copiado siguen sin comprobar.

**Fase 8: ofertas en uso y lanzamientos (terminada; sin comprobar en pantalla).** Migración `20261117000007_lanzamientos.sql` aplicada: `lanzamientos`, `lanzamiento_fases` (una fase por tipo y lanzamiento) y `lanzamiento_hitos`, con RLS, política `propietaria`, índices y disparadores; además, `plantillas.clave` con índice único parcial (para sembrar las plantillas de partida sin duplicar) y claves foráneas en `piezas.lanzamiento_id`/`fase_id`, `ideas.lanzamiento_id` y `secuencias_email.lanzamiento_id`.
- `/lanzamientos`: lista con nombre, oferta, fechas, estado y barra de piezas escritas; alta desde cero (crea las cinco fases) y desde plantilla (pide nombre, oferta y fecha de apertura y enseña cómo quedarán las fechas antes de confirmar).
- Ficha de lanzamiento (`/lanzamientos/[id]`): cabecera con oferta, objetivo, fechas y estado; línea de tiempo con las cinco fases, sus fechas, una marca de «Hoy» y los hitos de cada fase (en móvil, lista vertical); hitos con casilla de hecho, edición y borrado; fases desplegables con sus fechas, qué se busca y sus piezas agrupadas por formato (título, fecha, finalidad, estado y la marca «Por escribir»); «Añadir pieza nueva» (lleva a `/piezas/nueva` con el lanzamiento, la fase y la fecha ya puestos) y «Añadir pieza existente» (asigna una pieza libre y la marca como planificada con su fecha); resumen por finalidad en tabla.
- Plantillas: dos de partida editables en Ajustes («Lanzar un producto digital» y «Lanzar un servicio») con fases, hitos y piezas sugeridas contados desde la apertura (día 0); al aplicar una se crean el lanzamiento, sus fases, sus hitos y sus piezas en borrador con las fechas ya calculadas; todo se puede editar o quitar después. Las plantillas de partida se siembran de forma idempotente por `clave` y no se pueden borrar desde Ajustes.
- `src/features/lanzamientos/esquemas.ts` (tipos y Zod), `acciones.ts` (lanzamiento, fases con recálculo de fechas, hitos, piezas), `acciones-plantillas.ts` (guardar, borrar y aplicar plantillas), `plantillas-partida.ts` (las dos plantillas), `lista.tsx`, `ficha.tsx`, `linea-tiempo.tsx`, `hitos.tsx`, `fases.tsx`, `formularios.tsx`, `formulario-plantilla.tsx` y `plantillas-ajustes.tsx`.
- Convivencia con el contenido habitual: la biblioteca filtra por lanzamiento con tres posiciones (todo, un lanzamiento o solo lo habitual, que son las piezas sin lanzamiento) y marca cada pieza con el nombre de su lanzamiento; los broadcasts de Email tienen el filtro por lanzamiento y muestran su nombre; la bandeja de Ideas filtra por lanzamiento y lo muestra en la tarjeta; la ficha de una idea permite asignarle un lanzamiento; la ficha de una pieza permite asignarle lanzamiento y fase (la fase solo se guarda si pertenece a ese lanzamiento).
- `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan. SQL: RLS y políticas confirmadas en las tres tablas nuevas; siembra idempotente de las plantillas (el índice único rechaza el duplicado); lanzamiento, fases, hitos y piezas escritos y leídos; al borrar un lanzamiento las fases y los hitos caen en cascada y las piezas se quedan sin lanzamiento; la base de datos quedó sin restos de las pruebas.
- Decisiones declaradas: el arrastre dnd-kit no se implementa (la fase se añade desde su bloque y «Mover a…» sigue siendo un `<select>`); las fechas del lanzamiento se recalculan como el mínimo y el máximo de sus fases al guardar una fase; una pieza ya publicada no se puede reasignar (queda congelada); las plantillas de stories y de secuencias siguen para la Fase 11.

**Fase 7: email marketing (terminada; sin comprobar en pantalla).** Migración `20261117000006_email.sql` aplicada: `secuencias_email`, `secuencia_pasos` (un correo pertenece como máximo a una secuencia) y `plantillas`, con RLS, política `propietaria`, índices y disparadores.
- `/email` con tres pestañas: **Broadcasts** (Esta semana con navegación semanal y agrupación por día, Sin fecha y Enviados; filtros de temática, audiencia, pilar, finalidad, oferta y lanzamiento), **Ideas de email** (bandeja propia con «Convertir en broadcast» y «Convertir en paso de secuencia», que pasan la idea a «En desarrollo» y enlazan el correo) y **Secuencias** (lista, alta, alta desde plantilla y acceso a la ficha).
- Editor de correo dentro de `/piezas/[id]` cuando `formato=email`: asuntos alternativos con contador, elección y borrado; texto de vista previa con contador; imitación de la bandeja con el nombre de marca; cuerpo con negrita, cursiva, H2/H3, listas, cita, enlace y separador; autoguardado con indicador. Las tres acciones de copia están fijas al pie: asunto, vista previa y cuerpo con formato (HTML y texto plano a la vez, con alternativa a texto plano). «Marcar como enviado» congela el contenido y la instantánea incluye el asunto elegido; «Reutilizar» copia cuerpo, vista previa y asuntos.
- Ficha de secuencia: las tres preguntas (audiencia, disparador, objetivo), tipo, programación, oferta, cronología con plazo y acumulado, edición del plazo o de la fecha sin abrir el correo, Subir/Bajar, duplicar paso, quitar de la secuencia, escribir un correo nuevo o incorporar uno existente (en fechas fijas se enlaza; en plazos relativos se copia), y «Guardar como plantilla»/«Nueva secuencia desde plantilla» sin textos. Los pasos relativos no aparecen en Broadcasts y se muestran como «En marcha» al publicarse. La cronología vive en `src/features/email/cronologia.tsx`; la página solo carga datos y compone.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan. SQL: RLS y políticas confirmadas en las tres tablas; secuencia, paso, correo y plantilla escritos; cuerpo y plazo leídos; todo borrado sin residuos. El saneador de HTML se probó aparte: elimina `script`, atributos de evento y enlaces `javascript:`, conserva el formato permitido y produce texto plano con listas y separadores.
- Sin comprobar en pantalla: las tres pestañas, el editor con formato, el pegado desde otra web, las tres copias, la semana, la cronología, la copia al incorporar un correo, las plantillas y el envío marcado a mano. No hay `E2E_EMAIL`/`E2E_PASSWORD`.
- Decisiones declaradas: no se instaló Tiptap (el PRP lo proponía); el cuerpo usa `contentEditable` con la barra de comandos del navegador y saneado propio en cliente y servidor. El arrastre de pasos se sustituye por «Subir»/«Bajar», como en stories. Las cuatro plantillas de partida quedan para la Fase 11; el filtro por lanzamiento se añadió en la Fase 8. «Elegir de mis CTA» en el correo no se conectó todavía.

**Fase 6: stories y día de grabación (terminada; sin comprobar en pantalla).** Migración `20261117000005_stories_grabacion.sql` aplicada: `story_tarjetas`, `sesiones_grabacion` y `sesion_piezas`, con RLS, política `propietaria`, índices y disparadores.
- Editor de stories en la ficha de una pieza `formato=stories`: añadir, duplicar, quitar y reordenar tarjetas (Subir/Bajar), campos de título, qué digo, texto en pantalla, visual e interacción, y lectura de la secuencia completa con «Copiar secuencia».
- `/grabacion`: lista de sesiones con fecha y número de piezas; alta con nombre, fecha opcional, notas y selección de piezas con guion no grabadas ni publicadas.
- `/grabacion/[id]`: progreso («X de Y grabados · quedan unos N minutos»), preparativos reunidos, guion elegido completo, plano, duración y «Ya grabado» reversible; las grabadas se atenúan y bajan al final. Marcar «Ya grabado» no cambia el estado de la pieza.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan. SQL: RLS/políticas confirmadas; tarjeta, sesión y relación escritas y borradas sin residuos.
- R4 y el editor se comprobaron después con pruebas automáticas. **Modo lectura a pantalla completa hecho (2026-11-17)**: botón «Leer a pantalla completa» (`src/features/stories/lectura-pantalla-completa.tsx`), una story cada vez con letra grande, «Anterior»/«Siguiente», flechas y Esc del teclado, «Story N de M»; probado en ordenador y móvil (`e2e/r4-lectura-stories.spec.ts`). Las plantillas de stories ya están (Fase 11); el arrastre se sustituye por Subir/Bajar.

**Fase 5: banco de frases y reels de prueba (terminada; sin comprobar en pantalla).** Migración `20261117000004_frase_usos.sql` aplicada: `frase_usos` tiene RLS, política `propietaria`, índices y unicidad parcial por pieza.
- `/frases`: alta y edición preservando los saltos de línea, tarjetas completas, favoritas, búsqueda saneada, filtros Todas/Sin usar/Ya utilizadas/Favoritas, frase aleatoria respetando el filtro, copia exacta, archivado, variantes enlazadas e historial.
- Desde una tarjeta se registra un uso manual (fecha, enlace y texto exacto) o se planifica un reel de prueba (`reel_prueba`, Attract, 7 segundos, texto en pantalla editable, plano y fecha opcionales); planificar no cuenta como uso.
- Al publicar una pieza con `frase_id`, `publicarPieza` registra un uso exactamente una vez; deshacer publicación lo elimina. `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan. SQL: RLS/política confirmadas; frase + uso escritos, con salto de línea exacto, y borrados sin residuos.
- Sin comprobar en pantalla: R1/R2, incluidas la copia desde móvil, planificación del reel y el registro automático al publicar.

**Fase 4: piezas y biblioteca (terminada; sin comprobar en pantalla).** Migración `20261117000003_piezas_biblioteca.sql` aplicada, con las tablas `piezas` y `pieza_versiones`, sus índices, RLS y política `propietaria`.
- Biblioteca (`/biblioteca`): creación de pieza, búsqueda saneada por título/textos/notas, filtros combinables de formato/canal/estado/finalidad/pilar/oferta/idea de origen/grabación/rango de fechas, orden por recientes/título/fecha y vistas de lista y tablero por estado.
- Ficha (`/piezas/[id]`): clasificación, planificación (pide fecha), textos, preparación de grabación, estado, aviso Convert si falta oferta/acción/cómo hacerlo, guiones con versiones y una versión elegida, copiar y comparar versiones, borrar una versión sin poder borrar la única, publicación con fecha real y URL opcional que congela el contenido, confirmación para deshacer publicación, adaptación y reutilización de publicadas, origen enlazado y papelera.
- Las fichas de Ideas ya muestran y enlazan las piezas de origen, y permiten crear una pieza con la idea preseleccionada.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan. SQL: RLS y política confirmadas; inserción de pieza + versión comprobada y eliminada sin dejar datos de prueba.
- El filtro por lanzamiento llegó en la Fase 8, junto con su entidad. El arrastre con dnd-kit se sustituye por «Mover a…», opción válida para móvil y ordenador; puede añadirse como mejora posterior.

Después, según el PRP (`## Blueprint`): Fase 4 piezas y biblioteca · 5 banco de frases y reels de prueba · 6 stories y día de grabación · 7 email marketing · 8 lanzamientos · 9 calendario y Hoy · 10 revisión semanal y mapa · 11 datos de ejemplo · 12 mejoras de mercado · 13 validación final y entrega. Sigue el método del skill `bucle-agentico`: al entrar en cada fase, **mapea el contexto real** (qué existe ya, qué tablas hay), genera las subtareas y entonces ejecuta. Cada fase termina con la app compilando y su validación del PRP cumplida.

Mejoras de `docs/05-mejoras-de-mercado.md`: van **después** de que los siete recorridos funcionen. Las columnas y tablas que describe (objeciones con respuesta, historial de fechas, hora prevista, etc.) se crean en la fase del módulo al que pertenecen. Ya están hechas: tabla `oferta_objeciones`, `nombre_marca` en `ajustes`, `autor`/`autorizado` en `recursos_marca`.

## 6. Qué falta exactamente de la Fase 3

> **Estado: cumplida el 2026-11-16.** Los puntos 1 a 6 están implementados y compilando; las comprobaciones del punto 7 se hicieron con SQL (ver §5). Quedan pendientes de ver en pantalla los apartados de §8; la lista de «piezas creadas a partir de esta idea» llegó en la Fase 4 y el filtro por lanzamiento en la Fase 8. El arrastre con dnd-kit no se hizo: «Mover a…» es un `<select>`, permitido por el PRP como opción móvil y declarado aquí.

Objetivo del PRP: «Los tres accesos de captura desde Inicio, bandeja de pendientes, ficha de idea con prioridad y ángulos, preguntas y objeciones con contador, agrupación por las cuatro dimensiones, búsqueda combinada y "Copiar prompt"». Detalle de pantallas en `docs/01-pantallas-contenido.md`, apartado «Ideas».

1. **`/ideas` con tres pestañas** (`?vista=bandeja|brainstorming|preguntas`, sin parámetro = bandeja). Divide en componentes de servidor dentro de `src/features/ideas/` para no pasar de 500 líneas por archivo.
2. **Bandeja**: ideas de tipo `idea` / `idea_email`, más reciente arriba, marca «Sin clasificar» si no tienen pilar, oferta ni tema. Filtros por GET (que se reflejen en la URL): texto (`q`, buscar en texto, tema, problema y notas; **sanea `q`** quitando `, ( ) % * \ "` antes de usarlo en `.or(...)`), tipo, estado, pilar, oferta, lanzamiento, relevancia mínima y **tiempo máximo de preparación** (15 / 30 / 60 / más). Orden: recientes, prioridad (relevancia+demanda altas y poco tiempo primero; ordénalo en JS) y tiempo. El filtro por **lanzamiento** se añadió en la Fase 8 (la columna `ideas.lanzamiento_id` ya tiene clave foránea). La consulta de la usuaria «ideas para este lanzamiento que pueda preparar en 30 minutos» debe quedar resuelta con dos filtros y reflejada en la URL.
3. **Ficha `/ideas/[id]`**: texto editable; clasificación (tipo, estado, pilar, oferta, tema, problema de la audiencia, procedencia); prioridad (relevancia y demanda en tres niveles, minutos con atajos 15/30/60/120); notas; ángulos (los 7 de `TIPOS_ANGULO`, cada uno con su nota, guardar y quitar); **«Copiar prompt para explorar ángulos»** (componer con `componerPrompt`, leyendo `ajustes`, la oferta de la idea y los 2-3 primeros recursos de tipo `tono`); archivar y enviar a la papelera. Para preguntas/objeciones muestra palabras originales, procedencia y contador con «Ha vuelto a aparecer». La lista de «piezas creadas a partir de esta idea» llega en la Fase 4.
4. **Brainstorming**: tablero de columnas con selector «Agrupar por» (tema, pilar, oferta, problema de la audiencia) y columna «Sin asignar». Mover una idea: un `<select>` «Mover a…» en cada tarjeta que llame a `moverIdea` (sirve en móvil y en ordenador; el arrastre con dnd-kit es opcional y puede dejarse para después, pero hay que declararlo). Formulario «Añadir idea a esta columna» con `crearIdeaEnColumna`, y «Nueva columna» para tema y problema.
5. **Preguntas y objeciones**: lista ordenable por veces que han aparecido, formulario `crearPregunta` (palabras originales obligatorias; procedencia y oferta opcionales), botón «Ha vuelto a aparecer» (`sumarAparicion`). Las objeciones vinculadas a una oferta se mostrarán también en su ficha (`oferta_objeciones.idea_id` ya existe; hoy esa tabla no se rellena desde Ideas: decide si se enlaza o si basta con mostrar las ideas de tipo `objecion` con `oferta_id` en la ficha de la oferta).
6. **Etiquetas con el mismo aspecto en toda la app** (pilar con su punto de color, tipo, estado). Crea un componente compartido en `src/shared/components/` en cuanto lo necesites por segunda vez.
7. Comprobaciones de la fase: en móvil una idea se guarda escribiendo y pulsando una vez; la búsqueda por 30 minutos devuelve lo esperado; el prompt copiado contiene idea, audiencia, oferta y tono. Para probar sin la cuenta de la usuaria, comprueba al menos con SQL que los datos se escriben, y declara «sin comprobar en pantalla» lo que no hayas visto en un navegador.

## 7. Decisiones tomadas que debes respetar

- **Una sola tabla `piezas`** para todos los formatos (reel, carrusel, stories, email…). Una pieza = una entrada en el calendario. Versiones de guion y asuntos alternativos son filas de `pieza_versiones` con una sola «elegida». **No** crees una tabla por formato ni una pieza por versión.
- **Lo publicado se congela** (`publicado_snapshot`); «Reutilizar» crea un borrador nuevo sin tocar la original. «Deshacer publicación» es la única vía de vuelta.
- **«Sin usar» de una frase es un dato derivado** (no tiene filas en `frase_usos`), nunca una columna. Copiar o planificar un reel de prueba **no** cuenta como uso. La tabla `frases` ya existe; `frase_usos` se crea en la Fase 5.
- **Fecha prevista y fecha real son columnas `date` distintas**; ninguna operación sobrescribe una con la otra. No uses `new Date('AAAA-MM-DD')` para mostrar fechas (se desplaza un día). «Hoy» se calcula en `Europe/Madrid`; la semana empieza en lunes.
- **Dato pendiente ≠ cero**: métrica sin valor (`null`) es pendiente; `0` es un cero real. Venta confirmada ≠ atribución desconocida.
- **Frases**: no hacer `trim()` ni normalizar el texto al guardar; mostrar con `white-space: pre-wrap`; copiar el valor guardado.
- **Sin sermones**: el mapa pilares × finalidades informa, no juzga; los avisos (por ejemplo, llamada a la acción incompleta en Convert) advierten y dejan continuar.
- **Paleta y diseño**: `docs/03-diseno-visual.md` manda sobre los valores de partida del PRP. Blanco dominante, verdes y rosas claros, contraste AA comprobado, la finalidad siempre con su nombre escrito (nunca solo color).
- **Texto en la interfaz**: voz cercana en primera persona, fechas escritas («jueves 5 de noviembre»), números a la española.
- **Tailwind 4** en lugar de 3.4: los colores son variables `--color-*` en `@theme` (clases como `bg-verde-700`, `text-tinta-suave`, `rounded-tarjeta`).
- **Sin captura sin conexión** en esta versión (decisión D3 del PRP); si falla el guardado, el texto no se pierde en pantalla y el borrador queda en `localStorage`.

## 8. Cosas aún sin comprobar (declara siempre estas lagunas)

- **Nada se ha visto funcionando en un navegador con sesión iniciada.** Lo único comprobado con datos reales es que la usuaria guardó una marca («Ivan Rosedal») y un pilar («Tapping») desde Ajustes y están en la base de datos.
- **Fase 3 sin comprobar en pantalla**: las tres pestañas de `/ideas`, el autoguardado de la ficha, los filtros y el orden de la bandeja, el tablero de brainstorming y su «Mover a…», el alta y el contador de preguntas/objeciones, y el contenido del prompt al copiarlo (la composición se leyó en `prompt.ts`, no se copió en un navegador). Todo ello se verificó compilando y con SQL, no con sesión abierta: no hay `E2E_EMAIL`/`E2E_PASSWORD` en `.env.local`.
- **Fase 4 sin comprobar en pantalla**: Biblioteca, creación desde Ideas, guiones/versiones, congelado al publicar, adaptación y reutilización. La estructura y las escrituras se verificaron con TypeScript, lint, build y SQL, pero no en un navegador con sesión iniciada.
- **Fase 5 sin comprobar en pantalla**: banco de frases, copia con saltos de línea, filtros, selección aleatoria, variantes, registro manual de uso, reel de prueba y uso automático al publicar. SQL confirmó RLS, escritura y preservación de saltos, pero no los recorridos R1/R2 en navegador.
- **Fase 6 sin comprobar en pantalla**: editor de stories, reordenación y lectura de la secuencia, días de grabación, progreso y marca «Ya grabado». SQL confirmó RLS y escritura, pero no el recorrido R4. También quedan pendientes el modo lectura a pantalla completa y las plantillas de stories.
- **Fase 7 sin comprobar en pantalla**: las tres pestañas de Email, los broadcasts y su semana, las ideas convertidas, el editor con formato y autoguardado, las tres copias, los envíos marcados a mano, las secuencias relativas y de fechas, la incorporación de correos existentes y las plantillas. SQL confirmó RLS, escritura y limpieza. El saneador de HTML se probó con Node, no en un navegador. No se ha pegado el cuerpo con formato en una plataforma de correo real, así que la validación del PRP sobre el formato al pegar sigue abierta.
- **Fase 8 sin comprobar en pantalla**: la lista y la ficha de lanzamientos, la línea de tiempo con sus hitos, el alta desde cero y desde plantilla, el editor de plantillas de Ajustes, la aplicación de una plantilla, las piezas por fase, el filtro de lanzamiento de la biblioteca, de los broadcasts y de la bandeja de ideas, y la asignación de lanzamiento y fase desde la ficha de la pieza. SQL confirmó RLS, siembra idempotente de las plantillas, escrituras, cascadas al borrar un lanzamiento y limpieza sin residuos; la lista de lanzamientos se comprobó con sesión (HTTP) y respondió con la oferta, el estado y el contador de piezas por escribir. Ninguna de estas pantallas se ha abierto con sesión en un navegador.
- **Fase 9 comprobada con sesión, no en un navegador**: se creó un usuario de pruebas con sus propios datos de ejemplo, se boronó al terminar (la base de datos quedó como estaba: 1 usuaria, 1 ajuste, 1 pilar, 2 plantillas de lanzamiento) y se comprobó por HTTP que `/hoy` y `/calendario` responden y muestran lo esperado. Sigue sin comprobarse el aspecto en pantalla, el comportamiento a 375 px, el arrastre con el ratón (no está hecho) y el copiado de un cuerpo con formato.
- **Fase 10, 11 y 12 comprobadas con sesión, no en un navegador**: se creó un usuario de pruebas con datos de ejemplo, se repasaron las 24 pantallas una a una (todas respondieron 200), se comprobó el ciclo de cargar y quitar el ejemplo (y que no borra lo propio) y se borró después el usuario y sus datos: la base quedó como estaba (1 usuaria, 1 ajuste, 1 pilar, 2 plantillas de lanzamiento). Sigue sin comprobarse el aspecto en pantalla, el ancho de 375 px, el copiado real, el arrastre con el ratón (no está hecho) y el funcionamiento de la app instalada.
- **Fallo encontrado y corregido al comprobar**: la ficha de pieza (`/piezas/[id]`) devolvía un error 500 desde la Fase 4 (función en línea usada como `action` de formulario en un componente de servidor). Corregido con una acción de servidor propia; ahora la pantalla abre.
- Sin comprobar en pantalla: comportamiento a 375 px (móvil) de toda la Fase 3, incluido «guardar una idea escribiendo y pulsando una vez».
- No se ha verificado el aspecto a 375 px ni a 1280 px.
- Sin comprobar en pantalla: edición de pilares, ofertas completas, recursos, y la hoja de captura (guardar, «guardar y escribir otra», borrador).
- Sin comprobar: el flujo de «Cerrar sesión» recién añadido.
- **Pruebas automáticas (Playwright, `e2e/`, 2026-11-17)**: R1, R2, R3, R4 y R6 con el usuario de pruebas (`scripts/usuario-prueba.mjs`; `E2E_EMAIL`/`E2E_PASSWORD` en `.env.local`). Resultado: ordenador 6/6 y móvil 5/5 (R3 solo se ejecuta en ordenador, como dice `docs/06`). Se lanzan con la app en marcha (`npm run dev`) y `npx playwright test --project=ordenador|movil`, un proyecto cada vez. `00-ejemplo` borra y recarga el ejemplo antes de cada tanda; las adaptaciones que crea R3 no son de ejemplo y se acumulan en la cuenta de pruebas. Faltan R5 y R7 (sin prueba escrita) y las capturas de pantalla para el informe. Una vez R2 falló con un «Failed to fetch» puntual del servidor de desarrollo y pasó al repetirlo.
- **Fallos de la app encontrados con las pruebas y corregidos**: (1) «Quitar ejemplo» dejaba 22 piezas por un `check` de `piezas` (migración `20261117000010`) y ahora informa de los errores de borrado; (2) reordenar stories podía dejar una tarjeta como «Story 0» (ahora se renumera la secuencia y el título usa la posición); (3) texto con codificación rota en la ficha de pieza («ClasificaciÃ³n»).
- El PRP tiene 5 decisiones pendientes (D1-D5); la usuaria aprobó las propuestas por defecto: Supabase en la nube (D1), cuenta única (D2), sin modo sin conexión (D3), contenido publicado de solo lectura (D4), nombre «Rosedal» como logo (D5).

## 9. Tareas de limpieza y seguridad pendientes

1. **Revocar el token de Supabase** (`SUPABASE_ACCESS_TOKEN`) cuando se terminen de crear tablas: supabase.com/dashboard/account/tokens. Da acceso a toda la cuenta. Mientras tanto vive solo en `.env.local`.
2. Ejecutar el asesor de seguridad de Supabase (RLS en todas las tablas, sin avisos) antes de la entrega.
3. Servidor de desarrollo: se ha reiniciado en varias fases y sigue en marcha en el puerto 3000 (separa con `Ctrl + C`).
4. Antes de la entrega: confirmar que no existe ningún `<input type="file">` salvo el de restaurar la copia de seguridad JSON; que no se pide ninguna clave a la usuaria; y que no hay llamadas a servicios de terceros.

## 10. Entrega final (Fase 13)

Sigue `docs/06-verificacion-y-entrega.md`: los siete recorridos paso a paso (R1 y R2 en viewport móvil), la lista de aceptación por módulo y el formato del informe (resumen que empieza por lo que no funciona, tabla de recorridos con capturas, fallos conocidos, no comprobado, no construido y decisiones tomadas). Entrega también: pasos de arranque (un LÉEME en español para alguien no técnico), cómo cargar y quitar el ejemplo (Ajustes → «Cargar ejemplo» / «Quitar ejemplo», `docs/04-datos-demo.md`), y la lista de pendientes. «Superado» significa ejecutado y visto funcionar; nada más.

### Informe de entrega (2026-11-17)

**Lo que no funciona, o no se sabe si funciona**

- **Ninguno de los siete recorridos está «superado»**: no se han ejecutado en un navegador con sesión, porque no hay credenciales de prueba ni acceso a la cuenta de la usuaria. Lo que sí hay es una comprobación por HTTP de las 24 pantallas con un usuario de prueba, que confirma que todas renderizan y que los datos aparecen donde deben.
- **El arrastre con el ratón no existe**: en el calendario se mueve una pieza con «Cambiar fecha». Es una decisión declarada desde la Fase 3 (dnd-kit no se instaló), no un fallo.
- **La app instalada no se ha probado** en un móvil real: el manifiesto y los iconos están, pero no se ha añadido a la pantalla de inicio ni se han probado los accesos directos.
- **La captura sin conexión** está implementada (cola en el dispositivo y reintento automático) pero no se ha probado en un tren sin cobertura.

**Recorridos (estado)**

| Recorrido | Estado | Qué se ha comprobado |
|---|---|---|
| R1 Frase en móvil y copiar | No comprobado | El banco de frases guarda y copia con los saltos de línea (SQL y código) |
| R2 Reel de prueba y registro | No comprobado | El reel de prueba se crea y el uso se registra una sola vez (SQL) |
| R3 Dos guiones y adaptación | No comprobado | El calendario muestra una pieza una sola vez (HTTP con sesión) |
| R4 Reordenar stories | No comprobado | Las tarjetas se suben y bajan y se guardan (SQL) |
| R5 El mismo correo desde dos sitios | No comprobado | El correo del lanzamiento se abre desde el lanzamiento y desde Email (HTTP con sesión) |
| R6 Revisión semanal | No comprobado | La revisión muestra lo que salió, lo que no y los datos pendientes (HTTP con sesión) |
| R7 (el que falte en `docs/06`) | No comprobado | — |

**Fallos conocidos y corregidos**

- La ficha de pieza (`/piezas/[id]`) devolvía un error 500 desde la Fase 4 por usar una función en línea como `action` de formulario en un componente de servidor. Corregido con una acción de servidor propia y comprobado con sesión.

**No comprobado**

- El aspecto en pantalla (375 px y 1280 px), el copiado real de un cuerpo con formato al pegarlo en un gestor de correo, el comportamiento de la captura sin conexión, la instalación de la app y el restaurado de una copia de seguridad (la validación con Zod y el «solo en cuenta vacía» sí están implementados).

**No construido**

- Publicación programada en redes, vista de cuadrícula de Instagram, biblioteca de medios, mejor hora para publicar, métricas automáticas, asistente de IA dentro de la app, página de enlaces, comentarios y equipo, notificaciones push y exportar el calendario a otras agendas: están descartadas en `docs/05-mejoras-de-mercado.md` y no se han construido.
- Del conjunto de mejoras de `docs/05`, se han construido A1 a A8 y B1 a B10.

**Decisiones tomadas**

- Cuenta única (D1), Supabase en la nube (D1), sin modo sin conexión completo (D3), el contenido publicado queda congelado (D4) y el nombre «Rosedal» como logo (D5).
- Las plantillas de lanzamiento, de correo y de stories vienen con la app y se siembran solas; el ejemplo de demostración es aparte y se quita sin tocar lo de la usuaria.

**Pasos de arranque**: `LEEME.md`.

**Ejemplo**: Ajustes → «Datos de ejemplo» → «Cargar ejemplo» / «Quitar ejemplo» (con el aviso de cuántos elementos se borran).

**Pendientes**

1. Ejecutar los siete recorridos en un navegador con sesión (es lo que falta para poder decir «superado») y guardar las capturas.
2. Mirar la app a 375 px y a 1280 px.
3. Revocar el token de Supabase (ver §9) y pasar el asesor de seguridad.
4. Montar las pruebas automáticas (Playwright) para el recorrido R1, como pide el PRP.
