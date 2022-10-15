import { Page, expect } from '@playwright/test';

export async function baseStudyCaseCreation(
    page: Page, studyName: string, process: string, reference: string,
    createFromStudyManagement: boolean, needToLoadReferences: boolean) {

    if (!page.url().includes('/study-management')) {

        await page.goto('/');
    }
    if (createFromStudyManagement) {
        // Go to study_management
        await page.click('id=main-menu-button');
        await page.hover('id=study_management-menu-button');
        await page.click('id=study_case-menu-button');

        // Click on Create button
        const createStudy = `id=create-study`;
        await page.click(createStudy);

    } else {
        // Go to process list
        await page.click('id=main-menu-button');
        await page.hover('id=ontology-menu-button');
        await page.click('id=processes-menu-button');

        // Filtre process
        const filter = page.locator('id=filter');
        await filter.fill('');
        await filter.fill(process);

        // Click on Create button
        const createStudy = page.locator(`id=btn-process-create-${process}`);
        await createStudy.click();
    }

    // Verify modal study creation
    const title = page.locator('app-study-case-creation');
    await expect(title).toHaveText(/Create new study/, { timeout: 15000 });

    // Fill Study Name
    const study = page.locator(`id=studyName`);
    await study.click();
    await study.fill(studyName);

    // Selection process
    if (createFromStudyManagement) {
        const processes = page.locator('id=process');
        await processes.click();

        const searchOption = await page.locator('[aria-label="dropdown search"]');
        await searchOption.click();
        await searchOption.fill(process);
        await page.waitForTimeout(400);
        const optionSelected = page.locator(`mat-option:has-text("${process}")`).first();
        await optionSelected.click();

        /**
         * Update 10/10/2022
         * Add condition to load references after a selection of a process because, in some cases, them can be already loaded.
         */
        if (needToLoadReferences) {
            await Promise.all([
                page.waitForResponse(resp => resp.url().includes('/api/data/study-case/process') && resp.status() === 200),
            ]);
        }
    }

    // Selection reference
    const empty = page.locator('mat-select-trigger');
    await expect(empty).toHaveText(/Empty Study/, { timeout: 15000 });

    const references = page.locator('id=reference');
    await references.click();
    await page.waitForTimeout(1000);
    const selectedReference = page.locator(`mat-option:has-text("${reference}")`).first();
    await page.waitForTimeout(400);
    await selectedReference.click();

    // Valid the creation
    const submit = page.locator('id=submit');
    await submit.isEnabled({ timeout: 15000 });
    await submit.click();

    // Verifying correct redirection to study workspace
    await page.waitForURL('**/study-workspace**', { timeout: 40000 });

    // Verifying correct study name for My current study place
    const currentStudyNameTextLocator = page.locator('id=text-sidenav-study-loaded-name');
    await expect(currentStudyNameTextLocator).toHaveText(`: ${studyName}`);

    // Verifying root node is present
    const rootNodeButton = `id=btn-treeview-node-${studyName}`;
    await page.waitForSelector(rootNodeButton, { timeout: 20000 });

}
