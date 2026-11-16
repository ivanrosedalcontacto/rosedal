# Rosedal — guía de entrada para el agente programador

Rosedal es un estudio editorial personal: una aplicación web en español para una creadora de contenido que vende servicios y productos online. La usa para pensar qué publicar, escribirlo, organizarlo, planificarlo y, después de publicar por su cuenta, registrar qué salió, cuándo y con qué resultado.

Vas a construirla desde cero. El repositorio solo contiene esta documentación y `instrucciones.txt`, que es el encargo original de la usuaria y la fuente de verdad sobre lo que quiere.

> **¿Retomas el proyecto?** Lee primero `continuar.md`: estado real del código, qué falta y cómo seguir.

## Cómo leer la documentación

Lee los documentos en este orden antes de escribir código. Cada uno responde a una pregunta distinta y no se repiten entre sí.

| Documento | Qué resuelve |
|---|---|
| `instrucciones.txt` | El encargo original, con las palabras de la usuaria |
| `docs/00-vision-y-alcance.md` | Para quién es, qué entra, qué queda fuera y por qué |
| `.claude/PRPs/prp-rosedal-estudio-editorial.md` | El contrato técnico: pila, arquitectura, modelo de datos, reglas de negocio, fases, decisiones pendientes y trampas conocidas |
| `docs/01-pantallas-contenido.md` | Hoy, captura, ideas, biblioteca, guiones, grabación, frases, stories, recursos |
| `docs/02-pantallas-planificacion.md` | Email, ofertas, lanzamientos, calendario, mapa, revisión semanal, ajustes |
| `docs/03-diseno-visual.md` | Paleta comprobada, tipografía, componentes, móvil y accesibilidad |
| `docs/04-datos-demo.md` | El ejemplo que hay que sembrar, con sus textos |
| `docs/05-mejoras-de-mercado.md` | Funciones añadidas al encargo, inspiradas en herramientas del mercado, con sus tablas y reglas |
| `docs/06-verificacion-y-entrega.md` | Los siete recorridos paso a paso, la lista de aceptación y el informe final |

Si dos documentos parecen contradecirse, manda `instrucciones.txt`; después el PRP; después `docs/`. Anota la contradicción en el informe final en lugar de resolverla en silencio.

El PRP está pendiente de aprobación y tiene decisiones abiertas (D1 a D5). No empieces la Fase 1 hasta que la usuaria las haya respondido.

## Lo que no se negocia

Estas reglas existen porque incumplirlas rompe la promesa central del producto. Si una tarea parece exigir saltarse alguna, para y revisa el planteamiento.

1. **Solo texto.** La app no carga, almacena, reproduce, muestra ni analiza archivos multimedia. No hay ningún `<input type="file">` salvo el de importar la copia de seguridad en JSON. Un reel es una ficha editorial, un B-roll es una descripción escrita y una story es una tarjeta de planificación.
2. **Nada sale de la app por sí solo.** No hay publicación automática, envío de correos, conexiones con redes sociales ni con Kit, ni llamadas a servicios de IA. La usuaria copia el texto, lo lleva a su herramienta y marca el resultado a mano.
3. **Sin claves ni credenciales de la usuaria.** Ella nunca introduce claves, ni conecta cuentas de redes o de correo, para usar la app. La base de datos se configura una vez, según la decisión D1 del PRP.
4. **Capturar es escribir y guardar.** Las tres capturas rápidas no piden clasificación, título ni ningún campo más. La clasificación puede esperar.
5. **Lo publicado no se pierde.** Al marcar algo como publicado o enviado se guarda una copia exacta del texto usado. Editar, adaptar o reutilizar después nunca altera esa copia ni sus resultados.
6. **Una pieza, una entrada en el calendario.** Las versiones alternativas de un guion o de un asunto y las tarjetas de una secuencia de stories viven dentro de su pieza.
7. **La app informa, no sermonea.** Muestra el equilibrio entre pilares y finalidades sin decidir cuál es el correcto. Los avisos (por ejemplo, la llamada a la acción ausente) advierten y dejan continuar.
8. **Todo en español.** Interfaz, mensajes de error, datos de demostración, fechas (semana que empieza en lunes) y formato numérico (`1.234,5 €`).

## Reglas de código

- TypeScript estricto. Nunca `any`; si no conoces el tipo, `unknown` y estrecha.
- Toda entrada de la usuaria se valida con Zod en el servidor antes de tocar la base de datos.
- KISS, YAGNI y DRY, en ese orden cuando choquen.
- Archivos de 500 líneas como máximo y funciones de 50. Si te acercas, divide por responsabilidad.
- Nombres: variables y funciones en `camelCase`, componentes en `PascalCase`, archivos en `kebab-case`.
- El vocabulario del dominio va en español en el código (`pieza`, `frase`, `lanzamiento`, `finalidad`), tal como aparece en el modelo de datos del PRP. Así el código y la interfaz hablan igual y no hay que traducir de cabeza.
- Arranca siempre con `npm run dev`, nunca con `next dev` ni con un puerto fijo.
- En esta máquina (Windows) comprueba que una herramienta existe antes de planificar con ella. Las compilaciones y pruebas largas se lanzan por tramos, con un registro por tramo.
- No expongas secretos en el código: las claves de la base de datos van en variables de entorno y nunca en el repositorio.

## Cómo trabajar

- Construye en el orden de las fases del PRP, con el skill `bucle-agentico`. Cada fase termina con la app funcionando y sus comprobaciones pasadas; no abras la siguiente con la anterior a medias.
- Antes de cada fase, relee las secciones de reglas y pantallas que le correspondan. Los detalles que parecen menores (conservar los saltos de línea de una frase, distinguir un cero de un dato pendiente) son justo lo que la usuaria va a comprobar.
- Las versiones de las dependencias no están fijadas aquí a propósito. Instala las estables actuales y consulta su documentación vigente; no programes de memoria contra una API que puede haber cambiado.
- Cuando un error te obligue a rectificar, añade una línea al apartado «Aprendizajes» de este archivo con el error, el arreglo y dónde aplica, para no repetirlo.
- Sé fiel al informar. Si una prueba falla, dilo con su salida. Si algo no pudiste comprobarlo, dilo. La entrega incluye una lista explícita de lo pendiente.

## Aprendizajes

### 2026-11-16: Cache Components activado por defecto en Next 16
- **Error**: `create-next-app` deja `cacheComponents: true` y `partialPrefetching: true`. Las páginas que leen la sesión de Supabase fallan la validación («unstable value Date.now() while prerendering») y el build puede romperse.
- **Fix**: quitar ambas opciones de `next.config.ts`. La app es 100 % datos por usuaria y por petición; no hay contenido cacheable.
- **Aplicar en**: cualquier proyecto Next 16 con autenticación por cookies.

### 2026-11-16: Heredocs largos en Bash
- **Error**: un comando con varios `cat <<EOF` y tildes falló entero («unexpected EOF») y no creó ningún archivo.
- **Fix**: crear archivos con la herramienta Write, uno a uno; Bash solo para ejecutar.
- **Aplicar en**: toda creación de archivos en esta máquina.
