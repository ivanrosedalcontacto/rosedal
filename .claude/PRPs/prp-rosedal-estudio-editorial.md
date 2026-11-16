# PRP-001: Rosedal, estudio editorial para creadora de contenido

> **Estado**: PENDIENTE
> **Fecha**: 2026-11-16
> **Proyecto**: Rosedal
> **Fuente de requisitos**: `instrucciones.txt` (raíz del proyecto). Ante cualquier duda, ese archivo manda sobre este documento.
> **Entregable de esta sesión**: este documento. No se ha escrito código.

---

## Objetivo

Una aplicación web en español, de uso individual, donde una creadora que vende servicios y productos online piensa qué publicar, lo escribe, lo organiza y lo planifica, y después registra a mano qué salió, cuándo y con qué resultado. Todo es texto, fechas, estados, etiquetas, métricas manuales y enlaces opcionales: la app no toca archivos multimedia ni se conecta a ningún servicio externo.

## Por Qué

| Problema | Solución |
|----------|----------|
| Las ideas llegan en cualquier momento y se pierden | Captura en móvil en dos toques: escribir y guardar; clasificar después |
| Una misma idea acaba en reel, stories y email sin relación visible | Modelo idea → piezas con origen trazable en ambos sentidos |
| Versiones de un guion o asunto ensucian el calendario | Las alternativas viven dentro de la pieza; el calendario muestra una sola entrada |
| No se sabe si un tema solo se usa para atraer y nunca para vender | Vista pilares × finalidades con acceso a las piezas de cada cruce |
| Lo planificado y lo que realmente salió se confunden | Fecha prevista y fecha real separadas, versión publicada congelada |
| Los resultados se apuntan mal: un cero parece un dato sin rellenar | Métricas manuales que distinguen cero de pendiente y venta confirmada de atribución desconocida |
| El email y los lanzamientos se planifican en herramientas distintas | Broadcasts, secuencias y lanzamientos comparten las mismas piezas |

**Valor de negocio**: un único sitio para todo el ciclo editorial (idea, redacción, planificación, registro), con captura en menos de 10 segundos desde el móvil y una revisión semanal que permite decidir qué repetir con datos propios.

## Qué

### Alcance y exclusiones (innegociable)

Dentro: texto, fechas, estados, etiquetas, métricas introducidas a mano, enlaces opcionales.

Fuera, y no debe aparecer ni como botón desactivado:
- Carga, almacenamiento, reproducción, visualización o análisis de imágenes, vídeo o audio.
- Publicación automática, envío de correos, conexión con redes sociales o con Kit.
- Llamadas a servicios de IA: «Copiar prompt» solo copia un texto al portapapeles.
- Multiusuario, equipos, roles, facturación.

Definiciones de dominio que el código debe respetar:
- **Reel**: ficha editorial (texto). **B-roll**: descripción escrita de un plano. **Story**: tarjeta de planificación con texto e indicaciones.
- Toda la app se usa sin adjuntar ningún archivo.

### Criterios de Éxito

Son los siete recorridos de `instrucciones.txt`, que deben comprobarse en la app en marcha:

- [ ] **R1**. En móvil guardo una frase, cierro la app y al volver la encuentro y la copio con sus saltos de línea intactos.
- [ ] **R2**. Planifico un reel de prueba con esa frase y una nota de plano. La frase sigue en «Sin usar» hasta que registro que lo publiqué fuera.
- [ ] **R3**. Preparo dos guiones para un reel y solo hay una entrada en el calendario. Al adaptar la idea a un email puedo darle otra finalidad y otra fecha.
- [ ] **R4**. Reordeno las tarjetas de una secuencia de stories y las leo en el orden en que las publicaré.
- [ ] **R5**. Edito un broadcast desde su lanzamiento y veo el cambio en Email marketing. El email de poscompra conserva su plazo relativo.
- [ ] **R6**. Reprogramo una publicación, registro después la fecha real y consulto sus resultados sin perder la planificación original.
- [ ] **R7**. Completo todo lo anterior solo con texto y acciones manuales: sin archivos multimedia, sin credenciales de redes y sin claves de servicios externos.

Además:
- [ ] Los datos de demostración se cargan y se retiran desde la propia app.
- [ ] Captura rápida usable con una mano a 375 px de ancho; redacción y calendario cómodos a 1280 px.
- [ ] Todas las tablas con RLS activo y sin avisos de seguridad pendientes.
- [ ] Entrega final con: pasos de arranque, cómo cargar el ejemplo, resumen de lo verificado y lista de lo pendiente o no comprobado.

### Comportamiento Esperado (Happy Path)

1. Abre la app en el móvil, pulsa «+ Idea» en Inicio, escribe la pregunta de una clienta y guarda. Queda en la bandeja de pendientes.
2. En el ordenador abre la idea, le pone pilar y oferta, explora ángulos y crea desde ella un reel, una secuencia de tres stories y un email. La idea muestra las tres piezas; cada pieza enlaza de vuelta a la idea.
3. En el reel escribe dos versiones del guion (gancho, desarrollo, cierre), elige una y marca la pieza como Lista. Como su finalidad es Convert, la ficha le pide oferta, acción y cómo realizarla, y avisa si falta algo.
4. Arrastra el reel al jueves en el calendario. Ocupa una entrada, igual que la secuencia de stories.
5. Reúne varias fichas en un «Día de grabación» y, desde el móvil, marca «Ya grabado» según avanza.
6. Publica por su cuenta. En la app marca Publicado, confirma la fecha real y pega la URL si quiere. La versión usada queda congelada.
7. En la revisión semanal introduce las métricas de lo publicado, crea una adaptación de lo que funcionó o fija una fecha para retomarlo.

