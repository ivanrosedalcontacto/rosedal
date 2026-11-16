# 06 · Verificación y entrega

La usuaria pide comprobar siete recorridos en la aplicación antes de entregar, y un informe honesto de lo verificado y de lo que no. Este documento convierte cada recorrido en pasos con su resultado esperado, añade una lista de aceptación por módulo y fija el formato de la entrega.

## Cómo se verifica

- Los recorridos se ejecutan **en la app en marcha**, con un navegador, no leyendo el código. Cada uno se automatiza como prueba de extremo a extremo y, además, se recorre una vez a mano mirando la pantalla.
- Parten del ejemplo recién cargado, para ser repetibles. Los nombres citados son los de `04-datos-demo.md`.
- «Móvil» significa una ventana de 375 × 812 con entrada táctil. «Ordenador», 1280 × 800.
- De cada recorrido se guarda una captura de su resultado final.
- Las reglas de dominio puras (cambio de estado, elegir versión, cálculo de plazos acumulados, estado de una métrica, frase sin usar) llevan además pruebas unitarias: son baratas y son justo donde un descuido rompe una promesa.
- Un recorrido que no se haya podido ejecutar se declara como **no comprobado**, con el motivo. No se da por bueno por parecer correcto.

## Los siete recorridos

### Recorrido 1 · Guardar una frase en el móvil y copiarla después

En móvil.

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir Hoy y pulsar «+ Frase para B-roll» | Se abre la hoja con el cursor en el campo de texto |
| 2 | Escribir tres líneas, la segunda en blanco: «Hoy no vas tarde.», línea vacía, «Vas a tu ritmo.» | El campo muestra las tres líneas |
| 3 | Pulsar «Guardar» | La hoja se cierra y aparece «Guardado en Frases». No se ha pedido ningún otro dato |
| 4 | Cerrar la pestaña del navegador y abrir la app de nuevo | La app carga con normalidad |
| 5 | Ir a Frases y buscar «ritmo» | Aparece la frase, entera, con sus tres líneas visibles |
| 6 | Pulsar «Copiar frase» | El botón cambia a «Copiado ✓» |
| 7 | Leer el portapapeles | Contiene exactamente el texto escrito, con los dos saltos de línea, sin espacios añadidos ni quitados |

Comprobar también: la frase figura como «Sin usar» después de copiarla.

### Recorrido 2 · Planificar un reel de prueba y registrar su publicación

En móvil, con la frase del recorrido 1.

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | En la tarjeta de la frase, «Planificar reel de prueba» | Hoja con la frase como texto en pantalla |
| 2 | Escribir la nota de plano «Plano de mis manos abriendo la agenda», elegir una fecha y guardar | Se crea la ficha |
| 3 | Abrir la ficha creada | Formato reel de prueba, finalidad Attract, duración 7 segundos, texto en pantalla idéntico a la frase, nota de plano y fecha |
| 4 | Volver a Frases y filtrar por «Sin usar» | La frase **sigue ahí**, con la indicación del reel previsto |
| 5 | Filtrar por «Ya utilizadas» | La frase no aparece |
| 6 | Abrir el reel, marcarlo como publicado con la fecha de hoy y un enlace | La ficha muestra «Publicado el…» |
| 7 | Volver a Frases, filtro «Ya utilizadas» | La frase aparece, con «Usada 1 vez» |
| 8 | Abrir su historial | Un uso con la fecha, el enlace y el texto exacto empleado |

Variante que también se comprueba: sobre otra frase, «Registrar uso» directo con fecha y sin enlace la pasa a «Ya utilizadas» sin que exista ninguna ficha de reel.

### Recorrido 3 · Dos guiones, una entrada; adaptar a un correo

En ordenador.

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir la idea «¿Cómo sé si me basta con el curso…?» | Se ven sus piezas, entre ellas el reel |
| 2 | Abrir el reel | Dos versiones de guion; «Gancho directo» está marcada como la que se va a usar |
| 3 | «Probar otra versión», duplicando la actual; llamarla «Gancho con cifra» y cambiar el gancho | Hay tres versiones; la elegida no ha cambiado |
| 4 | Pulsar «Usar esta» en la nueva | Es la única elegida |
| 5 | Ir al calendario, a la semana del reel | El reel aparece **una sola vez** |
| 6 | Volver al reel y «Crear adaptación»: formato email, finalidad Nurture | Se abre un correo nuevo en borrador, con la línea de origen hacia la idea y hacia el reel |
| 7 | Darle una fecha distinta a la del reel | Se guarda |
| 8 | Volver al reel | Conserva su finalidad Position, su fecha y su estado. Lista el correo como derivado |
| 9 | Abrir la idea | Lista también el nuevo correo |
| 10 | Mirar el calendario | Dos entradas distintas, cada una en su día y con su finalidad |

