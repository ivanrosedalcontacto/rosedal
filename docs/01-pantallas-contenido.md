# 01 · Pantallas de contenido

Este documento describe qué ve y qué puede hacer la usuaria en cada pantalla de creación. Las reglas que gobiernan los datos están en el PRP; aquí se concreta la experiencia. Donde se indica «móvil» se entiende 375 px de ancho; «ordenador», 1280 px o más.

## Patrones comunes a toda la app

Defínelos una vez como componentes compartidos; aparecen en casi todas las pantallas.

- **Copiar.** Botón con icono y texto («Copiar frase», «Copiar asunto»). Copia el valor guardado, no el texto pintado en pantalla. Al terminar, el propio botón cambia a «Copiado ✓» durante dos segundos. Si el navegador no deja copiar, se muestra el texto seleccionado en un diálogo con la instrucción de copiarlo a mano.
- **Autoguardado.** Los editores largos (guion, correo, tarjetas de stories, notas) guardan solos tras unos 800 ms sin teclear. Un indicador discreto junto al título dice «Guardando…», «Guardado» o «Sin guardar: reintentar». Al salir con cambios sin guardar, se avisa.
- **Etiquetas.** Finalidad, pilar, formato, canal y estado se muestran siempre como etiquetas con el mismo aspecto en lista, tablero, calendario y fichas. La de finalidad lleva nombre y color; nunca solo color.
- **Filtros.** Barra de filtros combinables con el mismo componente en biblioteca, calendario e ideas. Los filtros activos se ven como etiquetas que se quitan con un toque, hay «Limpiar» y se reflejan en la dirección de la página, de modo que volver atrás o recargar conserva la vista.
- **Estados vacíos.** Una frase que explica qué va ahí y un botón para crear lo primero. Nunca una pantalla en blanco ni una tabla sin filas.
- **Deshacer.** Tras archivar, enviar a la papelera, mover de fecha o cambiar de estado aparece un aviso breve con «Deshacer» durante unos segundos.
- **Confirmaciones.** Solo para lo que no tiene vuelta atrás sencilla: deshacer una publicación, vaciar la papelera, quitar el ejemplo.
- **Hoja en móvil, panel en ordenador.** Los formularios cortos (capturar, cambiar fecha, registrar uso, marcar publicado) se abren como hoja inferior en móvil y como diálogo centrado o panel lateral en ordenador.

## Navegación

**Móvil.** Barra inferior fija con cinco elementos: Hoy, Calendario, «+» (botón central destacado), Biblioteca y Más. «+» abre la hoja de captura con las tres opciones. «Más» lleva al resto de secciones.

**Ordenador.** Barra lateral con las secciones agrupadas para que no sea una lista de doce elementos iguales:

| Grupo | Secciones |
|---|---|
| (sin título) | Hoy |
| Pensar | Ideas, Frases |
| Crear | Biblioteca, Grabación, Email |
| Planificar | Calendario, Lanzamientos, Ofertas |
| Revisar | Mapa, Revisión semanal |
| (al pie) | Recursos, Ajustes |

Arriba de la barra lateral, el botón «Capturar» abre la misma hoja que el «+» del móvil.

## Hoy

Es la página de inicio. Tiene que responder a tres preguntas sin desplazarse en un móvil corriente, así que cada bloque muestra pocas filas y un enlace «Ver todo».

1. **Cabecera.** Fecha de hoy escrita completa («Lunes, 16 de noviembre») y los tres botones de captura, grandes y en fila: «+ Idea», «+ Frase para B-roll», «+ Idea de email».
2. **Hoy publico o envío.** Las piezas con fecha prevista hoy que aún no han salido. Cada fila muestra formato, título, finalidad y una acción «Marcar publicado» (o «Marcar enviado»). Debajo, si las hay, las atrasadas, con la etiqueta «Atrasada desde el martes» y dos acciones: marcar como publicada o cambiar la fecha. Si no hay nada: «Hoy no tienes nada previsto.»
3. **Tengo que preparar.** Lo que vence en los próximos siete días y todavía está en Borrador o En preparación, ordenado por fecha, con lo que falta en palabras («Sin guion», «Falta la llamada a la acción», «Sin grabar»). Incluye el próximo día de grabación y las piezas marcadas para retomar cuya fecha ya llegó.
4. **Próximo hito.** Nombre del lanzamiento, fase en curso, el siguiente hito con su fecha y los días que faltan («Abrir inscripciones · jueves · faltan 3 días»). Si no hay lanzamiento activo, el bloque se reduce a una línea con enlace a Lanzamientos.
5. **Pie.** Dos contadores con enlace: ideas pendientes de clasificar y frases sin usar.

