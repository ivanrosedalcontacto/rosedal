# 05 · Mejoras inspiradas en herramientas del mercado

El encargo invita a añadir opciones interesantes que existan en otras herramientas. Este documento recoge las elegidas, las descartadas y los añadidos al modelo de datos que necesitan.

Las referencias a productos son de memoria y sirven solo como inspiración; no hay que imitar su aspecto ni su comportamiento exacto.

## Criterio de selección

Una mejora entra si cumple las cuatro condiciones:

1. Es solo texto, fechas y acciones manuales.
2. No conecta con nada externo.
3. Refuerza uno de los dos momentos de uso: capturar deprisa en el móvil o redactar y planificar con calma.
4. Es pequeña. Ninguna justifica retrasar el núcleo.

Todas se construyen **después** de que los siete recorridos del encargo funcionen. Si el tiempo no alcanza, se dejan fuera y se declara en la entrega; el núcleo no se recorta por ellas.

## Mejoras incluidas

### Prioridad A: mejoran lo que la usuaria ya pidió

| N.º | Mejora | Inspiración | Qué hace |
|---|---|---|---|
| A1 | Aplicación instalable con accesos directos | Apps de notas | La app se instala en la pantalla de inicio del móvil. Al mantener pulsado su icono aparecen «+ Idea», «+ Frase» y «+ Idea de email», que abren directamente la captura |
| A2 | Captura que no se pierde sin conexión | Apps de notas | Si no hay red, el texto se guarda en el dispositivo y se envía al recuperarla. Solo para las tres capturas rápidas |
| A3 | Buscador global y paleta de acciones | Notion, Linear | `Ctrl + K` en ordenador y una lupa en móvil. Busca en ideas, piezas, frases, correos, ofertas y recursos, y ofrece acciones: «Nueva idea», «Nueva frase», «Ir al calendario» |
| A4 | Papelera | Notion, Gmail | Ideas, piezas, frases y recursos no se borran al momento: van a la papelera, de donde se restauran. Se vacía a mano |
| A5 | Copia de seguridad | Notion, Airtable | «Descargar copia» genera un archivo JSON con todos los datos. «Restaurar copia» lo carga en una cuenta vacía. Además, exportar las piezas a CSV |
| A6 | Contadores de texto | Buffer, Hootsuite, plataformas de email | Contador de caracteres en texto de publicación, asunto y vista previa, con una marca orientativa (asunto: unos 50; vista previa: unos 90; pie de publicación: 2.200). Orienta, no bloquea |
| A7 | Vista de bandeja de entrada | Kit, Flodesk | La imitación en texto de cómo se ve el asunto y la vista previa, descrita en `02-pantallas-planificacion.md` |
| A8 | Historial de fechas | Herramientas de planificación | Cada cambio de fecha prevista queda anotado, para ver la planificación original |

### Prioridad B: amplían el producto con poco esfuerzo

| N.º | Mejora | Inspiración | Qué hace |
|---|---|---|---|
| B1 | Fechas señaladas | Calendarios de Metricool y Loomly | La usuaria anota días que condicionan su plan: «Black Friday», «Vacaciones», «Feria del sector». Se ven en el calendario como marcas, sin ser piezas |
| B2 | Ritmo semanal | Buffer, Later | Opcional. La usuaria indica cuánto quiere publicar por semana («3 reels, 2 correos»). Hoy y el calendario muestran el avance: «Reels: 2 de 3». Sin avisos ni reproches si no se cumple |
| B3 | Lista de pasos por pieza | Trello, CoSchedule | Casillas propias de cada pieza («Grabar», «Editar», «Subtítulos», «Portada»), con una lista de partida por formato editable en Ajustes. Lo no marcado alimenta «Tengo que preparar» |
| B4 | Banco de ganchos y grupos de hashtags | Later, Planoly | Dos tipos más en Recursos de marca. Los ganchos se insertan en el editor de guiones; los grupos de hashtags, en el texto de publicación |
| B5 | Contenido perenne | MeetEdgar, CoSchedule | Marca «Perenne» en una pieza publicada. Una vista «Para retomar» reúne las perennes y las que tuvieron buenos resultados y llevan más de 90 días sin reutilizarse |
| B6 | Más prompts para copiar | — | El mismo patrón del prompt de ángulos, en otros tres puntos: «ganchos alternativos» en el guion, «asuntos alternativos» en el correo y «adaptar a otro formato» en el diálogo de adaptación. Solo copian texto |
| B7 | Resumen copiable | Informes de Metricool | En la revisión semanal y en la ficha de un lanzamiento, «Copiar resumen» genera un texto con lo publicado y sus cifras, distinguiendo pendientes y atribuciones |
| B8 | Balance de lanzamiento | Paneles de lanzamiento | En el lanzamiento terminado: suma de solicitudes, reservas, compras e ingresos de sus piezas, con lo confirmado y lo de origen desconocido por separado, y un campo «Qué repetiría y qué no» |
| B9 | Enlace con seguimiento | Metricool, Buffer | Junto al enlace de una llamada a la acción, un ayudante que le añade etiquetas de campaña (origen, medio y nombre) para que la usuaria pueda saber de dónde vino una venta y marcarla como confirmada |
| B10 | Modo concentración | iA Writer | Un botón en los editores de guion y de correo oculta menús y paneles y deja solo el texto |

