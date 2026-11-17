import { type Page } from "@playwright/test";

/** Credenciales del usuario de pruebas (en .env.local). */
function credenciales() {
  const correo = process.env.E2E_EMAIL;
  const clave = process.env.E2E_PASSWORD;
  if (!correo || !clave) throw new Error("Faltan E2E_EMAIL y E2E_PASSWORD en .env.local");
  return { correo, clave };
}

/** Entra en la app con el usuario de pruebas. */
export async function entrar(page: Page) {
  const { correo, clave } = credenciales();
  await page.goto("/login");
  await page.getByLabel("Correo").fill(correo);
  await page.getByLabel("Contraseña").fill(clave);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/hoy/);
}

/** Texto único de la prueba, para no repetir la misma frase cada vez. */
export function textoUnico(prefijo: string): string {
  return `${prefijo} ${Date.now()}`;
}

/** Los días de la semana actual en el huso de la app (Madrid). */
export function diasDeEstaSemana(): { lunes: string; martes: string; miercoles: string; jueves: string } {
  const hoy = new Date();
  const retroceso = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
  const lunes = new Date(hoy.getTime() - retroceso * 86_400_000);
  const dia = (n: number) => {
    const f = new Date(lunes.getTime() + n * 86_400_000);
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
  };
  return { lunes: dia(0), martes: dia(1), miercoles: dia(2), jueves: dia(3) };
}
