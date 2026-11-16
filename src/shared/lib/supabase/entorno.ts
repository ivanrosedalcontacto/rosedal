import { z } from "zod";

const esquema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
});

/** Variables de Supabase validadas. Falla con un mensaje claro si falta alguna. */
export function leerEntorno() {
  const r = esquema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!r.success) {
    throw new Error("Faltan las claves de Supabase en .env.local (revisa .env.local.example).");
  }
  return { url: r.data.NEXT_PUBLIC_SUPABASE_URL, clave: r.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
}
