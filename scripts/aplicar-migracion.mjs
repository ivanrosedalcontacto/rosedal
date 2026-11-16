// Aplica un archivo SQL a la base de datos de Supabase usando el token de .env.local.
// Uso: node scripts/aplicar-migracion.mjs supabase/migrations/archivo.sql
// El token nunca se imprime.
import { readFileSync } from "node:fs";

const archivo = process.argv[2];
if (!archivo) {
  console.error("Indica el archivo SQL a aplicar.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const token = env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Falta SUPABASE_ACCESS_TOKEN en .env.local");
  process.exit(1);
}
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const query = readFileSync(archivo, "utf8");

const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const cuerpo = (await r.text()).replaceAll(token, "<oculto>");
console.log(r.status, cuerpo.slice(0, 800));
process.exit(r.ok ? 0 : 1);