### Sobre el ritmo semanal y la regla de no sermonear

B2 roza la regla de que la app informa y no juzga. Se resuelve así: el ritmo lo fija la usuaria, es opcional, está vacío por defecto y se muestra como un contador neutro. No hay colores de alarma, ni mensajes de incumplimiento, ni rachas.

## Descartadas, y por qué

| Función habitual en el mercado | Motivo |
|---|---|
| Publicación programada en redes | Excluida expresamente |
| Vista previa de la cuadrícula de Instagram | Necesita imágenes |
| Biblioteca de medios | Excluida expresamente |
| Mejor hora para publicar calculada | Necesita datos de las redes |
| Métricas automáticas | Necesita conectar cuentas |
| Asistente de IA dentro de la app | Sería un servicio externo con clave. Se sustituye por los prompts copiables |
| Página de enlaces o tienda | Otro producto distinto |
| Comentarios, aprobaciones y equipo | Es de uso individual |
| Notificaciones push o por correo | Exigen servicios externos. La pantalla Hoy cumple esa función |
| Recibir texto compartido desde otras apps | Interesante para capturar preguntas de mensajes privados, pero solo funciona bien en Android. Queda como idea futura |
| Exportar el calendario a otras agendas | Idea futura; no es necesaria para ningún recorrido |

## Añadidos al modelo de datos

El modelo base está en el PRP. Estas son las ampliaciones que piden las pantallas de `docs/` y las mejoras de este documento. Siguen las mismas convenciones (identificador, propietaria, marca de ejemplo, fechas de creación y actualización, y seguridad por fila si aplica).

### Columnas nuevas en tablas existentes

| Tabla | Columna | Para qué |
|---|---|---|
| `ajustes` | `nombre_marca text` | Remitente en la vista de bandeja y en los prompts |
| `ajustes` | `ritmo_semanal jsonb null` | B2. Objeto formato → cantidad, validado con Zod |
| `ajustes` | `pasos_por_formato jsonb null` | B3. Lista de pasos de partida por formato |
| `ofertas` | `precio text null`, `archivada bool` | Ficha de oferta |
| `recursos_marca` | `autor text null`, `autorizado bool` | Testimonios |
| `recursos_marca` | tipos `gancho` y `hashtags` en el enumerado | B4 |
| `piezas` | `hora_prevista time null` | Hora opcional en el calendario |
| `piezas` | `perenne bool default false` | B5 |
| `piezas` | `aprendizaje text null` | Nota «qué aprendí» de la revisión semanal |
| `piezas`, `ideas`, `frases`, `recursos_marca` | `eliminado_en timestamptz null` | A4. Todas las consultas normales excluyen lo eliminado |
| `sesion_piezas` | `preparado bool default false` | Casilla de «Qué necesito preparar» en el día de grabación |
| `lanzamientos` | `balance text null` | B8 |

Las objeciones de una oferta pasan de un texto único a una tabla, para poder emparejar cada una con su respuesta.

### Tablas nuevas

| Tabla | Columnas propias | Para qué |
|---|---|---|
| `oferta_objeciones` | `oferta_id`, `objecion text`, `respuesta text null`, `idea_id null`, `orden int` | Objeciones con respuesta; `idea_id` enlaza con la objeción registrada en Ideas |
| `pieza_cambios_fecha` | `pieza_id`, `fecha_anterior date null`, `fecha_nueva date null`, `cambiado_en timestamptz` | A8. Se inserta una fila cada vez que cambia `fecha_prevista` |
| `pieza_pasos` | `pieza_id`, `texto`, `hecho bool`, `orden int` | B3 |
| `fechas_senaladas` | `titulo`, `fecha_inicio date`, `fecha_fin date null`, `nota text null` | B1 |

### Reglas asociadas

- **Papelera.** Enviar una pieza a la papelera la saca del calendario, la biblioteca, los lanzamientos y las sesiones, sin romper sus relaciones; restaurarla la devuelve a todos esos sitios. Una pieza publicada puede ir a la papelera, pero se avisa de que sus resultados dejarán de contar en el mapa y en los resúmenes. Vaciar la papelera borra de verdad, muestra antes cuántos elementos son y pide confirmación.
- **Historial de fechas.** Se registra al cambiar la fecha prevista por cualquier vía: ficha, arrastre en el calendario o selector en móvil. «Deshacer» inmediato tras un arrastre elimina también la fila recién creada, para no ensuciar el historial con movimientos corregidos al instante.
- **Copia de seguridad.** El archivo incluye todas las tablas de la usuaria y un número de versión del formato. Restaurar solo se permite sobre una cuenta sin datos propios, valida el archivo completo con Zod antes de escribir nada y, si algo falla, no deja datos a medias. Es el único punto de la app que acepta un archivo, y solo JSON.
- **Captura sin conexión.** Lo guardado en el dispositivo se envía una sola vez; si el envío se repite por un reintento, no se crean duplicados (cada captura lleva un identificador generado en el dispositivo).
- **Lista de pasos.** Al crear una pieza se copian los pasos de partida de su formato. Cambiar la lista de partida en Ajustes no altera las piezas ya creadas.
- **Para retomar.** «Buenos resultados» significa que alguna métrica de la pieza está entre las tres mejores de su finalidad en los últimos 180 días. Es una sugerencia; la usuaria decide.