---

## Contexto

### Hallazgos de la investigación (2026-11-16)

- La carpeta del proyecto solo contiene `instrucciones.txt` y `.claude/settings.local.json`. No hay código que aprovechar: se parte de cero con la pila estándar de la fábrica.
- No es un repositorio git todavía.
- No hay logo ni recursos de marca en la carpeta. Se usará el nombre «Rosedal» como texto. Si existe un logo, hay que pedirlo antes de la Fase 1 (no se redibuja ni se recolorea).
- Entorno comprobado: Node 22.16, npm 11.6, git 2.55, Windows 11.
- El proyecto tiene habilitados los conectores de Supabase, Playwright y Next DevTools, pero **Supabase respondió «Unauthorized» en esta sesión**: no hay proyecto de base de datos accesible. Es un bloqueo para la Fase 1 (ver Decisiones pendientes, D1).

### Referencias

- `instrucciones.txt`: requisitos completos del producto y recorridos de comprobación.
- `CLAUDE.md` (raíz del proyecto): reglas innegociables y orden de lectura.
- `docs/00-vision-y-alcance.md`: para quién es, conceptos clave, glosario.
- `docs/01-pantallas-contenido.md` y `docs/02-pantallas-planificacion.md`: detalle de cada pantalla. Leer la sección correspondiente al entrar en cada fase.
- `docs/03-diseno-visual.md`: paleta con contrastes calculados, tipografía y componentes. **Sustituye** a los valores de partida del apartado «Sistema visual» de este PRP.
- `docs/04-datos-demo.md`: textos y fechas exactos del ejemplo y contenido de las plantillas de partida.
- `docs/05-mejoras-de-mercado.md`: mejoras añadidas al encargo y **ampliaciones del modelo de datos** (columnas y tablas que se suman a las de este PRP).
- `docs/06-verificacion-y-entrega.md`: los siete recorridos paso a paso, lista de aceptación y formato del informe final.
- `C:\Users\carry\.claude\PRPs\prp-base.md`: plantilla y pila estándar.
- `C:\Users\carry\.claude\skills\bucle-agentico\`: cómo se ejecuta este PRP fase a fase.
- Documentación a consultar al entrar en cada fase (no fiarse de la memoria): Next.js 16 (App Router, Server Actions, `proxy.ts`), `@supabase/ssr`, dnd-kit (sortable y arrastre entre contenedores), Tiptap (StarterKit + Link), API de portapapeles (`ClipboardItem` con `text/html`).

### Pila

| Capa | Tecnología | Nota |
|------|------------|------|
| Framework | Next.js 16 + React 19 + TypeScript estricto | App Router, Server Components y Server Actions |
| Estilos | Tailwind CSS 3.4 | Tokens de color en la configuración |
| Datos | Supabase (Postgres + Auth) | RLS en todas las tablas |
| Validación | Zod | En toda entrada de usuario y en los JSON de plantillas |
| Estado de interfaz | Zustand | Solo filtros, hoja de captura y preferencias de vista |
| Arrastrar y ordenar | dnd-kit | Calendario, tablero, tarjetas de stories, pasos de secuencia |
| Texto con formato | Tiptap | Solo en el cuerpo de los emails |
| Fechas | date-fns con locale `es` | Semana de lunes a domingo |
| Pruebas | Playwright | Los siete recorridos, R1 y R2 en viewport móvil |

Sin más dependencias salvo necesidad demostrada. Arranque siempre con `npm run dev`.

### Decisiones de arquitectura

1. **La pieza es la entidad central.** Reels, carruseles, posts, secuencias de stories y emails son filas de la misma tabla `piezas`, diferenciadas por `formato`. El calendario, el tablero, los filtros, los lanzamientos y la revisión leen de ahí. Esto garantiza por diseño «una entrada en el calendario» y «el mismo correo desde dos sitios».
2. **Las versiones cuelgan de la pieza.** Guiones y asuntos alternativos son filas de `pieza_versiones` con una sola marcada como elegida. Nunca generan piezas nuevas.
3. **Adaptar y reutilizar crean piezas nuevas enlazadas.** Mediante `origen_pieza_id` y `relacion_origen`. La adaptación hereda la idea; la reutilización parte de la versión publicada.
4. **Lo publicado se congela.** Al marcar Publicado o Enviado se guarda una instantánea del contenido exacto. A partir de ahí el contenido es de solo lectura; cambiarlo implica «Reutilizar».
5. **«Sin usar» es un dato derivado**, no una columna: una frase está sin usar si no tiene filas en `frase_usos`. Copiar o planificar no crea usos.
6. **Fechas de calendario como `date`**, nunca como instante con zona horaria. Fecha prevista y fecha real son columnas distintas.
7. **Usuario único con inicio de sesión.** Un solo acceso por correo y contraseña, registro cerrado. Todas las filas llevan `user_id` y RLS, aunque solo haya una usuaria.
8. **Un email pertenece como máximo a una secuencia.** Las secuencias son de dos clases: de plazos relativos (bienvenida, poscompra, upsell) o de fechas fijas (lanzamiento). Solo los emails con fecha fija aparecen en el calendario.
9. **Plantillas en una sola tabla** con estructura JSON validada con Zod (lanzamiento, stories, secuencia de email).
10. **Datos de ejemplo marcados** con `es_demo` para poder retirarlos sin tocar nada de la usuaria.

### Arquitectura Propuesta (Feature-First)

```
src/
├── app/
│   ├── (auth)/login/
│   └── (app)/
│       ├── hoy/                    # Inicio
│       ├── ideas/                  # bandeja, brainstorming, ficha de idea
│       ├── biblioteca/             # lista y tablero
│       ├── piezas/[id]/            # ficha única para cualquier formato
│       ├── grabacion/              # días de grabación
│       ├── frases/
│       ├── email/                  # ideas, broadcasts, secuencias
│       ├── calendario/
│       ├── ofertas/
│       ├── lanzamientos/
│       ├── mapa/                   # pilares × finalidades
│       ├── revision/               # revisión semanal
│       ├── recursos/               # recursos de marca
│       └── ajustes/                # pilares, perfil, plantillas, datos de ejemplo
├── features/
│   ├── captura/        ideas/          piezas/        versiones/
│   ├── frases/         stories/        grabacion/     email/
│   ├── ofertas/        lanzamientos/   calendario/    hoy/
│   ├── revision/       mapa/           recursos/      plantillas/
│   └── demo/
│       (cada una con components/, hooks/, services/, store/, types/ según necesite)
├── shared/
│   ├── components/     # botones, etiquetas, hojas, diálogos, estado vacío
│   ├── constants/      # finalidades, formatos, canales, estados, métricas, ángulos
│   ├── lib/            # supabase (cliente/servidor), fechas, portapapeles
│   └── types/
└── supabase/migrations/
```

Navegación:
- **Móvil**: barra inferior con Hoy, Calendario, botón central «+» (hoja de captura), Biblioteca y Más.
- **Ordenador**: barra lateral con Hoy, Ideas, Biblioteca, Frases, Email, Calendario, Lanzamientos, Ofertas, Mapa, Revisión, Recursos y Ajustes.

### Modelo de Datos

Este es el modelo base. `docs/05-mejoras-de-mercado.md` añade columnas y tablas (apartado «Añadidos al modelo de datos») que forman parte del modelo final.

Convenciones para **todas** las tablas:
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null default auth.uid() references auth.users(id)`
- `es_demo boolean not null default false`
- `created_at`, `updated_at timestamptz not null default now()` (disparador para `updated_at`)
- RLS activo con política `user_id = (select auth.uid())` para leer, insertar, actualizar y borrar. Índice en `user_id` y en cada clave foránea.
- Enumerados como `text` con `check`, reflejados en constantes TypeScript y esquemas Zod (una sola fuente por enumerado).

