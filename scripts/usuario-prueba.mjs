// Crea (o recrea) el usuario de pruebas para las pruebas automáticas.
// Uso: node scripts/usuario-prueba.mjs
// Las credenciales se leen de E2E_EMAIL y E2E_PASSWORD en .env.local.
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const correo = env.E2E_EMAIL;
const clave = env.E2E_PASSWORD;
const token = env.SUPABASE_ACCESS_TOKEN;
if (!correo || !clave || !token) {
  console.error("Falta E2E_EMAIL, E2E_PASSWORD o SUPABASE_ACCESS_TOKEN en .env.local");
  process.exit(1);
}

const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const consulta = `
do $$
declare
  existe uuid;
begin
  select id into existe from auth.users where email = '${correo}';
  if existe is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      '${correo}', crypt('${clave}', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
    );
  else
    update auth.users
      set encrypted_password = crypt('${clave}', gen_salt('bf')), email_confirmed_at = now(), updated_at = now()
      where id = existe;
  end if;
end $$;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid()::text, u.id, jsonb_build_object('sub', u.id::text, 'email', '${correo}', 'email_verified', true), 'email', now(), now(), now()
from auth.users u
where u.email = '${correo}'
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

select id from auth.users where email = '${correo}';
`;

const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: consulta }),
});
const cuerpo = (await r.text()).replaceAll(token, "<oculto>");
console.log(r.status, cuerpo.slice(0, 400));
process.exit(r.ok ? 0 : 1);
