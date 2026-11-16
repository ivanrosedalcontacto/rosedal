# 03 · Diseño visual

La usuaria lo pidió así: «simple, minimalista, aesthetic, con tonos verdosos y rosados claros y que el color principal sea el blanco».

Tradúcelo como un cuaderno bonito y tranquilo. El blanco ocupa casi todo. El verde y el rosa aparecen en pequeñas dosis: una etiqueta, un botón, el fondo suave de un bloque. Nada compite con el texto de la usuaria, que es lo importante de cada pantalla. Si una pantalla parece un panel de administración, sobra algo.

Los valores de este documento sustituyen a los «de partida» del PRP: los contrastes de la tabla están calculados.

## Paleta

Define estos colores como variables de tema, una sola vez. Los componentes usan las variables, nunca valores sueltos.

### Neutros

| Variable | Valor | Uso |
|---|---|---|
| `fondo` | `#FFFFFF` | Fondo de la app y de las tarjetas |
| `fondo-suave` | `#FAFBF9` | Barra lateral, zonas secundarias |
| `borde` | `#ECEFEC` | Líneas y bordes de tarjeta |
| `tinta` | `#2B312D` | Texto principal |
| `tinta-suave` | `#6B736E` | Texto secundario, ayudas |
| `tinta-tenue` | `#8A918C` | Solo elementos decorativos o texto grande; no llega a contraste de texto normal |

### Verdes

| Variable | Valor | Uso |
|---|---|---|
| `verde-50` | `#F4F8F4` | Fondo de bloques destacados, elemento activo del menú |
| `verde-100` | `#E6F0E7` | Fondo de etiquetas |
| `verde-200` | `#CFE2D2` | Bordes con color, celdas del mapa |
| `verde-300` | `#A9CBB0` | Decoración, foco |
| `verde-700` | `#3D6B52` | Botón principal, enlaces, texto de acento |

### Rosas

| Variable | Valor | Uso |
|---|---|---|
| `rosa-50` | `#FDF5F6` | Fondo de bloques destacados |
| `rosa-100` | `#FBE8EC` | Fondo de etiquetas |
| `rosa-200` | `#F6D0D8` | Bordes con color |
| `rosa-300` | `#EDB1BF` | Decoración |
| `rosa-800` | `#8F3F58` | Texto sobre rosa claro |
| `frambuesa` | `#B5506F` | Finalidad Convert, acento fuerte |

### Estados del sistema

| Variable | Texto | Fondo | Uso |
|---|---|---|---|
| Aviso | `#8A6116` | `#FBF3DF` | Falta la llamada a la acción, dato pendiente, atrasada |
| Error | `#A63D3D` | `#FBEAEA` | No se pudo guardar |
| Correcto | `#3D6B52` | `#E6F0E7` | Guardado, copiado, publicado |

### Contrastes comprobados

Todos superan el 4,5:1 exigido para texto normal. Si cambias un valor, vuelve a calcular.

| Texto | Fondo | Contraste |
|---|---|---|
| `tinta` | blanco | 13,29 |
| `tinta-suave` | blanco | 4,88 |
| blanco | `verde-700` | 6,13 |
| `verde-700` | `verde-100` | 5,25 |
| `verde-700` | `verde-50` | 5,72 |
| `rosa-800` | `rosa-100` | 5,91 |
| blanco | `frambuesa` | 4,84 |
| `#2F6B5E` | `#E0F2EC` | 5,34 |
| Aviso | su fondo | 4,99 |
| Error | su fondo | 5,38 |

Dos combinaciones que parecen naturales y **no** llegan: blanco sobre un verde medio (`#4F8767`, 4,21) y `tinta-tenue` sobre blanco (3,23). Por eso el botón principal usa `verde-700` y el texto secundario usa `tinta-suave`.

## Finalidades

Son las etiquetas más repetidas de la app y deben reconocerse al instante. Dos verdes y dos rosas, de claro a intenso, que además cuentan el recorrido de atraer a convertir.

| Finalidad | Fondo | Texto | Icono sugerido |
|---|---|---|---|
| Attract · Atraer | `#E0F2EC` | `#2F6B5E` | Imán o destello |
| Nurture · Cultivar | `rosa-100` | `rosa-800` | Brote o corazón |
| Position · Posicionarme | `verde-700` | blanco | Brújula o estrella |
| Convert · Convertir | `frambuesa` | blanco | Flecha o bolsa |

Siempre llevan su nombre escrito. En espacios muy pequeños (una celda del mes en móvil) pueden reducirse a un punto de color, pero entonces el nombre aparece al tocar. En la interfaz se escribe «Attract · Atraer» donde hay sitio y «Atraer» donde no.

## Otros colores con significado

- **Estados de pieza.** No usan colores fuertes, para no pelear con las finalidades. Etiqueta gris clara con un punto: gris (Borrador), ámbar (En preparación), verde claro (Listo), verde (Planificado) y marca de verificación (Publicado).
- **Pilares.** La usuaria elige entre ocho tonos pastel derivados de la paleta (cuatro verdes y cuatro rosas o melocotón). Se muestran como un punto de color junto al nombre, nunca como fondo completo.
- **Lanzamientos.** Una banda fina `rosa-200` en el calendario y una marca con el nombre en las tarjetas.

## Tipografía