```sql
-- Patrón a repetir en cada tabla
alter table piezas enable row level security;
create policy "propietaria" on piezas for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
```

#### Catálogos y contexto

| Tabla | Columnas propias | Notas |
|-------|------------------|-------|
| `ajustes` | `audiencia_general text`, `tono_general text` | Una fila por usuaria. Alimenta el prompt de ángulos |
| `pilares` | `nombre`, `descripcion`, `color`, `orden int`, `archivado bool` | Creados y editados por la usuaria |
| `ofertas` | `nombre`, `tipo` (`producto`, `servicio`), `publico`, `problema`, `propuesta_valor`, `objeciones text`, `via_compra text`, `via_compra_url text null`, `activa bool` | `via_compra` admite tanto un enlace como «Escríbeme SESIÓN por privado» |
| `recursos_marca` | `tipo` (`tono`, `cta`, `testimonio`, `plano`, `enlace_venta`), `titulo`, `texto`, `url text null`, `oferta_id null` | Biblioteca textual. Los CTA y planos se pueden insertar en una pieza |
| `plantillas` | `tipo` (`lanzamiento`, `stories`, `secuencia_email`), `nombre`, `descripcion`, `contenido jsonb` | Estructura validada con Zod por tipo |

#### Ideas

| Tabla | Columnas propias | Notas |
|-------|------------------|-------|
| `ideas` | `texto`, `tipo` (`idea`, `idea_email`, `pregunta`, `objecion`), `estado` (`pendiente`, `en_desarrollo`, `archivada`), `pilar_id null`, `oferta_id null`, `lanzamiento_id null`, `tema text null`, `problema_audiencia text null`, `palabras_originales text null`, `procedencia text null`, `veces_aparecida int default 1`, `relevancia smallint null` (1 a 3), `demanda smallint null` (1 a 3), `minutos_preparacion int null`, `notas` | Solo `texto` es obligatorio. Los cuatro campos de agrupación del brainstorming son `tema`, `pilar_id`, `oferta_id` y `problema_audiencia` |
| `idea_angulos` | `idea_id`, `tipo` (`tutorial`, `historia_personal`, `error_frecuente`, `demostracion`, `caso_real`, `objecion_compra`, `otro`), `nota` | Desde un ángulo se puede crear una pieza |

#### Piezas

`piezas`:

