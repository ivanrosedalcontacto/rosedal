# PRP-002: Rediseño tras las pruebas de la usuaria

> **Estado**: APROBADO (2026-11-19)
> **Fecha**: 2026-11-19
> **Proyecto**: Rosedal (Fases 1-12 del PRP-001 construidas y en producción)
> **Fuente de requisitos**: comentarios de la usuaria tras usar la app (19-11-2026) y sus respuestas en la misma conversación. Sus palabras sustituyen a lo que decía `instrucciones.txt` en los puntos de «Cambios sobre el encargo original».

---

## Objetivo

Que la app siga la forma real de trabajar de la usuaria: piensa y crea **por pilares**, solo quiere ver lo que le **queda por grabar**, reparte la semana en el calendario **eligiendo pilar y pieza por día**, y quiere formularios con lo mínimo, sin buscadores y con un aspecto más cálido (rosa claro acompañando al verde).

## Por qué

| Lo que notó al usarla | Solución |
|---|---|
| La biblioteca es una lista plana con muchos filtros | Una tarjeta por pilar; dentro, sus piezas pendientes y «+ Nueva pieza» que ya queda en ese pilar |
| Lo ya grabado estorba | Selección múltiple → «Pasar a Ya grabadas»; desplegable cerrado por pilar con lo grabado |
| Los estados no son los suyos | Cuatro: Borrador · Grabado · Editado · Publicado |
| Formularios largos con campos que no usa | Nueva pieza: título, formato, finalidad. Ficha sin canal, pasos, duración, plano, preparación, notas, lanzamiento, fase ni enlace con seguimiento |
| Planificar la semana es lento y no se ve el reparto | Pulsar un día → pilar → pieza editada; la tarjeta muestra color del pilar, título y finalidad |
| Buscadores que no usa; filtros que alargan la pantalla | Fuera los buscadores; los filtros que quedan, en pestaña «Filtros» separada de «Resultados» |
| No usa la sección Grabación | Se quita |
| Demasiado verde | Tonos rosa claro que acompañan al verde |

## Cambios sobre el encargo original

La usuaria lo ha pedido expresamente; se aplican y se anotan en `continuar.md` y en el informe final:

| Encargo original | Ahora |
|---|---|
| `instrucciones.txt` l. 39: biblioteca con búsqueda por texto | Biblioteca por pilares, sin búsqueda |
| `instrucciones.txt` l. 43: vista «Día de grabación» | Sección Grabación eliminada |
| `instrucciones.txt` l. 52: frases con búsqueda | Frases sin búsqueda (se conservan favoritos y filtros, en pestaña) |
| PRP-001: estados Borrador · En preparación · Listo · Planificado · Publicado | Borrador · Grabado · Editado · Publicado |
| PRP-001: «Ya grabado» no cambia el estado | Grabado es un estado |
| `docs/06` R1 paso 5: buscar una frase | Localizarla en la lista |

## Decisiones tomadas (confirmadas por la usuaria)

| N.º | Decisión |
|---|---|
| D1 | Estados: **Borrador · Grabado · Editado · Publicado**. Un correo no se graba: pasa de Borrador a Editado y luego a Enviado |
| D2 | «Planificado» deja de ser estado: una pieza está programada si tiene día en el calendario |
| D3 | En el calendario solo se pueden programar piezas **Editadas** |
| D4 | Se quitan todos los buscadores de texto y la lupa de «Más»; **Ctrl + K se mantiene** en ordenador |
| D5 | Dentro de cada pilar de la biblioteca, lista sin filtros |
| D6 | Se quita la sección Grabación |
| D7 | Filtros que quedan (Ideas, Frases, Email, Mapa) en pestaña «Filtros»; «Resultados» abierta por defecto. Calendario sin filtros |

Decisiones técnicas por defecto (sin coste para ella, reversibles):

- Los campos que desaparecen **se ocultan en pantalla; las columnas se conservan** en la base de datos. Nada escrito se pierde.
- Las tablas de Grabación (`sesiones_grabacion`, `sesion_piezas`) se conservan sin uso; borrarlas sería un paso aparte.
- Lo publicado sigue congelado (regla 5 de `CLAUDE.md`): marcar Publicado guarda la copia exacta, igual que hoy.
- El canal se deduce del formato (email → email; resto → instagram).
- La sección Lanzamientos no se toca; solo desaparece el campo de la ficha de la pieza.

---

## Qué

### Criterios de éxito

