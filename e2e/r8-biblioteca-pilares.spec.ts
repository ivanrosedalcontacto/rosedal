import { expect, test } from "@playwright/test";
import { entrar } from "./ayuda";

/**
 * Biblioteca por pilares (PRP-002, fase 4): crear dentro de un pilar,
 * pasar a «Ya grabadas» y enviar a la papelera en grupo.
 */
test.setTimeout(120_000);

test("Biblioteca por pilares: crear en un pilar, pasar a Ya grabadas y borrar en grupo", async ({ page }) => {
  const pilar = "Energía y descanso";
  const marca = Date.now();
  const primera = `Pilar grabar ${marca}`;
  const segunda = `Pilar borrar ${marca}`;

  await entrar(page);

  // 1. La biblioteca muestra una carpeta por pilar.
  await page.goto("/biblioteca");
  const carpeta = page.getByRole("link", { name: new RegExp(pilar) });
  await expect(carpeta).toBeVisible();
  await carpeta.click();
  await expect(page.getByRole("heading", { level: 1, name: pilar })).toBeVisible();
  const urlCarpeta = page.url();

  // 2. «+ Nueva pieza» desde la carpeta guarda la pieza en ese pilar.
  for (const titulo of [primera, segunda]) {
    await page.goto(urlCarpeta);
    await page.getByRole("link", { name: "+ Nueva pieza" }).click();
    await expect(page.getByText(`en el pilar «${pilar}»`)).toBeVisible();
    await page.getByRole("textbox", { name: "Título", exact: true }).fill(titulo);
    await page.getByRole("button", { name: "Crear pieza" }).click();
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByLabel("Pilar")).toHaveValue(urlCarpeta.split("/").pop() ?? "");
  }

  // 3. Las dos están por grabar en la carpeta.
  await page.goto(urlCarpeta);
  await expect(page.getByRole("link", { name: primera })).toBeVisible();
  await expect(page.getByRole("link", { name: segunda })).toBeVisible();

  // 4. Pasar la primera a «Ya grabadas»: sale de la lista y queda en el desplegable cerrado.
  await page.getByLabel(`Seleccionar «${primera}»`).check();
  await page.getByRole("button", { name: "Pasar a Ya grabadas" }).click();
  const yaGrabadas = page.locator("details").filter({ hasText: /Ya grabadas \(\d+\)/ });
  await expect(page.getByLabel(`Seleccionar «${primera}»`)).toHaveCount(0, { timeout: 30_000 });
  await yaGrabadas.locator("summary").click();
  await expect(yaGrabadas.getByRole("link", { name: primera })).toBeVisible();
  await expect(yaGrabadas.locator("li").filter({ hasText: primera })).toContainText("Grabado");

  // 5. Enviar la segunda a la papelera (con confirmación).
  page.once("dialog", (dialogo) => dialogo.accept());
  await page.getByLabel(`Seleccionar «${segunda}»`).check();
  await page.getByRole("button", { name: "Enviar a la papelera" }).click();
  await expect(page.getByRole("link", { name: segunda })).toHaveCount(0, { timeout: 30_000 });
});