## Captura rápida

Es el flujo más importante en móvil. Se mide en segundos.

- Al abrir cualquiera de las tres capturas, el campo de texto tiene el foco y el teclado ya está abierto.
- Hay un único campo de texto de varias líneas y dos botones: «Guardar» y «Guardar y escribir otra». No hay título, ni selectores, ni pasos.
- «Guardar» cierra la hoja y muestra «Guardado en Ideas» (o en Frases, o en Ideas de email) con un enlace para abrir lo recién guardado.
- «Guardar y escribir otra» vacía el campo, mantiene el teclado abierto y muestra un contador («2 guardadas»).
- Si falla la conexión, el texto no se pierde: se conserva en el dispositivo, se indica «Pendiente de guardar» y se reintenta al recuperar la conexión o al volver a abrir la app.
- Cerrar la hoja con texto escrito y sin guardar conserva el borrador para la próxima vez.
- En ordenador, `Ctrl + Intro` guarda.

Qué crea cada una: «+ Idea» crea una idea general pendiente; «+ Idea de email», una idea de tipo email pendiente; «+ Frase para B-roll», una frase en el banco, con el texto tal cual, saltos de línea incluidos.

## Ideas

Tres pestañas: **Bandeja**, **Brainstorming** y **Preguntas y objeciones**.

### Bandeja

Lista de ideas pendientes, la más reciente arriba. Cada idea muestra su texto (hasta cuatro líneas), cuándo se capturó y las etiquetas que tenga. Las que no tienen ninguna clasificación llevan la marca «Sin clasificar», discreta.

Acciones por idea sin abrir la ficha: asignar pilar, archivar y «Crear pieza». En ordenador se pueden seleccionar varias y clasificarlas a la vez.

Filtros: texto, tipo, pilar, oferta, lanzamiento, relevancia, demanda y **tiempo máximo de preparación** (15, 30, 60 minutos o más). La consulta de ejemplo de la usuaria, «ideas para este lanzamiento que pueda preparar en 30 minutos», debe resolverse con dos filtros y verse en la dirección de la página para poder guardarla en favoritos.

Orden disponible: recientes, prioridad (relevancia y demanda altas con poco tiempo de preparación primero) y tiempo de preparación.

### Ficha de idea

- **Texto**, editable, con autoguardado.
- **Clasificación**: tipo, pilar, tema, problema de la audiencia, oferta y lanzamiento. Tema y problema son texto libre con sugerencias de los ya usados.
- **Prioridad**: relevancia y demanda en tres niveles (baja, media, alta) y tiempo estimado de preparación en minutos, con atajos de 15, 30, 60 y 120.
- **Ángulos**: seis botones (tutorial, historia personal, error frecuente, demostración, caso real, objeción de compra) más «Otro». Pulsar uno añade una nota bajo ese ángulo donde escribir cómo se contaría. Cada ángulo anotado tiene «Crear pieza desde este ángulo».
- **Copiar prompt para explorar ángulos**: compone y copia el texto del apartado siguiente.
- **Piezas creadas a partir de esta idea**: lista con formato, título, finalidad, estado y fecha. Cada una abre su ficha. Botón «Crear pieza» que pregunta formato y título (propone como título la primera línea de la idea).
- Acciones: archivar, enviar a la papelera.

### Texto del prompt

Se compone con los datos disponibles y omite las líneas vacías. Esta es la plantilla:

```
Quiero explorar ángulos de contenido para esta idea:

«{texto de la idea}»

{si es pregunta u objeción: Son palabras textuales de mi audiencia. Procedencia: {procedencia}. Ha aparecido {n} veces.}

Mi audiencia: {público de la oferta, o audiencia general de Ajustes}
La oferta relacionada: {nombre}. {propuesta de valor}
Mi tono: {tono general de Ajustes}
{si hay ejemplos de tono en Recursos: Ejemplos de cómo escribo: …}

Propón un ángulo para cada uno de estos enfoques: tutorial, historia personal,
error frecuente, demostración, caso real y objeción de compra.
Para cada uno dame un gancho de una línea, la idea central en dos frases
y el formato que mejor le va (reel, carrusel, stories o email).
```

### Brainstorming

Un tablero de columnas con las ideas no archivadas. Un selector arriba elige por qué se agrupan: **tema**, **pilar**, **oferta** o **problema de la audiencia**. Siempre hay una columna «Sin asignar» a la izquierda.

