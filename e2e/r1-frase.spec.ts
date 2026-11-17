import { expect, test } from "@playwright/test";
import { entrar, textoUnico } from "./ayuda";

/**
 * Recorrido 1 del encargo: guardar una frase en el móvil y copiarla después.
 * Ver `docs/06-verificacion-y-entrega.md`.
 */
test("R1: guardar una frase en el móvil y copiarla después", async ({ page, context }) => {
  const frase = textoUnico("Hoy no vas tarde.");
  const conBlanco = `${frase}\n\nVas a tu ritmo.`;

  await entrar(page);

  // 1. Abrir Hoy y pulsar «+ Frase para B-roll».
  await page.getByRole("button", { name: "+ Frase para B-roll" }).first().click();
  const hoja = page.getByRole("dialog", { name: "Nueva frase" });
  await expect(hoja).toBeVisible();

  // 2. Escribir tres líneas, la segunda en blanco.
  const area = hoja.getByLabel("Nueva frase");
  await area.click();
  await area.fill(conBlanco);

  // 3. Pulsar «Guardar»: se cierra y avisa de que está guardada.
  await hoja.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Guardado en Frases ✓")).toBeVisible();

  // 4. Cerrar la pestaña y abrir la app de nuevo.
  await page.goto("/hoy");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hoy", exact: true })).toBeVisible();

  // 5. Ir a Frases y buscar una palabra de la frase.
  await page.goto("/frases");
  await page.getByRole("textbox", { name: "Buscar" }).fill("ritmo");
  await page.getByRole("button", { name: "Aplicar" }).click();

  const tarjeta = page.locator("article").filter({ hasText: "ritmo" }).first();
  await expect(tarjeta).toBeVisible();
  await expect(tarjeta).toContainText(conBlanco);
  await expect(tarjeta).toContainText("Sin usar");

  // 6. Copiar la frase: el botón cambia a «Copiado ✓».
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copiar frase" }).first().click();
  await expect(page.getByRole("button", { name: "Copiado ✓" }).first()).toBeVisible();

  // 7. El portapapeles tiene el texto exacto, con los dos saltos de línea.
  // En Windows el portapapeles usa CRLF: se comparan los saltos de línea igualados.
  const portapapeles = await page.evaluate(() => navigator.clipboard.readText());
  const normalizado = portapapeles.replaceAll("\r\n", "\n");
  expect(normalizado).toBe(conBlanco);
  expect(normalizado.split("\n").length).toBe(3);
});