| Grupo | Columnas |
|-------|----------|
| Origen | `idea_id null`, `origen_pieza_id null`, `relacion_origen null` (`adaptacion`, `reutilizacion`), `angulo text null`, `frase_id null` |
| Clasificación | `titulo`, `formato` (`reel`, `reel_prueba`, `carrusel`, `post`, `stories`, `email`, `otro`), `canal` (`instagram`, `tiktok`, `youtube`, `linkedin`, `email`, `otro`), `pilar_id null`, `finalidad null` (`attract`, `nurture`, `position`, `convert`) |
| Campaña | `oferta_id null`, `lanzamiento_id null`, `fase_id null` |
| Llamada a la acción | `cta_accion text null` (qué pido), `cta_como text null` (cómo se hace), `cta_url text null` |
| Contenido | `texto_publicacion`, `texto_en_pantalla`, `notas` |
| Email | `email_preview text null`, `email_cuerpo_html text null`, `email_tematica text null`, `email_audiencia text null` |
| Grabación | `plano text null`, `preparacion text null`, `duracion_seg int null`, `grabado bool default false`, `grabado_en timestamptz null` |
| Planificación | `estado` (`borrador`, `en_preparacion`, `listo`, `planificado`, `publicado`), `fecha_prevista date null`, `fecha_real date null`, `url_publicada text null`, `retomar_el date null` |
| Congelado | `publicado_snapshot jsonb null` |

| Tabla | Columnas propias | Notas |
|-------|------------------|-------|
| `pieza_versiones` | `pieza_id`, `tipo` (`guion`, `asunto`), `nombre`, `gancho`, `desarrollo`, `cierre`, `asunto`, `elegida bool`, `orden int` | Índice único parcial: una sola `elegida` por pieza y tipo |
| `story_tarjetas` | `pieza_id`, `orden int`, `titulo`, `que_digo`, `texto_pantalla`, `visual` (imagen o plano a preparar, descrito), `interaccion` (`ninguna`, `encuesta`, `pregunta`, `enlace`, `cta`), `interaccion_detalle` | Solo para piezas con `formato = 'stories'` |
| `metricas` | `pieza_id`, `clave`, `valor numeric(12,2) null`, `atribucion null` (`confirmada`, `desconocida`), `nota` | Único por (`pieza_id`, `clave`). Ver reglas de métricas |

#### Frases

| Tabla | Columnas propias | Notas |
|-------|------------------|-------|
| `frases` | `texto`, `favorita bool`, `frase_origen_id null`, `notas`, `archivada bool` | `texto` se guarda tal cual, con sus saltos de línea. Una variante apunta a su origen |
| `frase_usos` | `frase_id`, `pieza_id null`, `fecha date`, `url text null`, `texto_usado text` | `texto_usado` es la copia exacta en el momento del uso |

#### Grabación

| Tabla | Columnas propias |
|-------|------------------|
| `sesiones_grabacion` | `nombre`, `fecha date null`, `notas` |
| `sesion_piezas` | `sesion_id`, `pieza_id`, `orden int`; único por (`sesion_id`, `pieza_id`) |

#### Email

| Tabla | Columnas propias | Notas |
|-------|------------------|-------|
| `secuencias_email` | `nombre`, `tipo` (`bienvenida`, `lanzamiento`, `poscompra`, `upsell`, `otra`), `programacion` (`relativa`, `fechas`), `audiencia`, `disparador`, `objetivo`, `oferta_id null`, `lanzamiento_id null` | `disparador` es texto libre: «compra el curso» |
| `secuencia_pasos` | `secuencia_id`, `pieza_id` (único), `orden int`, `plazo_cantidad int null`, `plazo_unidad null` (`horas`, `dias`) | El plazo se cuenta desde el paso anterior; el del primer paso, desde el disparador |

#### Lanzamientos

| Tabla | Columnas propias | Notas |
|-------|------------------|-------|
| `lanzamientos` | `nombre`, `oferta_id`, `objetivo`, `fecha_inicio date`, `fecha_fin date`, `estado` (`en_preparacion`, `en_curso`, `terminado`) | |
| `lanzamiento_fases` | `lanzamiento_id`, `tipo` (`expectacion`, `apertura`, `venta`, `cierre`, `seguimiento`), `nombre`, `fecha_inicio date`, `fecha_fin date`, `orden int`, `notas` | |
| `lanzamiento_hitos` | `lanzamiento_id`, `fase_id null`, `titulo`, `fecha date`, `hecho bool` | Se muestran en el calendario y en Hoy |

#### Revisión

| Tabla | Columnas propias |
|-------|------------------|
| `revisiones_semanales` | `semana_inicio date` (lunes, único por usuaria), `notas`, `completada bool` |

### Reglas de negocio

**Estados de una pieza**
- Un único enumerado para todos los formatos. En emails, `publicado` se muestra como «Enviado».
- Asignar fecha a una pieza en Listo la pasa a Planificado. Quitar la fecha a una pieza Planificada la devuelve a Listo. Planificado exige fecha prevista.
- Marcar Publicado pide la fecha real (hoy por defecto) y una URL opcional, y genera `publicado_snapshot` con: versión elegida, texto de publicación, texto en pantalla, llamada a la acción y, según formato, tarjetas de stories o asunto, vista previa y cuerpo del email.
- Una pieza publicada no admite cambios de contenido ni se arrastra en el calendario. Sí admite fecha real, URL, métricas y `retomar_el`.
- «Deshacer publicación» existe, pide confirmación y borra la instantánea, la fecha real, la URL y el uso de frase que hubiera generado. Las métricas se conservan.
- «Ya grabado» es una marca independiente del estado y nunca lo cambia.

**Versiones, adaptaciones y reutilización**
- «Probar otra versión»: nueva fila en `pieza_versiones` (se puede duplicar una existente). Elegir una desmarca la anterior. Si solo hay una versión, es la elegida.
- «Crear adaptación»: nueva pieza con `relacion_origen = 'adaptacion'`, la misma `idea_id`, pilar, oferta y lanzamiento heredados y el texto como punto de partida. Formato, canal y finalidad se preguntan. Nace en Borrador y sin fecha.
- «Reutilizar»: solo sobre piezas publicadas. Nueva pieza con `relacion_origen = 'reutilizacion'`, contenido tomado de la instantánea, en Borrador, sin fecha y sin métricas. La original no cambia.
- La ficha de una idea lista todas sus piezas. La ficha de una pieza muestra su idea, su pieza de origen y las piezas derivadas de ella.