- [ ] `/biblioteca` muestra una tarjeta por pilar activo (en el orden de Ajustes) más «Sin pilar» si hay piezas sin pilar. Un pilar nuevo aparece solo; uno archivado desaparece.
- [ ] Dentro de un pilar: lista de piezas en Borrador; «+ Nueva pieza» crea la pieza con ese pilar; casillas para seleccionar y acciones «Pasar a Ya grabadas» y «Enviar a la papelera»; desplegable «Ya grabadas (n)», cerrado por defecto, con Grabado, Editado y Publicado de ese pilar.
- [ ] Tablero de cuatro columnas (Borrador, Grabado, Editado, Publicado) para mover piezas de una a otra.
- [ ] Las piezas de producción migran sin perder ninguna: recuento antes y después cuadra.
- [ ] Nueva pieza pide título, formato y finalidad. La ficha no muestra canal, pasos, duración, plano, qué preparar, notas, lanzamiento, fase ni enlace con seguimiento.
- [ ] Calendario: pulsar un día → elegir pilar → elegir una pieza Editada sin fecha → queda en ese día. Cada tarjeta muestra el color del pilar, el título y debajo la finalidad. Sin filtros ni buscador.
- [ ] No queda ningún cuadro de búsqueda; Ctrl + K sigue funcionando en ordenador.
- [ ] Ideas, Frases, Email y Mapa con pestañas «Resultados» / «Filtros (n)» y «Quitar filtros».
- [ ] `/grabacion` no existe y nada enlaza a ella.
- [ ] Rosa claro visible en fondos de tarjeta, navegación activa y cabeceras, con contraste AA; el verde sigue en las acciones principales.
- [ ] `tsc`, `lint` y `build` pasan; e2e R1-R4 y R6 actualizadas y pasando (ordenador y móvil).

### Recorrido esperado

1. Abre la biblioteca y ve sus pilares como tarjetas de color con su recuento de pendientes.
2. Entra en «Tapping», pulsa «+ Nueva pieza», escribe título, elige Reel y Attract. Escribe el guion. Vuelve y crea otra en el mismo pilar.
3. Tras grabar, marca tres piezas y pulsa «Pasar a Ya grabadas»: desaparecen de la lista y el desplegable pasa a «Ya grabadas (3)».
4. Tras editarlas, en el tablero las pasa a Editado.
5. En el calendario pulsa el lunes → «Tapping» → elige la pieza. El lunes muestra la banda de color, el título y «Atraer». Hace lo mismo con otro pilar el martes.
6. Publica fuera y marca Publicado: se guarda la copia y sus resultados como hasta ahora.

---

## Contexto

### Hallazgos (2026-11-19)

- **Estados**: `ESTADOS_PIEZA` en `src/features/piezas/esquemas.ts` + `check` en `piezas.estado`. Los literales aparecen unas 53 veces en 23 archivos (acciones, Hoy, lanzamientos, email, mapa, plantillas, demo). `cambiarEstadoPieza` y `moverPiezaEnTablero` repiten la lista en `z.enum` sueltos. Email (`acciones-secuencias.ts`) y lanzamientos (`acciones.ts`) ponen `planificado` al fijar fecha.
- **Grabado duplicado**: columna `piezas.grabado` + `grabado_en`, botón «Ya grabado» en la ficha, «Sin grabar» en Hoy, sección `/grabacion` con `sesiones_grabacion`/`sesion_piezas` (también en `features/stories/acciones.ts`, siembra y copia de seguridad).
- **Biblioteca** (`features/piezas/biblioteca.tsx`): 13 filtros siempre abiertos, buscador `q`, vistas Lista/Tablero; ya carga pilares con color.
- **Nueva pieza** (`esquemaNuevaPieza`): no recibe `pilar_id`; hay que añadirlo.
- **Calendario** (`features/calendario/`): la consulta ya trae `pilar_id`, pero `tarjeta.tsx` no lo pinta; `filtros.tsx` siempre abierto; la bandeja tiene buscador.
- **Filtros**: `features/ideas/filtros.tsx` ya los pliega; Frases, Email (`broadcasts.tsx`) y Mapa (`mapa.tsx`) no.
- **Color**: tokens rosa ya definidos en `globals.css` (`rosa-50…800`, `frambuesa`) pero casi sin uso (7 frente a ~220 del verde). Contrastes comprobados en `docs/03`.
- **Pruebas**: `e2e/r1-frase.spec.ts` usa el buscador de Frases.

### Arquitectura

