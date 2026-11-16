# Continuar el desarrollo de Rosedal

Este archivo es para el agente de programación que retome el proyecto. Léelo entero antes de tocar nada. Está escrito el 2026-11-16 y refleja el estado real del código ese día.

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

**Fase 3 (parcial): captura rápida.** Migración `20261116000002_ideas_frases.sql` aplicada (tablas `ideas`, `idea_angulos`, `frases`; FK de `oferta_objeciones.idea_id`).
- `src/features/captura/`: hoja de captura (campo único, «Guardar» y «Guardar y escribir otra», borrador en `localStorage`, `Ctrl+Intro`), menú «+» en móvil y «Capturar» en barra lateral, tres botones en Hoy.
- Las capturas guardan: «+ Idea» y «+ Idea de email» → tabla `ideas` (tipos `idea` / `idea_email`); «+ Frase para B-roll» → tabla `frases` **sin recortar el texto** (los saltos de línea se conservan).

### Escrito pero no conectado (Fase 3, a medias)

Existen y compilan, pero **ninguna pantalla los usa todavía**:
- `src/features/ideas/esquemas.ts`: tipos, estados, ángulos, dimensiones de brainstorming, esquemas Zod.
- `src/features/ideas/acciones.ts`: `guardarIdea`, `crearPregunta`, `sumarAparicion`, `cambiarEstadoIdea`, `quitarIdea`, `moverIdea`, `crearIdeaEnColumna`, `guardarAngulo`, `quitarAngulo`.
- `src/features/ideas/prompt.ts`: `componerPrompt` para «Copiar prompt para explorar ángulos».

`src/app/(app)/ideas/page.tsx` sigue siendo la pantalla vacía provisional.

### Pendiente, en orden

**Terminar la Fase 3** (ver §6, es lo siguiente que hay que hacer).

Después, según el PRP (`## Blueprint`): Fase 4 piezas y biblioteca · 5 banco de frases y reels de prueba · 6 stories y día de grabación · 7 email marketing · 8 lanzamientos · 9 calendario y Hoy · 10 revisión semanal y mapa · 11 datos de ejemplo · 12 mejoras de mercado · 13 validación final y entrega. Sigue el método del skill `bucle-agentico`: al entrar en cada fase, **mapea el contexto real** (qué existe ya, qué tablas hay), genera las subtareas y entonces ejecuta. Cada fase termina con la app compilando y su validación del PRP cumplida.

Mejoras de `docs/05-mejoras-de-mercado.md`: van **después** de que los siete recorridos funcionen. Las columnas y tablas que describe (objeciones con respuesta, historial de fechas, hora prevista, etc.) se crean en la fase del módulo al que pertenecen. Ya están hechas: tabla `oferta_objeciones`, `nombre_marca` en `ajustes`, `autor`/`autorizado` en `recursos_marca`.

## 6. Qué falta exactamente de la Fase 3

Objetivo del PRP: «Los tres accesos de captura desde Inicio, bandeja de pendientes, ficha de idea con prioridad y ángulos, preguntas y objeciones con contador, agrupación por las cuatro dimensiones, búsqueda combinada y "Copiar prompt"». Detalle de pantallas en `docs/01-pantallas-contenido.md`, apartado «Ideas».

1. **`/ideas` con tres pestañas** (`?vista=bandeja|brainstorming|preguntas`, sin parámetro = bandeja). Divide en componentes de servidor dentro de `src/features/ideas/` para no pasar de 500 líneas por archivo.
2. **Bandeja**: ideas de tipo `idea` / `idea_email`, más reciente arriba, marca «Sin clasificar» si no tienen pilar, oferta ni tema. Filtros por GET (que se reflejen en la URL): texto (`q`, buscar en texto, tema, problema y notas; **sanea `q`** quitando `, ( ) % * \ "` antes de usarlo en `.or(...)`), tipo, estado, pilar, oferta, relevancia mínima y **tiempo máximo de preparación** (15 / 30 / 60 / más). Orden: recientes, prioridad (relevancia+demanda altas y poco tiempo primero; ordénalo en JS) y tiempo. El filtro por **lanzamiento** se añade en la Fase 8 (la columna `ideas.lanzamiento_id` existe sin FK todavía). La consulta de la usuaria «ideas para este lanzamiento que pueda preparar en 30 minutos» debe quedar resuelta con dos filtros y reflejada en la URL.
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
- No se ha verificado el aspecto a 375 px ni a 1280 px.
- Sin comprobar en pantalla: edición de pilares, ofertas completas, recursos, y la hoja de captura (guardar, «guardar y escribir otra», borrador).
- Sin comprobar: el flujo de «Cerrar sesión» recién añadido.
- No hay pruebas automáticas (Playwright) todavía; el PRP las exige en la Fase 13. Considera montarlas pronto y dejar el primer recorrido (R1: guardar una frase en móvil y copiarla) como base.
- El PRP tiene 5 decisiones pendientes (D1-D5); la usuaria aprobó las propuestas por defecto: Supabase en la nube (D1), cuenta única (D2), sin modo sin conexión (D3), contenido publicado de solo lectura (D4), nombre «Rosedal» como logo (D5).

## 9. Tareas de limpieza y seguridad pendientes

1. **Revocar el token de Supabase** (`SUPABASE_ACCESS_TOKEN`) cuando se terminen de crear tablas: supabase.com/dashboard/account/tokens. Da acceso a toda la cuenta. Mientras tanto vive solo en `.env.local`.
2. Ejecutar el asesor de seguridad de Supabase (RLS en todas las tablas, sin avisos) antes de la entrega.
3. Servidor de desarrollo en segundo plano posiblemente aún activo (puerto 3000).
4. Antes de la entrega: confirmar que no existe ningún `<input type="file">` salvo, si se construye, el de restaurar la copia de seguridad JSON; que no se pide ninguna clave a la usuaria; y que no hay llamadas a servicios de terceros.

## 10. Entrega final (Fase 13)

Sigue `docs/06-verificacion-y-entrega.md`: los siete recorridos paso a paso (R1 y R2 en viewport móvil), la lista de aceptación por módulo y el formato del informe (resumen que empieza por lo que no funciona, tabla de recorridos con capturas, fallos conocidos, no comprobado, no construido y decisiones tomadas). Entrega también: pasos de arranque (un LÉEME en español para alguien no técnico), cómo cargar y quitar el ejemplo (Ajustes → «Cargar ejemplo» / «Quitar ejemplo», `docs/04-datos-demo.md`), y la lista de pendientes. «Superado» significa ejecutado y visto funcionar; nada más.