**Finalidad Convert**
- Al elegir Convert se muestran oferta, acción pedida y cómo realizarla. Al elegir oferta se propone su `via_compra` como «cómo realizarla», editable.
- Si la pieza pasa a Listo (o más allá) con Convert y falta oferta, acción o cómo realizarla, se muestra un aviso. No bloquea el cambio y permanece visible en la ficha, el tablero y Hoy hasta que se complete.

**Frases**
- Guardar exige que haya algún carácter que no sea espacio, pero el texto se almacena sin recortar ni normalizar. Se muestra con saltos de línea preservados.
- «Copiar frase» copia el texto exacto y no crea uso. «Planificar reel de prueba» tampoco.
- «Planificar reel de prueba» crea una pieza con `formato = 'reel_prueba'`, `frase_id`, `texto_en_pantalla` igual a la frase, finalidad Attract, `duracion_seg = 7`, y opcionalmente nota de plano y fecha prevista.
- Al publicar esa pieza se crea el uso automáticamente. «Registrar uso» crea uno manual con fecha y URL opcional.
- Una frase usada sigue pudiéndose copiar, planificar y variar; pasa al filtro «Ya utilizadas» y muestra su historial con el texto exacto de cada ocasión.
- «Elegir una para hoy» escoge al azar entre las que cumplen los filtros y la búsqueda activos.

**Email**
- Vista Broadcasts: emails que no son paso de una secuencia relativa. Pestañas «Esta semana» (fecha prevista en la semana en curso), «Sin fecha» y «Enviados».
- Secuencia `relativa`: sus pasos tienen plazo y no tienen fecha prevista; nunca aparecen en el calendario. La cronología muestra el plazo de cada paso y el día acumulado desde el disparador.
- Secuencia `fechas`: sus pasos son emails con fecha prevista; aparecen en el calendario y en Broadcasts.
- «Incorporar un email existente»: en una secuencia de fechas enlaza el mismo email; en una relativa crea una copia enlazada como reutilización, porque un correo ya fechado o enviado no puede ser a la vez un paso automático.
- En los pasos relativos no existe Planificado, y Publicado se muestra como «En marcha» (ya cargado en la plataforma externa).
- Convertir una idea de email en broadcast o en paso crea la pieza con `idea_id` y pasa la idea a «en desarrollo».
- Autoguardado con indicador visible («Guardando…», «Guardado»). Tres acciones de copia: asunto elegido, texto de vista previa y cuerpo con formato (HTML y texto plano a la vez).

**Calendario**
- Muestra piezas con fecha y los hitos de lanzamiento. Una pieza publicada se sitúa en su fecha real e indica la prevista si difiere.
- Bandeja «Sin fecha»: piezas sin fecha prevista que no están publicadas, excluidos los pasos de secuencias relativas.
- Reprogramar cambia solo `fecha_prevista`. Registrar la publicación escribe solo `fecha_real`. Ninguna operación sobrescribe una con la otra.
- En ordenador se arrastra entre días y desde la bandeja. En móvil se cambia con un selector de fecha en la tarjeta.

**Hoy**
- «Qué tengo que preparar»: piezas con fecha en los próximos 7 días aún en Borrador o En preparación, piezas con `retomar_el` vencido, avisos de Convert incompletos y el próximo día de grabación.
- «Qué publico o envío hoy»: piezas con fecha prevista hoy sin publicar, más las atrasadas de días anteriores, señaladas como tales.
- «Próximo hito»: el siguiente hito sin hacer de los lanzamientos no terminados, con la fase en curso.
- Arriba, siempre visibles: «+ Idea», «+ Frase para B-roll» y «+ Idea de email».

**Métricas y revisión semanal**
- Catálogo fijo de claves: `alcance`, `nuevos_seguidores`, `respuestas`, `conversaciones`, `consultas_metodo`, `solicitudes`, `reservas`, `compras`, `ingresos`, `aperturas`, `clics`.
- Sugeridas por finalidad: Attract (alcance, nuevos seguidores), Nurture (respuestas, conversaciones), Position (consultas que mencionan el método), Convert (solicitudes, reservas, compras, ingresos). La usuaria puede añadir cualquier otra del catálogo.
- Sin fila: métrica no seguida. Fila con `valor` nulo: dato pendiente. Fila con `valor = 0`: cero real. La interfaz los distingue siempre (campo vacío con «Pendiente» frente a «0»).
- En `compras`, `reservas` e `ingresos` se indica la atribución: confirmada o desconocida.
- La revisión de una semana lista las piezas con fecha real en esa semana y las que arrastran datos pendientes. Desde cada una: «Crear adaptación», «Reutilizar» y «Retomar el…» (fija `retomar_el`).

**Mapa pilares × finalidades**
- Tabla con pilares en filas y las cuatro finalidades en columnas, más «Sin pilar» y «Sin finalidad». Cada celda muestra el número de piezas y abre la biblioteca filtrada por ese cruce.
- Filtros por periodo, lanzamiento y estado. No hay objetivos ni alertas de equilibrio: la usuaria interpreta.

