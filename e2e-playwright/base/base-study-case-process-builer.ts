import { Page, expect } from '@playwright/test';

export async function baseStudyCaseProcessBuilder(page: Page, study: string, node: string, subProcess: string, reference: string) {

    // Click on DoE_Eval
    const clickOnNode = page.locator(`id=btn-treeview-node-${study}.${node}`);
    await clickOnNode.click();

    // Verify modal subprocess
    const modalSubProcess = page.locator('app-process-builder');
    await expect(modalSubProcess).toHaveText(/Edit/, { timeout: 15000 });

    const editButton = page.locator(`id=edit-data`);
    await editButton.click();

    // Selection process
    const processes = page.locator('id=process');
    await processes.click();

    const searchOption = await page.locator('[aria-label="dropdown search"]');
    await searchOption.click();
    await searchOption.fill(subProcess);
    await page.waitForTimeout(400);
    const optionSelected = page.locator(`mat-option:has-text("${subProcess}")`);
    await optionSelected.click();

    await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/data/study-case/process') && resp.status() === 200),
    ]);
    // Selection reference
    const empty = page.locator('mat-select-trigger');
    await expect(empty).toHaveText(/Empty Study/, { timeout: 15000 });

    const references = page.locator('id=reference');
    await references.click();
    await page.waitForTimeout(1000);
    const selectedReference = page.locator(`mat-option:has-text("${reference}")`);
    await page.waitForTimeout(400);
    await selectedReference.click();


    // Valid form
    const submit = page.locator('id=submit');
    await submit.isEnabled({ timeout: 15000 });
    await submit.click();

    // Save change
    const buttonSaveChange = await page.locator('[aria-label="Save changes"]');
    await buttonSaveChange.click();

    // Verify modal save change
    const modalSaveChange = page.locator('app-study-case-modification-dialog');
    await expect(modalSaveChange).toContainText('Save & Synchronise', { timeout: 15000 });

    // Save and synchronise
    await page.click('button:has-text("Save & Synchronise")');
}
