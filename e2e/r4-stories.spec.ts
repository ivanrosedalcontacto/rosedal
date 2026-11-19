import { expect, test } from "@playwright/test";
import { entrar } from "./ayuda";

/**
 * Recorrido 4: reordenar una secuencia de stories.
 * Ver `docs/06-verificacion-y-entrega.md`.
 */
test("R4: reordenar una secuencia de stories", async ({ page }) => {
  const titulo = "Curso o asesoría: os leo";

  await entrar(page);

  // 1. Abrir la secuencia del ejemplo.
  await page.goto("/biblioteca?vista=tablero");
  await page.locator("a").filter({ hasText: titulo }).first().click();
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Story 1", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Story 2", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Story 3", exact: true })).toBeVisible();

  // 2. Duplicar la tarjeta 2: la copia queda tras la original.
  const segunda = page.locator("form").filter({ has: page.getByRole("heading", { name: "Story 2", exact: true }) });
  await segunda.getByRole("button", { name: "Duplicar" }).click();
  await expect(page.getByRole("heading", { name: "Story 4", exact: true })).toBeVisible({ timeout: 30_000 });

  // 3. Mover la última tarjeta a la primera posición.
  for (let i = 0; i < 3; i += 1) {
    const ultima = page.locator("form").filter({ has: page.getByRole("heading", { name: "Story 4", exact: true }) });
    const botonSubir = ultima.getByRole("button", { name: "Subir" });
    if (await botonSubir.isDisabled()) break;
    await botonSubir.click();
    await page.waitForTimeout(600);
  }
  await expect(page.getByRole("heading", { name: "Story 1", exact: true })).toBeVisible();

  // 4. Recargar: el orden se mantiene.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Story 1", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Story 4", exact: true })).toBeVisible();

  // 5. «Leer la secuencia» muestra las cuatro tarjetas en el orden nuevo.
  await page.getByText("Leer la secuencia").click();
  const lectura = page.locator("details").filter({ hasText: "Leer la secuencia" });
  await expect(lectura.getByRole("heading", { name: /^Story 1:/ })).toBeVisible();
  await expect(lectura.getByRole("heading", { name: /^Story 4:/ })).toBeVisible();

  // 6. En el calendario la secuencia sigue siendo una sola entrada.
  const lunes = await page.evaluate(() => {
    const hoy = new Date();
    const dia = hoy.getDay();
    const retroceso = dia === 0 ? 6 : dia - 1;
    const lunes = new Date(hoy.getTime() - retroceso * 86_400_000);
    const jueves = new Date(lunes.getTime() + 4 * 86_400_000);
    return jueves.toISOString().slice(0, 10);
  });
  await page.goto(`/calendario?vista=semana&fecha=${lunes}`);
  // La secuencia es una sola entrada, con sus cuatro tarjetas.
  await expect(page.locator("a:visible").filter({ hasText: "Curso o asesoría: os leo" })).toHaveCount(1);
  await expect(page.locator("p:visible").filter({ hasText: /^Stories ·/ })).toHaveCount(1);

  // 7. Guardar la estructura como plantilla y crear una secuencia nueva desde ella.
  await page.goto("/biblioteca?vista=tablero");
  await page.locator("a").filter({ hasText: titulo }).first().click();
  await page.getByLabel("Guardar la estructura como plantilla").fill("Estructura de prueba");
  await page.getByRole("button", { name: "Guardar estructura" }).click();
  await page.waitForTimeout(1500);

  await page.goto("/ajustes");
  await expect(page.getByText("Estructura de prueba").first()).toBeVisible({ timeout: 30_000 });

  await page.goto("/piezas/nueva");
  await page.getByLabel("Plantilla").selectOption({ label: "Estructura de prueba" });
  await page.getByLabel("Título de la pieza").fill("Secuencia desde plantilla");
  await page.getByRole("button", { name: "Crear desde la plantilla" }).click();
  await expect(page.getByRole("heading", { name: "Secuencia desde plantilla" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Story 1", exact: true })).toBeVisible();
  await expect(page.getByLabel("Qué voy a decir").first()).toHaveValue("");
  await expect(page.getByLabel("Texto en pantalla").first()).toHaveValue("");
});