- **Títulos**: una serif suave y con carácter (por ejemplo, Fraunces). Solo en títulos de página, nombre de la app y la frase destacada de «Elegir una para hoy».
- **Todo lo demás**: una sans muy legible (por ejemplo, Inter).
- Cárgalas con el mecanismo de fuentes del framework, alojadas con la app.

| Uso | Tamaño | Peso |
|---|---|---|
| Título de página | 28 px (24 en móvil) | Serif, normal |
| Título de bloque | 18 px | Sans, seminegrita |
| Texto de interfaz | 15 px | Normal |
| Texto que escribe la usuaria (guion, correo, frase) | 17 px, interlineado 1,6 | Normal |
| Ayudas y metadatos | 13 px | Normal, `tinta-suave` |

El texto que escribe la usuaria es algo mayor que el de la interfaz y su columna no pasa de unos 70 caracteres de ancho: se escribe y se lee mejor.

En móvil los campos de texto usan al menos 16 px, para que el navegador no amplíe la página al enfocarlos.

## Forma y espacio

- Radios: 12 px en tarjetas y diálogos, 8 px en botones y campos, redondeo completo en etiquetas.
- Bordes de 1 px en `borde`. Las tarjetas se separan del fondo por el borde, no por sombra.
- Sombra solo en lo que flota (hojas, diálogos, menús), muy suave.
- Sin degradados, sin ilustraciones recargadas y sin iconos de colores. Iconos de línea fina de una sola familia.
- Espaciado en múltiplos de 4 px. Entre bloques de una página, 32 px; dentro de una tarjeta, 16 px.
- Ancho máximo del contenido: 1200 px, centrado. Las fichas de redacción, 720 px para la columna de texto.

## Componentes

| Componente | Notas |
|---|---|
| Botón principal | Fondo `verde-700`, texto blanco. Uno por pantalla como mucho |
| Botón secundario | Fondo blanco, borde, texto `tinta` |
| Botón discreto | Solo texto `verde-700`. Para acciones repetidas en listas |
| Botón de copiar | Secundario, con icono. Cambia a «Copiado ✓» en verde |
| Etiqueta | Píldora con fondo claro y texto oscuro del mismo tono |
| Tarjeta | Fondo blanco, borde, radio 12 px |
| Campo | Borde `borde`, al enfocar borde `verde-300` y un halo suave |
| Hoja inferior | Móvil. Sube desde abajo, con asa y esquinas superiores redondeadas |
| Aviso breve | Abajo, centrado, con «Deshacer» cuando proceda. Desaparece solo |
| Bloque destacado | Fondo `verde-50` o `rosa-50`, sin borde. Para el bloque Convert, la banda de publicado y los avisos |
| Estado vacío | Icono de línea, una frase y un botón |

El foco de teclado se ve siempre: contorno de 2 px en `verde-300` con separación.

## Móvil

- Barra inferior de navegación con el «+» central destacado en `verde-700`.
- Zonas táctiles de 44 px como mínimo.
- Las acciones principales de cada pantalla quedan al alcance del pulgar: abajo o en la propia tarjeta, no en la esquina superior.
- La app respeta las zonas seguras del teléfono (muesca y barra inferior del sistema).
- Nada depende de pasar el cursor por encima ni de arrastrar: todo tiene alternativa con un toque.
- Las tablas de ordenador se convierten en tarjetas; la única tabla que se conserva es el mapa, con desplazamiento horizontal.

## Movimiento

Poco y rápido. Transiciones de 150 a 200 ms al abrir hojas, cambiar de pestaña y soltar una tarjeta arrastrada. Sin animaciones de entrada en las listas ni efectos decorativos. Si el sistema pide reducir el movimiento, se eliminan.

## Accesibilidad

- Contraste AA en todo el texto, según la tabla.
- Toda la app se maneja con teclado, incluidos reordenar tarjetas y mover fechas.
- El color nunca es la única señal: finalidades con nombre, estados con texto, pendiente con la palabra «Pendiente».
- Campos con etiqueta visible, no solo con texto de ejemplo dentro.
- Los avisos breves se anuncian a los lectores de pantalla.
- Idioma de la página declarado como español.

## Voz de la interfaz

Los textos de la app hablan como hablaría la usuaria: en primera persona para sus acciones y preguntas («Tengo que preparar», «Qué acción pido», «La que voy a usar») y con frases cortas y amables en los mensajes.

- Botones con verbo: «Guardar», «Copiar frase», «Marcar publicado».
- Errores que dicen qué pasó y qué hacer: «No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo.»
- Sin jerga técnica ni anglicismos innecesarios. Se conservan los términos que la usuaria usa en su encargo: reel, B-roll, story, broadcast, CTA y los cuatro nombres de finalidad.
- Fechas escritas como se dicen: «jueves 5 de noviembre», «hace 2 días», «faltan 3 días».
- Números con formato español: `1.234`, `12,5 %`, `147 €`.

## Identidad

No hay logo. El nombre «Rosedal» se escribe con la tipografía de títulos en `verde-700`. Si la usuaria aporta un logo, se usa tal cual, sin redibujarlo ni cambiarle el color.

El icono de la aplicación instalada es una forma sencilla (una hoja o un capullo de rosa de trazo simple) en `verde-700` sobre blanco.
