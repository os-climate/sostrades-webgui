import { Page, expect } from '@playwright/test';

export async function baseOntologyModels(
    page: Page,  modelName: string, codeRepository: string, processName: string, processCodeRepository: string, gotoProcess: boolean,
    parameterName: string, parameterId: string ) {
    await page.goto('/');
    // Go to ontology model
    await page.click('id=main-menu-button');
    await page.hover('id=ontology-menu-button');
    await page.click('id=models-menu-button');

    // Verufy if a specific row exist
    const rowToClickOnDocument = page.locator(`id=row-ontology-models-${modelName}-${codeRepository}`);
    await expect(rowToClickOnDocument).toContainText(`${modelName}` , { timeout: 30000 });

    // Click on button to display the documentation's page
    const documentButton = `id=btn-model-documentation-${modelName}-${codeRepository}`;
    await page.click(documentButton);

    // Verify modal properties
    const modalModelDocumentation = page.locator('app-ontology-models-information');
    await expect(modalModelDocumentation).toContainText(modelName, { timeout: 10000 });
    await expect(modalModelDocumentation).toContainText(codeRepository, { timeout: 10000 });


    if (gotoProcess) {
    // Click on expansion panel to display models used by this process
    const expansionModel = 'id=process';
    await page.click(expansionModel);

    // Click to navigate to the model document
    const goTOModel = `id=go-to-${processName}`;
    await page.click(goTOModel);

    // Verify modal properties
    const modalProcessDocumentation = page.locator('app-ontology-process-information');
    await expect(modalProcessDocumentation).toContainText(processName, { timeout: 10000 });
    await expect(modalProcessDocumentation).toContainText(processCodeRepository, { timeout: 10000 });
    } else {

    // Click on expansion panel to display models used by this parameter
    const expansionModel = 'id=inputParameter';
    await page.click(expansionModel);

    // Click to navigate to the model document
    const goTOModel = `id=go-to-${parameterName}`;
    await page.click(goTOModel);

    // Verify modal properties
    const modalParameterDocumentation = page.locator('app-ontology-parameter-informations');
    await expect(modalParameterDocumentation).toContainText(parameterName, { timeout: 10000 });
    await expect(modalParameterDocumentation).toContainText(parameterId, { timeout: 10000 });
    }
}