- En ordenador, arrastrar una idea a otra columna le asigna ese valor.
- En móvil, las columnas se recorren en horizontal y cada idea tiene un menú «Mover a…».
- En las agrupaciones por tema y por problema se puede crear una columna nueva escribiendo su nombre.
- Cada columna muestra cuántas ideas tiene. Un campo arriba permite añadir una idea directamente en esa columna.

### Preguntas y objeciones

Lista de las ideas de tipo pregunta u objeción, ordenable por veces que han aparecido. Cada una muestra las **palabras originales** entre comillas, la procedencia («Mensaje privado de Instagram», «Llamada con clienta») y un contador con el botón «Ha vuelto a aparecer», que suma uno.

Al crear una, el formulario pide las palabras textuales y la procedencia; solo las palabras son obligatorias. Las objeciones pueden vincularse a una oferta y entonces aparecen también en la ficha de esa oferta.

## Biblioteca de contenidos

Todas las piezas, de cualquier formato. Un conmutador alterna **Lista** y **Tablero** y recuerda la última elección.

**Lista.** En ordenador es una tabla con título, formato, canal, pilar, finalidad, estado, fecha prevista y lanzamiento; se ordena pulsando la cabecera. En móvil cada pieza es una tarjeta con título, etiquetas y fecha.

**Tablero.** Una columna por estado: Borrador, En preparación, Listo, Planificado y Publicado. Arrastrar una tarjeta cambia su estado aplicando las mismas reglas que desde la ficha (pasar a Planificado pide fecha; pasar a Publicado abre el diálogo de publicación). La columna Publicado muestra solo las últimas y un enlace al resto.

**Filtros combinables**: texto, formato, canal, pilar, finalidad, estado, oferta, lanzamiento, idea de origen, «Ya grabado» y rango de fechas. La búsqueda por texto mira título, guiones, texto de publicación, texto en pantalla y notas.

**Avisos en tarjeta.** Una pieza Convert en Listo o más allá sin llamada a la acción completa muestra «Falta la llamada a la acción».

## Ficha de pieza

Una sola ficha para todos los formatos, con bloques que aparecen según el formato. En ordenador va en dos columnas: a la izquierda el contenido (lo que se escribe) y a la derecha, en un panel más estrecho, la clasificación y la planificación. En móvil, una columna con el contenido primero.

### Cabecera

Título editable, etiqueta de estado con el selector para cambiarlo, indicador de autoguardado y el menú de acciones: Probar otra versión, Crear adaptación, Reutilizar (solo si está publicada), Añadir a un día de grabación, Duplicar, Enviar a la papelera.

Bajo el título, la línea de **origen**, siempre visible si existe: «De la idea: ¿Cómo sé si me basta con…?» y, en su caso, «Adaptación de: Reel · Curso o asesoría» o «Reutiliza: …». Cada referencia es un enlace.

### Bloque de contenido según formato

| Formato | Bloques |
|---|---|
| Reel, carrusel, publicación | Guion por versiones, texto de publicación, texto en pantalla |
| Reel de prueba | Texto en pantalla (la frase), plano, duración |
| Secuencia de stories | Editor de tarjetas |
| Email | Asuntos, texto de vista previa, cuerpo con formato (ver `02-pantallas-planificacion.md`) |

Para un carrusel, el «desarrollo» del guion se escribe diapositiva a diapositiva; no hace falta un editor distinto.

### Editor de guiones

- Tres campos: **Gancho**, **Desarrollo** y **Cierre**, cada uno con una línea de ayuda («Lo primero que se oye o se lee», «Lo que cuentas», «Cómo terminas y qué pides»).
- Sobre ellos, las **versiones** como pestañas con nombre («Gancho directo», «Gancho con pregunta»). La elegida lleva la marca «La que voy a usar».
- «Probar otra versión» ofrece empezar en blanco o duplicar la actual, y pide un nombre (propone «Versión 2»).
- «Usar esta» marca la versión visible como elegida. Siempre hay exactamente una.
- Se puede renombrar y eliminar una versión; no se puede eliminar la única que queda.
- «Comparar» muestra dos versiones lado a lado en ordenador, solo lectura.
- Bajo los campos: número de palabras y duración estimada hablada (a unas 150 palabras por minuto), como orientación.
- «Copiar guion» copia la versión visible como texto plano, con los tres apartados separados por una línea en blanco.

### Panel de clasificación

Idea de origen, formato, canal, pilar, finalidad, oferta, lanzamiento y fase. La finalidad se elige con cuatro botones que muestran el nombre y, debajo, para qué sirve, con los textos del encargo:

