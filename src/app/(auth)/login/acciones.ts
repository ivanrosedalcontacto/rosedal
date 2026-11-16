"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { crearClienteServidor } from "@/shared/lib/supabase/servidor";

const esquema = z.object({
  email: z.string().trim().email("Escribe un correo válido."),
  password: z.string().min(1, "Escribe tu contraseña."),
});

export type EstadoLogin = { error: string | null };

export async function iniciarSesion(_previo: EstadoLogin, datos: FormData): Promise<EstadoLogin> {
  const r = esquema.safeParse({ email: datos.get("email"), password: datos.get("password") });
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword(r.data);
  if (error) return { error: "El correo o la contraseña no son correctos." };
  redirect("/hoy");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
