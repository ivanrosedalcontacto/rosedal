import { expect, test } from "@playwright/test";
import { entrar } from "./ayuda";

/**
 * Preparación: la cuenta de pruebas necesita el ejemplo de `docs/04-datos-demo.md`
 * para los recorridos que usan el caso de Marta Vidal.
 */
test("el ejemplo está cargado", async ({ page }) => {
  test.setTimeout(240_000);
  await entrar(page);
  await page.goto("/ajustes");
  // Se parte siempre de un ejemplo limpio: las pruebas modifican sus datos (versiones de guion, orden de stories).
  // «Quitar ejemplo» solo borra lo marcado como ejemplo en la cuenta de pruebas.
  const quitar = page.getByRole("button", { name: "Quitar ejemplo" });
  if ((await quitar.count()) > 0) {
    await quitar.click();
    await page.getByRole("button", { name: "Sí, quitar el ejemplo" }).click();
  }
  const cargar = page.getByRole("button", { name: "Cargar ejemplo" });
  await cargar.click({ timeout: 120_000 });
  await expect(page.getByText(/Ahora mismo hay \d+ piezas/)).toBeVisible({ timeout: 120_000 });
});
