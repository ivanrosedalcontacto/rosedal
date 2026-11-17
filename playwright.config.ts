import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/** Lee el .env.local para que las pruebas tengan las credenciales del usuario de pruebas. */
function cargarEntorno() {
  try {
    for (const linea of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      if (!linea.includes("=") || linea.startsWith("#")) continue;
      const i = linea.indexOf("=");
      const clave = linea.slice(0, i).trim();
      const valor = linea.slice(i + 1).trim();
      if (!process.env[clave]) process.env[clave] = valor;
    }
  } catch {
    // Sin .env.local: las pruebas fallarán al pedir credenciales.
  }
}
cargarEntorno();

/**
 * Pruebas de extremo a extremo de Rosedal.
 * Necesitan un usuario de pruebas (scripts/usuario-prueba.mjs) y la app en marcha.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
  },
  projects: [
    {
      name: "movil",
      use: { ...devices["Pixel 7"], isMobile: true, hasTouch: true },
    },
    {
      name: "ordenador",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
});
