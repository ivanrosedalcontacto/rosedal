import { expect, test } from "@playwright/test";
import { diasDeEstaSemana, entrar } from "./ayuda";

/**
 * Recorrido 6: reprogramar, publicar otro día y consultar resultados.
 * Ver `docs/06-verificacion-y-entrega.md`.
 * El paso 2 del recorrido es arrastrar la pieza; aquí se usa «Cambiar fecha»,
 * que es la vía disponible en la app (el arrastre con el ratón no está hecho).
 */
// Recorrido largo (9 pasos con recargas): en el servidor de desarrollo pasa del minuto.
test.setTimeout(120_000);

test("R6: reprogramar, publicar otro día y consultar resultados", async ({ page }) => {
  const { lunes, martes, miercoles, jueves } = diasDeEstaSemana();
  const titulo = `Pieza para reprogramar ${Date.now()}`;

  await entrar(page);

  // 1. Una pieza con fecha prevista el martes de esta semana.
  await page.goto(`/piezas/nueva?fecha=${martes}`);
  await page.getByRole("textbox", { name: "Título", exact: true }).fill(titulo);
  await page.getByLabel("Finalidad").selectOption({ label: "Attract · Atraer" });
  await page.getByRole("button", { name: "Crear pieza" }).click();
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible({ timeout: 30_000 });

  // 2. Moverla al miércoles desde el calendario.
  await page.goto(`/calendario?vista=semana&fecha=${lunes}`);
  const tarjeta = page.locator("article:visible").filter({ hasText: titulo }).first();
  await expect(tarjeta).toBeVisible();
  await tarjeta.locator("select").selectOption(miercoles);
  await expect(page.locator("article:visible").filter({ hasText: titulo }).first()).toBeVisible({ timeout: 30_000 });

  // 3. La ficha muestra la nueva fecha y el historial del cambio.
  await page.goto("/biblioteca?vista=tablero");
  await page.locator("a").filter({ hasText: titulo }).first().click();
  await expect(page.getByLabel("Fecha prevista").first()).toHaveValue(miercoles);
  const historial = page.locator("section").filter({ hasText: "Historial de fechas" }).first();
  await expect(historial).toContainText("martes");
  await expect(historial).toContainText("miércoles");

  // 4. Publicarla con fecha real el jueves y un enlace.
  await page.getByLabel("Fecha real").fill(jueves);
  await page.getByLabel("Enlace publicado (opcional)").fill("https://ejemplo.com/publicada");
  await page.getByRole("button", { name: "Marcar como publicada" }).click();
  await expect(page.getByText(/Publicado el/)).toBeVisible({ timeout: 30_000 });

  // 5. En el calendario está el jueves, con la nota de la fecha prevista.
  await page.goto(`/calendario?vista=semana&fecha=${lunes}`);
  const tarjetaJueves = page.locator("article:visible").filter({ hasText: titulo }).first();
  await expect(tarjetaJueves).toBeVisible();
  const columna = page.locator("section:visible").filter({ has: tarjetaJueves }).first();
  const etiquetaJueves = await page.evaluate(
    (fecha) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${fecha}T00:00:00Z`)),
    jueves,
  );
  await expect(columna).toContainText(etiquetaJueves);
  await expect(tarjetaJueves).toContainText("Prevista:");

  // 6. En la revisión semanal figura en «Lo que salió» con sus métricas pendientes.
  await page.goto(`/revision?semana=${lunes}`);
  const revision = page.locator("li").filter({ hasText: titulo }).first();
  await expect(revision).toBeVisible();
  await expect(revision).toContainText("Pendiente");

  // 7. Un cero, un número y un pendiente.
  await revision.getByLabel("Alcance").fill("0");
  await revision.getByLabel("Nuevos seguidores").fill("12");
  await revision.getByLabel("Añadir métrica").selectOption({ label: "Respuestas" });
  await revision.getByRole("button", { name: "Añadir", exact: true }).click();
  await revision.getByRole("button", { name: "Guardar métricas" }).click();
  await expect(revision.getByRole("status")).toContainText("Guardado", { timeout: 30_000 });
  await expect(revision.getByLabel("Alcance")).toHaveValue("0", { timeout: 30_000 });

  // 8. Recargar: los tres estados se mantienen.
  await page.reload();
  const trasRecargar = page.locator("li").filter({ hasText: titulo }).first();
  await expect(trasRecargar.getByLabel("Alcance")).toHaveValue("0");
  await expect(trasRecargar.getByLabel("Nuevos seguidores")).toHaveValue("12");
  await expect(trasRecargar.getByLabel("Respuestas")).toHaveValue("");

  // 9. La ficha conserva la fecha prevista, el historial, la real y el enlace.
  await page.goto("/biblioteca?vista=tablero");
  await page.locator("a").filter({ hasText: titulo }).first().click();
  await expect(page.getByText(/Publicado el/).first()).toContainText(`prevista: ${miercoles}`);
  await expect(page.getByRole("link", { name: "Ver la publicación" })).toHaveAttribute("href", "https://ejemplo.com/publicada");
  await expect(page.getByText(/martes/).first()).toBeVisible();
});
