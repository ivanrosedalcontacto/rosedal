import { expect, test } from "@playwright/test";
import { entrar, textoUnico } from "./ayuda";

/**
 * Recorrido 2: planificar un reel de prueba y registrar su publicación.
 * Ver `docs/06-verificacion-y-entrega.md`.
 */
test("R2: planificar un reel de prueba y registrar su publicación", async ({ page }) => {
  const frase = textoUnico("El lunes no empieza el lunes");
  const hoy = new Date().toISOString().slice(0, 10);

  await entrar(page);

  // Se parte de una frase nueva, guardada con la captura rápida.
  await page.getByRole("button", { name: "+ Frase para B-roll" }).first().click();
  const hoja = page.getByRole("dialog", { name: "Nueva frase" });
  await hoja.getByLabel("Nueva frase").fill(frase);
  await hoja.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Guardado en Frases ✓")).toBeVisible();

  // 1-2. Planificar el reel de prueba con su plano y su fecha.
  await page.goto("/frases");
  const tarjeta = page.locator("article").filter({ hasText: frase }).first();
  await tarjeta.getByRole("button", { name: "Planificar reel" }).click();
  const form = tarjeta.locator("form").filter({ hasText: "Planificar reel de prueba" });
  await expect(form.getByLabel("Texto en pantalla")).toHaveValue(frase);
  await form.getByLabel("Plano (opcional)").fill("Plano de mis manos abriendo la agenda");
  await form.getByLabel("Fecha prevista (opcional)").fill(hoy);
  await form.getByRole("button", { name: "Planificar reel de prueba" }).click();
  await expect(form.getByRole("button", { name: "Planificar reel de prueba" })).toBeEnabled({ timeout: 30_000 });

  // 3. Abrir la ficha creada y comprobar sus datos.
  await page.goto("/biblioteca");
  const reel = page.locator("a").filter({ hasText: frase }).first();
  await reel.click();
  await page.waitForURL("**/piezas/**");
  await expect(page.getByRole("heading", { level: 1, name: /Reel de prueba/ })).toBeVisible();
  await expect(page.getByText("Reel de prueba").first()).toBeVisible();
  await expect(page.getByText("Attract · Atraer").first()).toBeVisible();
  // Duración y plano se guardan, pero la ficha ya no los muestra (PRP-002).
  await expect(page.getByLabel("Texto en pantalla")).toHaveValue(frase);

  // 4. Filtrar «Sin usar»: la frase sigue ahí con el reel previsto.
  await page.goto("/frases");
  await page.getByLabel("Mostrar").selectOption("sin_usar");
  await page.getByRole("button", { name: "Aplicar" }).click();
  const sinUsar = page.locator("article").filter({ hasText: frase }).first();
  await expect(sinUsar).toBeVisible();
  await expect(sinUsar).toContainText("Reel de prueba previsto");

  // 5. Filtrar «Ya utilizadas»: la frase no aparece.
  await page.getByLabel("Mostrar").selectOption("usadas");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.locator("article").filter({ hasText: frase })).toHaveCount(0);

  // 6. Volver al reel y marcarlo como publicado con fecha de hoy y un enlace.
  await page.goto("/biblioteca");
  await page.locator("a").filter({ hasText: frase }).first().click();
  await page.getByLabel("Fecha real").fill(hoy);
  await page.getByLabel("Enlace publicado (opcional)").fill("https://ejemplo.com/reel-de-prueba");
  await page.getByRole("button", { name: "Marcar como publicada" }).click();
  await expect(page.getByText(/Publicado el/)).toBeVisible({ timeout: 30_000 });

  // 7. La frase ya figura como utilizada.
  await page.goto("/frases");
  await page.getByLabel("Mostrar").selectOption("usadas");
  await page.getByRole("button", { name: "Aplicar" }).click();
  const usada = page.locator("article").filter({ hasText: frase }).first();
  await expect(usada).toBeVisible();
  await expect(usada).toContainText("Usada 1 vez");

  // 8. El historial guarda la fecha, el enlace y el texto exacto.
  await usada.getByRole("button", { name: "Historial" }).click();
  const historial = usada.locator("div").filter({ hasText: "Historial de uso" }).first();
  await expect(historial).toContainText(hoy);
  await expect(historial).toContainText("https://ejemplo.com/reel-de-prueba");
  await expect(historial).toContainText(frase);
});