**Ideas y brainstorming**
- Captura: un campo de texto y «Guardar». Nada más es obligatorio.
- Brainstorming: las mismas ideas agrupadas por la dimensión elegida (tema, pilar, oferta o problema de la audiencia), con arrastre entre grupos en ordenador y selector en móvil.
- Preguntas y objeciones: palabras originales, procedencia y contador de veces, con botón «Ha vuelto a aparecer».
- Búsqueda combinable: texto, lanzamiento, oferta, pilar, relevancia, demanda y tiempo máximo de preparación.
- «Copiar prompt para explorar ángulos»: compone un texto con la idea, la audiencia (de la oferta o de Ajustes), la oferta y el tono (Ajustes y recursos de tono), y lo copia.

**Lanzamientos**
- Cada fase lista sus piezas con formato, finalidad y estado, y separa las que quedan por escribir (Borrador o En preparación).
- Aplicar una plantilla crea fases, hitos y piezas en Borrador con fechas calculadas desde la fecha de apertura. Todo lo creado es editable y eliminable.
- Dos plantillas de partida, editables: lanzar un servicio y lanzar un producto digital.
- El contenido habitual convive con el de campaña: el calendario muestra ambos y distingue las piezas de lanzamiento con una marca; se filtra por lanzamiento.

**Datos de ejemplo**
- En Ajustes: «Cargar ejemplo» y «Quitar ejemplo». Quitar borra únicamente filas con `es_demo = true`, muestra antes cuántas son y pide confirmación.
- Las fechas del ejemplo se calculan respecto al día de la carga para que la semana en curso tenga contenido.

### Sistema visual

Simple, minimalista, luminoso. El blanco domina; verde y rosa claros acompañan. La paleta definitiva, con contrastes calculados, está en `docs/03-diseno-visual.md` y prevalece sobre esta tabla.

| Token | Valor de partida | Uso |
|-------|------------------|-----|
| `fondo` | `#FFFFFF` | Fondo general y tarjetas |
| `verde-50` | `#F2F7F2` | Superficies secundarias, barra lateral |
| `verde-200` | `#D9E7DA` | Bordes suaves, etiquetas |
| `verde-700` | `#4F7059` | Acción principal, texto de acento |
| `rosa-50` | `#FCF1F3` | Resaltados, avisos suaves |
| `rosa-200` | `#F3D3DA` | Etiquetas, estados |
| `rosa-700` | `#A4556A` | Acento secundario, avisos |
| `tinta` | `#2A2E2B` | Texto principal |
| `tinta-suave` | `#6A716C` | Texto secundario |

- Los valores son de partida: comprobar contraste AA de texto sobre cada fondo y ajustar el tono si no llega.
- Finalidades: Attract (verde claro), Nurture (rosa claro), Position (verde intenso), Convert (rosa intenso). Siempre con su nombre escrito; el color nunca es la única señal.
- Tipografía: una serif suave para títulos y una sans legible para el resto, cargadas con `next/font`.
- Mucho aire, bordes finos, esquinas redondeadas, sin sombras marcadas ni degradados.
- Objetivos táctiles de 44 px como mínimo. Estados vacíos con una frase y una acción.
- Etiquetas de interfaz en español: Atraer, Cultivar la relación, Posicionarme, Convertir, con el término inglés como apoyo (por ejemplo «Attract · Atraer»).

### Datos de demostración

Una creadora que vende un curso y una asesoría individual:

- 2 ofertas (curso como producto digital, asesoría como servicio), con público, problema, propuesta de valor, objeciones y vía de compra. Una usa enlace y la otra «Escríbeme SESIÓN por privado».
- 3 o 4 pilares, ajustes de audiencia y tono, y algunos recursos de marca de cada tipo.
- La idea «¿Cómo sé si me basta con el curso o necesito una asesoría individual?», registrada como pregunta con procedencia y veces aparecida, con ángulos explorados, de la que salen:
  - un reel con dos versiones de guion que difieren en el gancho, una elegida;
  - una secuencia de tres stories (plantear la pregunta, encuesta, responder e invitar a escribir);
  - un email de lanzamiento, con finalidad distinta a la del reel.
- Un lanzamiento del curso con las cinco fases, hitos y piezas repartidas, algunas por escribir.
- Tres broadcasts en la semana en curso, con asuntos alternativos.
- Una secuencia poscompra de plazos relativos (por ejemplo: inmediato, 3 días, 7 días).
- 6 a 8 frases para reels de prueba: alguna con saltos de línea, alguna favorita, una ya utilizada con su historial y otra con un reel de prueba planificado y aún sin usar.
- Una pieza publicada con fecha real distinta de la prevista y métricas que incluyan un cero, un dato pendiente y una venta con atribución desconocida.
- Más ideas sueltas en la bandeja, con prioridades y tiempos, de modo que la búsqueda «para este lanzamiento en 30 minutos» devuelva resultados.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo se definen FASES. Las subtareas se generan al entrar en cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar).
> Cada fase incluye su propia migración de base de datos, con RLS, y termina con la app arrancando sin errores.

### Fase 1: Cimientos
**Objetivo**: Proyecto creado con la pila acordada, base de datos conectada, inicio de sesión de usuaria única, sistema visual aplicado y navegación completa (móvil y ordenador) con todas las secciones como pantallas vacías.
**Validación**: Se inicia sesión, se navega por todas las secciones a 375 px y a 1280 px, y una ruta protegida redirige al acceso si no hay sesión.

### Fase 2: Catálogos y contexto
**Objetivo**: Pilares, ofertas, recursos de marca y ajustes de audiencia y tono se crean, editan y archivan.
**Validación**: Tras recargar, los datos persisten; una oferta admite como vía de compra tanto un enlace como una instrucción escrita.