| Finalidad | Para qué la utilizo |
|---|---|
| Attract · Atraer | Llegar a personas nuevas y ayudarles a reconocerse en un problema o aspiración |
| Nurture · Cultivar la relación | Aportar valor a quienes ya me siguen, escucharles y fortalecer la confianza |
| Position · Posicionarme como referente | Mostrar mi criterio, mi método, mi experiencia o cómo resuelvo un problema |
| Convert · Convertir | Conseguir una acción comercial concreta, como comprar, reservar o iniciar una conversación de venta |

### Bloque Convert

Aparece al elegir Convert, resaltado con el color de esa finalidad. Tres campos:

1. **Qué oferta promociono**: selector de ofertas.
2. **Qué acción pido**: texto corto. Ejemplos de ayuda: «Compra el curso», «Reserva tu sesión», «Escríbeme».
3. **Cómo puede hacerlo**: texto libre y, aparte, un enlace opcional. Debe servir igual para «Compra en este enlace» que para «Escríbeme SESIÓN por privado». Al elegir oferta se propone su vía de compra, editable.

Un botón «Elegir de mis CTA» inserta una llamada a la acción guardada en Recursos.

**El aviso.** Si la pieza pasa a Listo, Planificado o Publicado con finalidad Convert y falta alguno de los tres campos, aparece un diálogo: «A esta pieza le falta la llamada a la acción: {lo que falte}». Opciones: «Completarla ahora» y «Marcar como lista igualmente». No bloquea. Mientras falte, el aviso sigue visible en la ficha, en la biblioteca y en Hoy.

### Panel de planificación

- **Fecha prevista**, con selector, y acceso a «Ver en el calendario».
- **Historial de fechas**, plegado: «Prevista para el martes 3 → cambiada al miércoles 4 → publicada el jueves 5».
- **Preparación de grabación**: qué plano quiero hacer, qué necesito preparar, duración estimada en segundos y la casilla «Ya grabado», con la aclaración «No cambia el estado de la pieza».
- **Notas**.

### Publicar

Al pasar a Publicado se abre un diálogo con la **fecha real** (hoy por defecto) y la **URL**, opcional. Si la fecha real difiere de la prevista se dice sin dramatismo: «Estaba prevista para el martes 3. Se conservan las dos fechas.»

A partir de ahí la ficha muestra una banda «Publicado el jueves 5 de noviembre», con el enlace si existe, y el contenido queda de solo lectura con dos accesos: «Reutilizar» y «Ver resultados». En el menú, «Deshacer publicación», con confirmación.

### Crear adaptación

Diálogo con formato y canal de la nueva pieza, finalidad (propone la de la original, pero se elige aquí porque suele cambiar) y título. Una casilla marcada por defecto: «Empezar con el texto de esta pieza». La nueva pieza se abre al crearla y su línea de origen muestra idea y pieza de procedencia. La original lista sus adaptaciones en un bloque «Derivadas de esta pieza».

## Día de grabación

**Lista de sesiones**, con fecha, número de piezas, cuántas están grabadas y duración total.

**Crear una sesión**: nombre, fecha opcional y un selector de piezas que parte de las que tienen guion y no están grabadas ni publicadas, con los filtros de la biblioteca. También se añade una pieza desde su ficha.

**Vista de la sesión**, pensada para el móvil apoyado junto a la cámara:

- Cabecera con el progreso: «3 de 7 grabados · quedan unos 4 minutos».
- **Qué necesito preparar**: lista reunida de lo anotado en todas las piezas, con casillas para ir tachando.
- Las piezas en orden, reordenables. Cada una muestra el título, el **guion elegido** completo (gancho, desarrollo y cierre), el **plano**, la **duración** y un botón grande «Ya grabado» que se puede desmarcar.
- Las grabadas se atenúan y bajan al final.
- **Modo lectura**: muestra un solo guion a pantalla completa, con letra grande y sin nada más, con «Anterior» y «Siguiente». Es texto en pantalla; no graba ni reproduce nada.

## Banco de frases

Tiene que funcionar por sí solo: entrar, encontrar una frase, copiarla y salir.

**Cabecera.** Botón «+ Frase», buscador, filtros «Todas», «Sin usar», «Ya utilizadas» y «Favoritas», y el botón «Elegir una para hoy».

**Tarjetas.** Cada frase se muestra **entera**, con sus saltos de línea, sin recortar con puntos suspensivos. En ordenador, rejilla de dos o tres columnas con tarjetas de altura libre; en móvil, una columna. Cada tarjeta tiene:

