import { expect, test } from "@playwright/test";
import { diasDeEstaSemana, entrar } from "./ayuda";

/**
 * Calendario por pilares (PRP-002, fase 5): pulsar un día, elegir el pilar y
 * una pieza Editada; el día muestra el título y la finalidad.
 */
test.setTimeout(120_000);

test("Calendario por pilares: programar un día eligiendo pilar y pieza editada", async ({ page }) => {
  const pilar = "Negocio con calma";
  const titulo = `Calendario pilar ${Date.now()}`;
  const { jueves } = diasDeEstaSemana();

  await entrar(page);

  // 1. Una pieza Editada en el pilar, sin fecha.
  await page.goto("/biblioteca");
  await page.getByRole("link", { name: new RegExp(pilar) }).click();
  // Esperar a la carpeta: la portada también tiene un «+ Nueva pieza» (sin pilar).
  await expect(page.getByRole("heading", { level: 1, name: pilar })).toBeVisible();
  await page.getByRole("link", { name: "+ Nueva pieza" }).click();
  await expect(page.getByText(`en el pilar «${pilar}»`)).toBeVisible();
  await page.getByRole("textbox", { name: "Título", exact: true }).fill(titulo);
  await page.getByLabel("Finalidad").selectOption({ label: "Nurture · Cultivar" });
  await page.getByRole("button", { name: "Crear pieza" }).click();
  await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Pasar a Editado" }).click();
  await expect(page.getByRole("button", { name: "Pasar a Borrador" })).toBeVisible({ timeout: 30_000 });

  // 2. En el calendario: el jueves → «+ Programar» → pilar → pieza.
  await page.goto(`/calendario?vista=semana&fecha=${jueves}&programar=${jueves}`);
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("heading", { name: "¿De qué pilar?" })).toBeVisible();
  await panel.getByRole("link", { name: new RegExp(pilar) }).click();
  await expect(panel.getByRole("heading", { name: pilar })).toBeVisible();
  await panel.getByRole("button", { name: new RegExp(titulo) }).click();

  // 3. El panel se cierra y la pieza está ese día, con la finalidad debajo del título.
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 30_000 });
  const tarjeta = page.locator("article:visible").filter({ hasText: titulo }).first();
  await expect(tarjeta).toBeVisible();
  await expect(tarjeta).toContainText("Nurture · Cultivar");
  await expect(tarjeta).toContainText(pilar);
  await expect(tarjeta.locator("select")).toHaveValue(jueves);
});

test("Calendario: el botón «+ Programar» de un día abre el panel", async ({ page }) => {
  const { jueves } = diasDeEstaSemana();
  await entrar(page);
  await page.goto(`/calendario?vista=semana&fecha=${jueves}`);
  await page.getByRole("link", { name: /\+ Programar/ }).locator("visible=true").first().click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "¿De qué pilar?" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("dialog").getByRole("link", { name: "Cerrar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