### Fase 3: Ideas, captura rápida y brainstorming
**Objetivo**: Los tres accesos de captura desde Inicio, bandeja de pendientes, ficha de idea con prioridad y ángulos, preguntas y objeciones con contador, agrupación por las cuatro dimensiones, búsqueda combinada y «Copiar prompt».
**Validación**: En móvil una idea se guarda escribiendo y pulsando una vez; la búsqueda por lanzamiento y 30 minutos devuelve lo esperado; el prompt copiado contiene idea, audiencia, oferta y tono.

### Fase 4: Piezas y biblioteca
**Objetivo**: Ficha única de pieza con clasificación, editor de guion por versiones, estados, bloque Convert con aviso, adaptación y reutilización, y biblioteca en lista y tablero con filtros combinables y búsqueda.
**Validación**: Una idea muestra sus piezas y cada pieza vuelve a su origen; dos versiones conviven con una elegida; el aviso de Convert aparece al marcar Listo sin llamada a la acción; publicar congela el contenido.

### Fase 5: Banco de frases y reels de prueba
**Objetivo**: Captura con «Guardar» y «Guardar y escribir otra», tarjetas con favoritos, búsqueda y filtros, elección al azar, copia exacta, planificación de reel de prueba, registro de uso, variantes e historial.
**Validación**: Recorridos R1 y R2 en viewport móvil.

### Fase 6: Stories y día de grabación
**Objetivo**: Editor de tarjetas ordenables con duplicado, lectura de la secuencia completa y guardado como plantilla; sesiones de grabación con guion elegido, plano, preparación, duración y marca «Ya grabado».
**Validación**: Recorrido R4; marcar «Ya grabado» no altera el estado de la pieza.

### Fase 7: Email marketing
**Objetivo**: Ideas de email, broadcasts con sus tres pestañas y editor con autoguardado, asuntos alternativos y cuerpo con formato; secuencias relativas y de fechas con pasos ordenables, incorporación de emails existentes y plantillas; las tres acciones de copia; envío marcado a mano con versión conservada.
**Validación**: Un paso de poscompra muestra su plazo relativo y no aparece entre los broadcasts fechados; el cuerpo copiado conserva formato al pegarlo en un editor externo.

### Fase 8: Ofertas en uso y lanzamientos
**Objetivo**: Lanzamientos con oferta, objetivo, fechas, fases e hitos; vista por fase con piezas previstas, su finalidad y las que quedan por escribir; dos plantillas editables aplicables.
**Validación**: Recorrido R5; aplicar una plantilla genera fases, hitos y piezas en borrador con fechas coherentes.

### Fase 9: Calendario y Hoy
**Objetivo**: Calendario semanal y mensual con hitos, bandeja sin fecha, todos los filtros, arrastre en ordenador y cambio de fecha en móvil, fecha prevista y real separadas; pantalla Hoy con sus tres respuestas y los accesos de captura.
**Validación**: Recorridos R3 y la parte de reprogramación de R6; Hoy refleja correctamente una pieza para hoy, una atrasada y el próximo hito.

### Fase 10: Revisión semanal y mapa
**Objetivo**: Registro de métricas con sus tres estados y atribución, revisión por semana con acciones de adaptar, reutilizar y retomar, y vista pilares × finalidades enlazada a la biblioteca.
**Validación**: Recorrido R6 completo; un cero y un pendiente se ven distintos; cada celda del mapa abre las piezas de su cruce.

### Fase 11: Datos de ejemplo
**Objetivo**: Carga y retirada del ejemplo desde Ajustes con el contenido exacto de `docs/04-datos-demo.md`, y plantillas de partida de lanzamiento, stories y secuencias de correo.
**Validación**: Con la cuenta vacía, cargar el ejemplo deja todas las secciones con contenido; quitarlo no elimina ninguna fila creada a mano. Los siete recorridos de `docs/06-verificacion-y-entrega.md` se superan sobre el ejemplo.

### Fase 12: Mejoras de mercado
**Objetivo**: Las mejoras de `docs/05-mejoras-de-mercado.md` que no se hayan construido ya con su módulo: primero las de prioridad A, después las de prioridad B. Solo se abre con los siete recorridos superados.
**Validación**: Cada mejora construida se comprueba en la app; los siete recorridos siguen superándose. Las no construidas se declaran en la entrega.

> Nota sobre las ampliaciones del modelo: las columnas y tablas de `docs/05-mejoras-de-mercado.md` que describen las pantallas base (objeciones con respuesta, historial de fechas, hora prevista, nombre de marca, autorización de testimonios, nota de aprendizaje, casilla de preparado) se crean en la fase del módulo al que pertenecen, no en la Fase 12. El historial de fechas (A8) y la vista de bandeja (A7) se construyen con el calendario y con el editor de correo.