### Recorrido 4 · Reordenar una secuencia de stories

En ordenador y repetido en móvil con los botones «Subir» y «Bajar».

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir «Curso o asesoría: os leo» | Resumen con Story 1, 2 y 3 en su orden |
| 2 | Duplicar la tarjeta 2 | Hay cuatro tarjetas; la copia queda tras la original |
| 3 | Mover la última tarjeta a la primera posición | Los números se actualizan al momento |
| 4 | Recargar la página | El orden nuevo se mantiene |
| 5 | Abrir «Leer la secuencia» | Las cuatro tarjetas, de arriba abajo, en el orden nuevo, con todo su contenido |
| 6 | Mirar el calendario | La secuencia sigue siendo una sola entrada, ahora «Stories · 4» |
| 7 | «Guardar estructura como plantilla» y crear una secuencia nueva desde ella | Tarjetas con la estructura y sin el texto concreto |

### Recorrido 5 · El mismo correo desde dos sitios; el plazo relativo

En ordenador.

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir el lanzamiento de otoño, fase de apertura | Aparece el correo «Ya puedes apuntarte» |
| 2 | Abrirlo desde ahí, cambiar el asunto elegido y añadir una frase al cuerpo | Indicador «Guardado» |
| 3 | Ir a Email marketing › Broadcasts y localizar el correo por su fecha | Muestra el asunto nuevo |
| 4 | Abrirlo desde ahí | El cuerpo contiene la frase añadida. La dirección de la página es la misma que en el paso 2 |
| 5 | Ir a Secuencias › «Bienvenida al curso» | El paso 2 muestra «3 días después del anterior · Día 3 tras la compra del curso» |
| 6 | Abrir ese correo, editar su texto y volver | El plazo no ha cambiado |
| 7 | Ir al calendario y recorrer tres semanas | Ningún correo de la secuencia poscompra aparece |
| 8 | Copiar el cuerpo con formato del primer broadcast y pegarlo en un editor de texto enriquecido | Conserva negrita, lista y enlace |

### Recorrido 6 · Reprogramar, publicar otro día y consultar resultados

En ordenador; el paso 2 se repite en móvil con «Cambiar fecha».

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Elegir una pieza con fecha el martes de esta semana (crearla si hace falta) | — |
| 2 | Arrastrarla al miércoles | Aparece en el miércoles; aviso con «Deshacer» |
| 3 | Abrir su ficha | Fecha prevista: miércoles. El historial muestra «martes → miércoles» |
| 4 | Marcarla como publicada con fecha real el jueves y un enlace | El diálogo indica que se conservan ambas fechas |
| 5 | Mirar el calendario | La pieza está en el jueves, marcada como publicada, con la nota «Prevista: miércoles» |
| 6 | Ir a la revisión semanal | La pieza figura en «Lo que salió», con sus métricas en «Pendiente» |
| 7 | Escribir 0 en una métrica, un número en otra y dejar una tercera vacía | Se ven distintos el cero, el número y el pendiente |
| 8 | Recargar | Los tres estados se mantienen |
| 9 | Abrir la ficha de la pieza | Siguen visibles la fecha prevista, el historial, la fecha real, el enlace y los resultados |
| 10 | Con el ejemplo: abrir el correo «Abro dos huecos de asesoría» en la revisión de su semana | Una reserva confirmada y una compra de origen desconocido, con etiquetas distintas, e ingresos pendientes |

### Recorrido 7 · Todo con texto y acciones manuales

No es un recorrido aparte sino una condición sobre los seis anteriores, más tres comprobaciones:

| Comprobación | Cómo |
|---|---|
| No se ha adjuntado ningún archivo | Los seis recorridos se completaron escribiendo y pulsando |
| No hay campos de subida | Buscar en el código cualquier `type="file"`: solo puede existir el de restaurar la copia de seguridad |
| No se ha pedido ninguna credencial | En ningún paso aparece una pantalla que pida conectar una red, una plataforma de correo o una clave. El único acceso posible es el inicio de sesión propio de la app, si se optó por él |
| No hay llamadas a terceros | Con las herramientas del navegador, revisar la red durante los recorridos: todas las peticiones van a la propia app y a su base de datos |

## Lista de aceptación por módulo

Además de los recorridos. Cada línea se marca como comprobada, fallida o no comprobada.

**Captura e ideas**
- [ ] Las tres capturas guardan con solo escribir y pulsar «Guardar».
- [ ] «Guardar y escribir otra» deja el campo listo sin cerrar el teclado.
- [ ] Un texto sin guardar por fallo de red no se pierde.
- [ ] La bandeja muestra lo capturado sin clasificar.
- [ ] El brainstorming agrupa por tema, pilar, oferta y problema, y mover una idea cambia su valor.
- [ ] Una pregunta guarda palabras originales, procedencia y veces; «Ha vuelto a aparecer» suma uno.
- [ ] La búsqueda por lanzamiento y 30 minutos devuelve las tres ideas del ejemplo y deja fuera la de 90.
- [ ] El prompt copiado contiene idea, audiencia, oferta y tono.

