import { Page,expect } from "@playwright/test";

export async function baseStudyCaseUnitParameterName(page: Page, parameterNameWithUnit : string) {
    // This test check if the unit of parameter is display

      // Verifying correct study name for My current study place
  const currentParameterNameTextLocator = page.locator('id='+ parameterNameWithUnit);
  await expect(currentParameterNameTextLocator).toHaveText(`${parameterNameWithUnit}`);
}