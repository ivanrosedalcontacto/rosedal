import { expect, test } from "@playwright/test";
import { entrar } from "./ayuda";

/**
 * Preparación: la cuenta de pruebas necesita el ejemplo de `docs/04-datos-demo.md`
 * para los recorridos que usan el caso de Marta Vidal.
 */
test("el ejemplo está cargado", async ({ page }) => {
  await entrar(page);
  await page.goto("/ajustes");
  const cargar = page.getByRole("button", { name: "Cargar ejemplo" });
  if ((await cargar.count()) > 0) {
    await cargar.click();
  }
  await expect(page.getByRole("button", { name: /Quitar ejemplo/ })).toBeVisible({ timeout: 120_000 });
});