1. **Una sola constante de estados** alimenta Zod, el `check` y la interfaz; los `z.enum` sueltos pasan a usarla. Qué estados admite cada formato (email sin Grabado) vive en una tabla de constantes.
2. **`grabado` se deriva del estado**: la columna deja de usarse en la interfaz tras la migración.
3. **Biblioteca**: `/biblioteca` (tarjetas), `/biblioteca/[pilar]` (lista del pilar; `sin-pilar` para las que no tienen), y la vista Tablero. Agrupar por pilar es una consulta, no un dato nuevo.
4. **Acciones en grupo**: Server Actions que reciben una lista de ids validada con Zod (`z.array(z.string().uuid()).max(200)`), y solo tocan piezas de la usuaria (RLS) que no estén publicadas. Borrar = papelera (borrado lógico).
5. **Programar desde el calendario**: diálogo en tres pasos (día → pilar → pieza). Una acción fija `fecha_prevista` (con historial de fechas, A8). Quitar la fecha la devuelve a la lista de Editadas sin programar.
6. **Componente compartido de pestañas de filtros** en `src/shared/components/`, filtros por GET, «Filtros (n)».
7. **Color del pilar nunca solo**: banda de color + nombre o título; el texto va en tinta sobre fondo claro.

### Modelo de datos

Sin tablas nuevas. Migración de `piezas.estado`:

| Antes | Después |
|---|---|
| `borrador`, `en_preparacion` (sin grabar) | `borrador` |
| `borrador`, `en_preparacion` con `grabado = true` | `grabado` |
| `listo` | `editado` |
| `planificado` | `editado` (conserva su fecha) |
| `publicado` | `publicado` |

Orden: ampliar el `check` → `update` acotado (simulado primero, recuento por estado antes y después) → estrechar el `check`. Ningún `delete`. Antes de ejecutar en producción se enseña a la usuaria el recuento.

---

## Blueprint (fases)

> Las subtareas se generan al entrar en cada fase (bucle agéntico). Cada fase termina con `tsc`, `lint` y `build` pasando y la app arrancando.

### Fase 1: Estados nuevos y migración
Constante única, tabla por formato, migración con recuento, acciones/Hoy/lanzamientos/email/mapa/plantillas/demo/copia de seguridad al día, tablero de cuatro columnas, botón «Ya grabado» sustituido por el estado.
**Validación**: recuento antes/después cuadra; una pieza recorre Borrador → Grabado → Editado → Publicado; un correo no ofrece Grabado; restaurar una copia antigua traduce los estados viejos.

### Fase 2: Fuera Grabación
Rutas, navegación, bloque de Hoy, siembra y acciones de sesiones.
**Validación**: `/grabacion` da 404; ningún enlace a ella; cargar y quitar el ejemplo funciona; la copia de seguridad descarga y restaura.

### Fase 3: Formularios simplificados
Nueva pieza (título, formato, finalidad; pilar oculto si viene de una carpeta). Ficha sin los campos retirados; el guion con sus versiones (nombre, gancho, desarrollo…) intacto.
**Validación**: ningún dato existente se pierde; R3 pasa.

### Fase 4: Biblioteca por pilares
Tarjetas, carpeta de pilar, «+ Nueva pieza» con pilar, selección múltiple, «Ya grabadas» desplegable, «Sin pilar».
**Validación**: con el ejemplo cargado, los recuentos cuadran; crear desde un pilar guarda ese pilar; pasar 3 piezas a Ya grabadas y borrar 2 en grupo (van a la papelera y se restauran).

### Fase 5: Calendario por pilares
Diálogo día → pilar → pieza Editada; tarjeta con color, título y finalidad; fuera filtros y buscador.
**Validación**: programar una semana con piezas de dos pilares; quitar una fecha la devuelve a la lista; legible a 375 px.

### Fase 6: Filtros en pestaña y sin buscadores
Componente compartido en Ideas, Frases, Email y Mapa; retirada de los cuadros de búsqueda y de la lupa de «Más»; Ctrl + K se mantiene.
**Validación**: `Grep` de `name="q"` sin resultados; filtros se conservan al recargar; «ideas para este lanzamiento en 30 minutos» se resuelve con dos filtros.

### Fase 7: Rosa claro
Tokens semánticos (`--color-acento-suave`…) apuntando a los rosas; fondos de tarjeta, navegación activa, cabeceras y bloques destacados; `docs/03` actualizado con contrastes.
**Validación**: contrastes AA calculados; capturas a 375 y 1280 px de Hoy, Biblioteca, Calendario y una ficha.

### Fase 8: Validación y entrega
e2e actualizadas (R1 sin buscador), `docs/01`, `02`, `03`, `06`, `continuar.md` y `LEEME.md` al día, despliegue en producción y nota para la usuaria con lo que cambia.

---

## Gotchas