### Fase 13: Validación final y entrega
**Objetivo**: Sistema funcionando de extremo a extremo y documentación de entrega, según `docs/06-verificacion-y-entrega.md`.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` termina sin errores
- [ ] Los siete recorridos R1 a R7 superados con Playwright (R1 y R2 en móvil) y con capturas
- [ ] Revisión de seguridad de la base de datos sin avisos (RLS en todas las tablas)
- [ ] Ningún campo de subida de archivos, ninguna clave externa pedida a la usuaria
- [ ] Entregados: pasos de arranque, cómo cargar el ejemplo, resumen de lo verificado y lista de lo pendiente o no comprobado

---

## Decisiones pendientes para la aprobación

| N.º | Decisión | Propuesta | Alternativa |
|-----|----------|-----------|-------------|
| D1 | Dónde viven los datos | Supabase, con la app publicada en internet para usarla igual desde móvil y ordenador. Requiere reconectar Supabase, que hoy no está autorizado | Base de datos local en el ordenador: no necesita ninguna cuenta, pero el móvil solo accede estando en la misma red wifi |
| D2 | Acceso | Una sola cuenta con correo y contraseña, registro cerrado | Sin acceso, solo válido si la app no sale del ordenador |
| D3 | Sin conexión | No funciona sin internet; el texto de una captura que falle al guardar se conserva en el dispositivo para reintentar | Captura sin conexión con sincronización posterior (más compleja, fuera de esta versión) |
| D4 | Contenido publicado | Queda de solo lectura; para cambiarlo se usa «Reutilizar» o «Deshacer publicación» | Editable siempre, perdiendo la garantía de «texto exacto que usé» |
| D5 | Logo | No hay logo en la carpeta: se usa el nombre como texto | Aportar el logo antes de empezar |

Nota sobre D1 y el recorrido R7: «sin claves de servicios externos» se interpreta como que la usuaria nunca introduce claves ni conecta cuentas para usar la app. La base de datos la configura la fábrica una vez. Si se prefiere que no exista ninguna cuenta externa en absoluto, se aplica la alternativa de D1 y cambian la pila de datos y las Fases 1 y 12.

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

*(vacío: se rellena durante la implementación)*

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] **Supabase no está autorizado** en el entorno actual. Resolver D1 antes de la Fase 1; no simular la base de datos con datos en memoria.
- [ ] **Inventario del entorno** antes de elegir herramientas: comprobar que Playwright y Next DevTools responden al empezar cada sesión. En Windows, `python` y no `python3`.
- [ ] **Next.js 16**: el interceptor de peticiones se llama `proxy.ts`, y `params`, `searchParams` y `cookies()` son asíncronos. Consultar la documentación vigente antes de escribir la protección de rutas.
- [ ] **Fechas**: `fecha_prevista` y `fecha_real` son `date`. No construir `new Date('AAAA-MM-DD')` para mostrarlas (se desplaza un día según la zona horaria). «Hoy» se calcula en la zona horaria de la usuaria (Europe/Madrid). La semana empieza en lunes.
- [ ] **Saltos de línea de las frases**: no aplicar `trim()` ni normalizar el texto al guardar; mostrar con `white-space: pre-wrap`; copiar el valor almacenado, no el texto renderizado.
- [ ] **Portapapeles**: solo funciona en contexto seguro (HTTPS o localhost) y tras un gesto de la usuaria. Para «Copiar cuerpo con formato» escribir `text/html` y `text/plain` a la vez, con alternativa a texto plano si el navegador no lo admite.
- [ ] **Cuerpo del email**: el HTML de Tiptap se guarda y se muestra saneado; limitar las extensiones a lo pedido (negrita, cursiva, listas, enlaces, títulos).
- [ ] **Tiptap y dnd-kit** solo en componentes de cliente; Tiptap con `immediatelyRender: false` para evitar errores de hidratación.
- [ ] **Autoguardado**: con retardo y sin pisar lo que se está escribiendo; avisar al salir si queda algo sin guardar. Con dos dispositivos abiertos gana la última escritura (aceptado en esta versión).
- [ ] **Arrastre en móvil**: el calendario no depende del arrastre en pantallas táctiles; el cambio de fecha por selector es la vía principal. En las tarjetas de stories, ofrecer además botones de subir y bajar.
- [ ] **Una elegida por pieza**: garantizarlo con índice único parcial y cambiar la elegida en una sola operación.
- [ ] **Uso de frase automático**: al publicar un reel de prueba se crea un único uso; «Deshacer publicación» lo elimina. No duplicar si se vuelve a publicar.
- [ ] **Retirada del ejemplo**: es un borrado masivo. Solo filas con `es_demo = true`, mostrando el recuento antes y con confirmación. Orden de borrado según las claves foráneas.
- [ ] **RLS con `(select auth.uid())`** en las políticas, e índice en `user_id`, para no penalizar el rendimiento.
- [ ] **Límites de la fábrica**: archivos de 500 líneas como máximo y funciones de 50. La ficha de pieza y el calendario son los candidatos a pasarse: dividirlos por bloques desde el principio.

## Anti-Patrones

- NO crear una tabla por formato (reels, emails, stories por separado): rompe el calendario único y el «mismo correo desde dos sitios».
- NO crear una pieza nueva para cada versión de guion o asunto.
- NO guardar «usada / sin usar» como columna en la frase.
- NO reutilizar la fecha prevista como fecha real ni sobrescribir una con la otra.
- NO representar un dato pendiente con un cero.
- NO añadir campos de subida de archivos, vistas previas de medios, integraciones ni llamadas a servicios de IA, ni siquiera como opción futura visible.
- NO pedir a la usuaria que ejecute comandos, edite archivos o introduzca claves.
- NO usar `any` (usar `unknown`), NO omitir Zod en entradas de usuario, NO crear tablas sin RLS.
- NO hardcodear enumerados en los componentes: una sola fuente en `shared/constants`.
- NO ignorar errores de TypeScript ni dejar avisos de la consola sin revisar.
- NO dar por comprobado un recorrido que no se haya ejecutado en la app en marcha: lo no verificado se declara en la entrega.

---

*PRP pendiente aprobación. No se ha modificado código.*
