# Rosedal · cómo arrancarla

Esto es lo mínimo para usar la app. No hace falta saber programar.

## Qué es

Una app para llevar tu estudio editorial: lo que se te ocurre, las piezas que publicas, los lanzamientos que preparas y la revisión semanal de lo que salió.

## Qué necesitas

- Un ordenador o móvil con navegador.
- Una cuenta en Supabase (ya está creada: es donde se guardan tus datos).
- El proyecto descargado y Node.js instalado (versión 20 o superior).

## Cómo arrancarla

1. Abre una terminal en la carpeta del proyecto.
2. Escribe `npm install` (solo la primera vez).
3. Escribe `npm run dev`.
4. Abre `http://localhost:3000` en el navegador.
5. Inicia sesión con tu cuenta.

Para parar la app: pulsa `Ctrl + C` en la terminal.

## Dónde están tus datos

Todo se guarda en tu cuenta de Supabase, no en el móvil ni en el ordenador. Si borras la carpeta del proyecto, tus datos siguen ahí.

## El ejemplo

En **Ajustes → Datos de ejemplo** puedes cargar un caso completo (una mentora, su curso y su lanzamiento) para ver cómo se usa la app. Se quita desde el mismo sitio y **no toca nada de lo que hayas creado tú**.

## Copia de seguridad

En **Ajustes → Copia de seguridad** puedes descargar un archivo JSON con todo lo tuyo y restaurarlo en una cuenta vacía.

## Si algo falla

- **«No se conecta con la base de datos»**: comprueba que hay internet y que el archivo `.env.local` sigue en la carpeta del proyecto.
- **«Se ha guardado en el dispositivo»**: no hay conexión; el texto se enviará solo cuando vuelvas a tenerla.
- **Pantalla en blanco**: reinicia con `npm run dev` (Ctrl + C y vuelve a lanzarlo).