- [ ] **Migración en producción** (Aprendizaje 2026-09-30): leer el `update` entero, simular con recuento, enseñar el recuento a la usuaria y solo entonces ejecutar. Ampliar el `check` antes del `update`.
- [ ] **Literales de estado**: tras el cambio, `Grep` de `en_preparacion`, `planificado` y `"listo"` debe quedar vacío (salvo la migración y la traducción de copias antiguas).
- [ ] **Email y lanzamientos** ponían `planificado` al fijar fecha: ahora solo fijan la fecha.
- [ ] **Plantillas y demo** crean piezas con estado: claves nuevas o fallan contra el `check`.
- [ ] **Acciones en grupo**: nunca tocar piezas publicadas (snapshot) ni ids de otra usuaria; tope de 200 ids.
- [ ] **Color**: no sustituir `verde-` a ciegas; el verde de «publicado», finalidades y pilares se queda. `frambuesa` con texto blanco da 4,84 (AA justo).
- [ ] **Next 16**: `params`/`searchParams` son promesas; consultar `node_modules/next/dist/docs/` al crear `/biblioteca/[pilar]`.
- [ ] **e2e**: reescribir R1 antes de quitar el buscador de Frases; lanzar un proyecto cada vez.

## Anti-patrones

- NO borrar columnas, tablas ni filas de producción en este PRP.
- NO repetir la lista de estados en un componente o `z.enum` suelto.
- NO usar el color del pilar como única señal.
- NO dejar código muerto de Grabación ni de los buscadores retirados.
- NO dar por comprobado en pantalla lo que solo se ha compilado.

## Aprendizajes

### 2026-11-19: Fases 1 y 2 hechas y en producción (commit `1fb1b62`)
- Migración aplicada: 78 piezas antes y después (40 borrador, 7 editado, 31 publicado). La cuenta real de la usuaria solo tenía 4 reels en borrador.
- Orden necesario: la migración y el despliegue van juntos; con la base de datos nueva y el código viejo fallan los cambios de estado.

### 2026-11-19: Tipos generados obsoletos al borrar rutas
- **Error**: tras borrar `/grabacion`, `tsc` y `build` fallaban en `.next/dev/types/validator.ts` («Cannot find module …/grabacion/page.js»).
- **Fix**: borrar `.next/dev/types` y `.next/types` (se regeneran).
- **Aplicar en**: cualquier fase que elimine rutas.

### 2026-11-19: R3 y R6 pasan del minuto
- **Error**: en el servidor de desarrollo tardan 50-66 s y el límite por prueba era 60 s; fallaban por tiempo, no por la app.
- **Fix**: `test.setTimeout(120_000)` en esas dos pruebas.
- **Aplicar en**: recorridos e2e largos.

### 2026-11-20: La tanda e2e completa satura el servidor de desarrollo
- **Error**: con 8 pruebas seguidas en ordenador, R4 y R6 fallaron esperando páginas (R6 tardó 2,5 min); solas pasaron.
- **Fix**: lanzar la tanda en dos tramos de 4 (cada uno empieza por `00-ejemplo`), como pide `CLAUDE.md` para procesos largos.
- **Aplicar en**: toda ejecución de e2e en esta máquina.

### 2026-11-20: Parar el servidor de desarrollo no mata su proceso
- **Error**: tras horas de pruebas el servidor iba lento; `TaskStop` cerró la terminal pero el proceso `node` siguió en el puerto 3000 y el nuevo arrancó en el 3001, así que las pruebas seguían contra el viejo.
- **Fix**: comprobar con `netstat -ano | grep ":3000 .*LISTEN"` y cerrar ese PID con `taskkill /PID <pid> /F /T` antes de arrancar otro.
- **Aplicar en**: cualquier reinicio del servidor de desarrollo en esta máquina.

### 2026-11-20: Clics de e2e antes de la hidratación
- **Error**: `00-ejemplo` pulsaba «Quitar ejemplo» antes de que React hidratara Ajustes; el clic no hacía nada y la prueba caducaba (no era la app).
- **Fix**: `waitForLoadState("networkidle")` y reintento con `expect(...).toPass()` hasta ver el botón de confirmar.
- **Aplicar en**: pruebas que pulsan botones con `onClick` nada más cargar la página.

### 2026-11-20: Fase 5 hecha
- Programar es `?programar=<día>&pilar=<id>` en la dirección (panel renderizado en el servidor, sin JavaScript propio). Solo piezas Editadas sin día. Prueba nueva: `e2e/r9-calendario-pilares.spec.ts`.

### 2026-11-20: Fases 3 y 4 hechas
- Las pruebas que abrían piezas desde `/biblioteca` ahora usan `/biblioteca?vista=tablero` (la portada son carpetas de pilar). Prueba nueva: `e2e/r8-biblioteca-pilares.spec.ts`.

---

*PRP pendiente de aprobación. No se ha modificado código.*
