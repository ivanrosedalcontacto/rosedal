import { expect, test } from "@playwright/test";
import { entrar } from "./ayuda";

/**
 * Filtros en su propia pestaña (PRP-002, fase 6): los resultados se ven al entrar,
 * los filtros viven en «Filtros (n)» y no hay cuadro de búsqueda.
 */
test.setTimeout(120_000);

test("Ideas: «de este lanzamiento en 30 minutos» con dos filtros en su pestaña", async ({ page }) => {
  await entrar(page);
  await page.goto("/ideas?vista=bandeja");

  // Al entrar se ven los resultados; los filtros están ocultos y no hay buscador.
  await expect(page.getByRole("tab", { name: /Resultados \(\d+\)/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(page.getByLabel("Lanzamiento")).toBeHidden();

  await page.getByRole("tab", { name: "Filtros" }).click();
  await page.getByLabel("Lanzamiento").selectOption({ label: "Semana en Calma · edición de otoño" });
  await expect(page.getByRole("tab", { name: "Filtros (1)" })).toBeVisible({ timeout: 30_000 });
  await page.getByLabel("Tiempo máximo de preparación").selectOption("30");
  await expect(page.getByRole("tab", { name: "Filtros (2)" })).toBeVisible({ timeout: 30_000 });

  // Los filtros se conservan al recargar (van en la dirección).
  await page.reload();
  await expect(page.getByRole("tab", { name: "Filtros (2)" })).toBeVisible();
  await page.getByRole("tab", { name: /Resultados/ }).click();
  const resultados = page.getByRole("tabpanel");
  await expect(resultados).toBeVisible();

  // «Quitar filtros» vuelve a la bandeja completa.
  await page.getByRole("link", { name: "Quitar filtros" }).click();
  await expect(page.getByRole("tab", { name: "Filtros", exact: true })).toBeVisible({ timeout: 30_000 });
});

test("Sin buscadores visibles en Frases, Email, Mapa y Más", async ({ page }) => {
  await entrar(page);
  for (const ruta of ["/frases", "/email?vista=broadcasts", "/mapa", "/mas"]) {
    await page.goto(ruta);
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Buscar en la app" })).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Buscar" })).toHaveCount(0);
  }
  // Mapa y Email: pestaña de filtros con los resultados por defecto.
  await page.goto("/mapa");
  await expect(page.getByRole("tab", { name: /Resultados/ })).toHaveAttribute("aria-selected", "true");
  await page.goto("/email?vista=broadcasts");
  await expect(page.getByRole("tab", { name: /Resultados/ })).toHaveAttribute("aria-selected", "true");

  // La búsqueda global sigue con Ctrl + K en el ordenador (en el móvil no hay teclado ni lupa).
  if (test.info().project.name === "ordenador") {
    await page.keyboard.press("Control+k");
    await expect(page.locator("input:focus")).toBeVisible();
    await page.keyboard.press("Escape");
  }
});