- El texto, en un tamaño algo mayor que el resto de la interfaz.
- Estrella de favorita.
- Estado: «Sin usar» o «Usada 2 veces · última el 3 de noviembre».
- Si tiene un reel de prueba planificado sin publicar: «Reel de prueba previsto para el jueves». Sigue contando como sin usar.
- **«Copiar frase»**, la acción principal, siempre visible.
- Menú: Planificar reel de prueba, Registrar uso, Guardar variante, Ver historial, Editar, Archivar.

**Captura.** «+ Frase» abre la misma hoja que la captura rápida, con «Guardar» y «Guardar y escribir otra».

**Elegir una para hoy.** Escoge al azar entre las frases que cumplen los filtros y la búsqueda activos y la muestra sola y grande, con «Copiar frase», «Otra» y «Planificar reel de prueba». Si no hay ninguna que cumpla los filtros, lo dice.

**Planificar reel de prueba.** Hoja con la frase ya puesta como texto en pantalla (editable para este reel sin cambiar la frase del banco), la nota de plano opcional («Plano de mis manos abriendo la agenda») y la fecha prevista opcional. Indica que se creará con finalidad Attract y siete segundos de duración. Al guardar, ofrece abrir la ficha o seguir en el banco.

**Registrar uso.** Para lo publicado por su cuenta sin pasar por una ficha: fecha (hoy por defecto) y enlace opcional. Guarda el texto exacto de la frase en ese momento.

**Guardar variante.** Crea una frase nueva, enlazada a la original, con el texto como punto de partida. La tarjeta de cada una muestra «Variante de…» o «Tiene 2 variantes».

**Historial.** Lista de usos con fecha, texto exacto empleado, enlace si lo hay y la ficha del reel si existió. Si el texto usado difiere del actual de la frase, se muestra el que se usó.

Editar una frase ya utilizada no cambia el texto guardado en sus usos.

## Planificador de secuencias de stories

Una secuencia es una pieza con formato «Secuencia de stories». Su bloque de contenido es este editor.

**Tarjetas.** Cada una lleva su número («Story 1») y estos campos:

| Campo | Para qué |
|---|---|
| Título corto | Lo que se ve en el resumen: «Plantear la pregunta» |
| Qué voy a decir | Lo hablado o la idea de la story |
| Texto en pantalla | Lo que aparecerá escrito |
| Imagen o plano que preparo | Descripción escrita de lo que hay que tener listo |
| Elemento interactivo | Ninguno, encuesta, pregunta, enlace o CTA |
| Detalle del elemento | Opciones de la encuesta, texto de la pregunta, enlace o llamada a la acción |

**Acciones.** Añadir tarjeta, duplicar, eliminar y reordenar. Se reordena arrastrando por un asa y también con botones «Subir» y «Bajar», imprescindibles en móvil y con teclado. Los números se actualizan al momento y el orden se guarda solo.

**Leer la secuencia.** Vista de solo lectura con las tarjetas en orden, una debajo de otra, con todo su contenido y sin controles de edición. Es lo que la usuaria tendrá delante al crear las stories en su teléfono. Incluye «Copiar secuencia» como texto plano numerado.

**Resumen.** Al abrir la pieza desde el calendario o la biblioteca se ve primero el resumen: «Story 1: plantear la pregunta», «Story 2: encuesta», «Story 3: responder e invitar a escribirme».

**Plantillas.** «Guardar estructura como plantilla» guarda el número de tarjetas, sus títulos cortos, el tipo de elemento interactivo y las indicaciones, sin el texto concreto. «Nueva secuencia desde plantilla» crea las tarjetas ya dispuestas. Las plantillas se gestionan en Ajustes.

En el calendario, toda la secuencia es una sola entrada con el número de stories («Stories · 3»).

## Recursos de marca

Biblioteca de textos reutilizables, en pestañas por tipo:

| Tipo | Contenido |
|---|---|
| Tono | Ejemplos de cómo escribe y expresiones que usa o evita |
| CTA habituales | Llamadas a la acción listas para insertar |
| Testimonios | Texto, de quién es y la casilla «Tengo autorización para usarlo» |
| Planos recurrentes | Descripciones de planos que repite al grabar |
| Enlaces de venta | Nombre, URL y oferta a la que pertenece |

Cada recurso tiene «Copiar» y un buscador común. Los testimonios sin autorización marcada se muestran con la advertencia «Sin autorización registrada» y no se ofrecen al insertar.

Los recursos se insertan desde los editores: «Elegir de mis CTA» en el bloque Convert y en el correo, «Elegir un plano» en la preparación de grabación y en las tarjetas de stories, y los enlaces de venta en el campo de enlace de la llamada a la acción.