**Piezas y biblioteca**
- [ ] Lista y tablero muestran las mismas piezas con las mismas etiquetas.
- [ ] Los filtros se combinan y sobreviven a recargar la página.
- [ ] La búsqueda encuentra texto que está dentro de un guion.
- [ ] Elegir Convert muestra oferta, acción y cómo.
- [ ] Marcar Listo con Convert incompleto avisa y deja continuar.
- [ ] Una pieza publicada no se puede editar; «Reutilizar» crea un borrador y la original no cambia.
- [ ] Desde una idea se llega a sus piezas y desde cada pieza a su idea.

**Grabación**
- [ ] La sesión muestra guion elegido, plano, preparación y duración.
- [ ] «Ya grabado» no cambia el estado de la pieza.

**Frases**
- [ ] Las tarjetas muestran la frase entera con sus saltos de línea.
- [ ] «Elegir una para hoy» respeta los filtros activos.
- [ ] Editar una frase usada no altera el texto de su historial.
- [ ] Una variante queda enlazada a su original.

**Email**
- [ ] «Esta semana» muestra los tres broadcasts del ejemplo en sus días.
- [ ] Solo hay un asunto elegido por correo.
- [ ] Las tres acciones de copia funcionan.
- [ ] Marcar enviado conserva la versión enviada.
- [ ] Los pasos de una secuencia se reordenan y duplican, y los acumulados se recalculan.
- [ ] Una idea de email se convierte en broadcast y en paso de secuencia.

**Ofertas y lanzamientos**
- [ ] Una oferta acepta como vía de compra un enlace o una instrucción escrita.
- [ ] Cada fase muestra sus piezas, su finalidad y cuántas quedan por escribir.
- [ ] Aplicar cada plantilla crea fases, hitos y piezas con fechas coherentes.

**Hoy, calendario, mapa y revisión**
- [ ] Hoy muestra lo que sale hoy, la pieza atrasada del ejemplo, lo que hay que preparar y el próximo hito.
- [ ] Semana y mes muestran las mismas piezas; la bandeja «Sin fecha» recibe y entrega piezas.
- [ ] Todos los filtros del calendario funcionan.
- [ ] Cada celda del mapa abre sus piezas y la suma de celdas coincide con los totales.
- [ ] Desde la revisión se crea una adaptación y se fija una fecha para retomar, que luego aparece en Hoy.

**Datos y transversal**
- [ ] Cargar el ejemplo dos veces no duplica; quitarlo no borra nada creado a mano.
- [ ] Toda la interfaz está en español, con fechas y números en formato español.
- [ ] Ninguna pantalla se desborda en horizontal a 375 px.
- [ ] Toda acción de arrastre tiene alternativa con teclado o con un toque.
- [ ] La consola del navegador no muestra errores durante los recorridos.
- [ ] Comprobación de tipos y compilación de producción sin errores.

**Mejoras de mercado** (`05-mejoras-de-mercado.md`): una línea por cada mejora, indicando construida y comprobada, construida sin comprobar o no construida.

## Qué se entrega

1. **El código**, en un repositorio con historial.
2. **Pasos de arranque**, en un archivo LÉEME en español escrito para alguien no técnico: qué instalar, cómo arrancar y cómo abrir la app en el ordenador y en el móvil.
3. **Cómo cargar el ejemplo** y cómo quitarlo.
4. **Informe de verificación**, con el formato de abajo.
5. **Pendientes**: lo no construido, lo no comprobado y las limitaciones conocidas.

## Formato del informe de verificación

```
# Informe de verificación · Rosedal · {fecha}

## Resumen
{dos o tres frases: qué funciona, qué no y qué falta}

## Recorridos
| N.º | Recorrido | Resultado | Cómo se comprobó | Captura |
| 1 | Guardar y copiar una frase en móvil | Superado / Fallido / No comprobado | Prueba automática y a mano | … |
…

## Lista de aceptación
{las líneas de la lista, cada una con su resultado}

## Fallos conocidos
{qué falla, cómo reproducirlo y a qué afecta}

## No comprobado
{qué no se pudo comprobar y por qué}

## No construido
{funciones pendientes, con referencia al documento que las describe}

## Decisiones tomadas durante el desarrollo
{cambios respecto a la documentación, y contradicciones encontradas}
```

Reglas del informe:

- «Superado» significa ejecutado y visto funcionar. Nada más.
- Un fallo se describe con sus pasos y su mensaje, sin suavizarlo.
- Si un recorrido se superó solo en ordenador y debía probarse también en móvil, se dice.
- El resumen empieza por lo que no funciona, si lo hay.
