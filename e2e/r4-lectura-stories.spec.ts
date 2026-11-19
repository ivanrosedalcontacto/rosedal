import { expect, test } from "@playwright/test";
import { entrar } from "./ayuda";

/** Modo lectura de stories a pantalla completa (docs/01-pantallas-contenido.md, «Leer la secuencia»). */
test("Lectura de stories a pantalla completa: Anterior, Siguiente y cerrar", async ({ page }) => {
  await entrar(page);
  await page.goto("/biblioteca?vista=tablero");
  await page.locator("a").filter({ hasText: "Curso o asesoría: os leo" }).first().click();
  await page.waitForURL("**/piezas/**");

  await page.getByRole("button", { name: "Leer a pantalla completa" }).click();
  const lectura = page.getByRole("dialog", { name: "Lectura de la secuencia de stories" });
  await expect(lectura).toBeVisible();
  await expect(lectura.getByText(/Story 1 de \d+/)).toBeVisible();
  await expect(lectura.getByRole("button", { name: "Anterior" })).toBeDisabled();
  await page.screenshot({ path: "test-results/lectura-stories-1.png" });

  await lectura.getByRole("button", { name: "Siguiente" }).click();
  await expect(lectura.getByText(/Story 2 de \d+/)).toBeVisible();
  await lectura.getByRole("button", { name: "Anterior" }).click();
  await expect(lectura.getByText(/Story 1 de \d+/)).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(lectura.getByText(/Story 2 de \d+/)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(lectura).toBeHidden();
  await expect(page.getByRole("button", { name: "Leer a pantalla completa" })).toBeFocused();
});
