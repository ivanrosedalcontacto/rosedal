import { expect, test } from "@playwright/test";
import { diasDeEstaSemana, entrar } from "./ayuda";

/**
 * Recorrido 3: dos guiones, una entrada; adaptar a un correo.
 * Ver `docs/06-verificacion-y-entrega.md`.
 * Nota: «Crear adaptación» copia la pieza con el mismo formato (no hay diálogo
 * para elegirlo); el test cambia después el formato y la finalidad del correo.
 */
// Recorrido largo (9 pasos con recargas): en el servidor de desarrollo pasa del minuto.
test.setTimeout(120_000);

test("R3: dos guiones, una entrada; adaptar a un correo", async ({ page, isMobile }) => {
  test.skip(isMobile, "R3 es un recorrido de ordenador (docs/06).");
  const idea = "¿Cómo sé si me basta con el curso o necesito una asesoría individual?";
  const reel = "¿Curso o asesoría? Hazte esta pregunta";

  await entrar(page);

  // 1. La idea muestra sus piezas, entre ellas el reel.
  await page.goto("/ideas?vista=preguntas");
  const tarjetaIdea = page.locator("li").filter({ hasText: idea }).first();
  await tarjetaIdea.getByRole("link", { name: "Abrir" }).click();
  await expect(page.getByRole("heading", { name: idea, exact: false })).toBeVisible();
  await expect(page.locator("a").filter({ hasText: reel, hasNotText: "adaptación" }).first()).toBeVisible();

  // 2. El reel tiene dos versiones y una elegida.
  await page.locator("a").filter({ hasText: reel, hasNotText: "adaptación" }).first().click();
  await expect(page.getByText("Gancho directo").first()).toBeVisible();
  await expect(page.getByText("Gancho a la contra").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Gancho directo/ })).toBeVisible();

  // 3. Probar otra versión: la elegida no cambia.
  await page.getByRole("button", { name: "Probar otra" }).click();
  await expect(page.getByLabel("Nombre de la versión").last()).toBeVisible({ timeout: 30_000 });
  const nueva = page.getByLabel("Nombre de la versión").last();
  await nueva.fill("Gancho con cifra");
  const formNueva = page.locator("form").filter({ has: nueva });
  await formNueva.getByLabel("Gancho").fill("El 70 % de mis clientas repite el mismo error.");
  await formNueva.getByRole("button", { name: "Guardar guion" }).click();
  await expect(page.getByRole("button", { name: /Gancho directo/ })).toBeVisible({ timeout: 30_000 });

  // 4. Elegir la nueva versión.
  await page.getByRole("button", { name: "Gancho con cifra" }).click();
  await expect(page.getByRole("button", { name: /Gancho con cifra/ })).toBeVisible({ timeout: 30_000 });

  // 5. En el calendario el reel aparece una sola vez.
  await page.goto("/calendario");
  await expect(page.locator("article:visible").filter({ hasText: reel, hasNotText: "adaptación" })).toHaveCount(1);

  // 6. Crear la adaptación: se abre un correo nuevo en borrador.
  await page.goto("/biblioteca?vista=tablero");
  await page.locator("a").filter({ hasText: reel, hasNotText: "adaptación" }).first().click();
  await page.getByRole("button", { name: "Crear adaptación" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /adaptación/ })).toBeVisible({ timeout: 30_000 });

  // 7. El correo lleva formato email, finalidad Nurture y una fecha distinta.
  const adaptation = page.getByRole("heading", { level: 1, name: /adaptación/ });
  // El canal ya no se elige: el formato email lo pone solo.
  await page.getByLabel("Formato").selectOption("email");
  await page.getByLabel("Finalidad").selectOption({ label: "Nurture · Cultivar" });
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Guardado ✓")).toBeVisible({ timeout: 30_000 });
  await expect(adaptation).toBeVisible();
  // La fecha se pone en un solo sitio: «Planificar».
  await page.locator('input[name="fecha_prevista"]').first().fill(diasDeEstaSemana().jueves);
  await page.getByRole("button", { name: "Planificar" }).click();
  await expect(page.locator('input[name="fecha_prevista"]').first()).toHaveValue(diasDeEstaSemana().jueves, { timeout: 30_000 });

  // 8. El reel conserva su finalidad, su fecha y su estado, y lista el correo.
  await page.goto("/biblioteca?vista=tablero");
  await page.locator("a").filter({ hasText: reel, hasNotText: "adaptación" }).first().click();
  await expect(page.getByLabel("Finalidad")).toHaveValue("position");
  await expect(page.getByRole("link", { name: /Derivadas de esta pieza/ }).or(page.getByText("Derivadas de esta pieza")).first()).toBeVisible();
  await expect(page.locator("a").filter({ hasText: reel + " · adaptación" }).first()).toBeVisible();

  // 9. La idea lista también el correo nuevo.
  await page.goto("/ideas?vista=preguntas");
  await page.locator("li").filter({ hasText: idea }).first().getByRole("link", { name: "Abrir" }).click();
  await expect(page.getByText("Piezas creadas a partir de esta idea")).toBeVisible();

  // 10. En el calendario hay dos entradas distintas.
  await page.goto("/calendario");
  await expect(page.locator("article:visible").filter({ hasText: reel, hasNotText: "adaptación" })).toHaveCount(1);
  // Las adaptaciones de ejecuciones anteriores siguen en la cuenta de pruebas: basta con que esté la nueva.
  await expect(page.locator("article:visible").filter({ hasText: reel + " · adaptación" }).first()).toBeVisible();
});
