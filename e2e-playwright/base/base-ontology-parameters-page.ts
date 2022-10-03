import { Page, expect } from '@playwright/test';

export async function baseOntologyParameters(
    page: Page, parameterName: string, modelName: string, codeRepository: string) {

    await page.goto('/');
    // Go to ontology model
    await page.click('id=main-menu-button');
    await page.hover('id=ontology-menu-button');
    await page.click('id=parameters-menu-button');

    // Verufy if a specific row exist
    const rowToClickOnDocument = page.locator(`id=row-parameters-${parameterName}`);
    await expect(rowToClickOnDocument).toContainText(`${parameterName}`, { timeout: 30000 });

    // Click on button to display the documentation's page
    const documentButton = `id=btn-parameter-documentation-${parameterName}`;
    await page.click(documentButton);

    // Verify modal properties
    const modalProcessDocumentation = page.locator('app-ontology-parameter-informations');
    await expect(modalProcessDocumentation).toContainText(parameterName, { timeout: 10000 });

    // Click on expansion panel to display models used by this process
    const expansionModel = 'id=parameter';
    await page.click(expansionModel);

    // Click to navigate to the model document
    const goTOModel = `id=go-to-${modelName}`;
    await page.click(goTOModel);

    // Verify modal properties
    const modalModelDocumentation = page.locator('app-ontology-models-information');
    await expect(modalModelDocumentation).toContainText(modelName, { timeout: 10000 });
    await expect(modalModelDocumentation).toContainText(codeRepository, { timeout: 10000 });


}