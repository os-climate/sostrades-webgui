import { Page, expect } from '@playwright/test';

export async function baseStudyCaseCreation(
    page: Page, studyName: string, process: string, reference: string, studyGroup: string, createFromStudyManagement: boolean) {

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
    const title = page.locator('app-process-create-study');
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

        const optionSelected = page.locator(`mat-option:has-text("${process}")`).first();
        await optionSelected.click();
    }

    // Selection reference
    const empty = page.locator('mat-select-trigger');
    await expect(empty).toHaveText(/Empty Study/, { timeout: 15000 });

    const references = page.locator('id=reference');
    await references.click();
    const selectedReference = page.locator(`mat-option:has-text("${reference}")`).first();
    await selectedReference.click();
    await expect(references).toHaveText(reference, { timeout: 15000 });

    // Select group
    const group = page.locator('id=group');
    await group.click();
    const groupSelected = page.locator(`mat-option:has-text("${studyGroup}")`).first();
    groupSelected.click();
    await expect(group).toHaveText(studyGroup, { timeout: 15000 });

    // Valid the creation
    const submit = page.locator('id=submit');
    await submit.click();

    // Verifying correct redirection to study workspace
    await page.waitForURL('/study-workspace');

    // Verifying correct study name for My current study place
    const currentStudyNameTextLocator = page.locator('id=text-sidenav-study-loaded-name');
    await expect(currentStudyNameTextLocator).toHaveText(`: ${studyName}`);

    // Verifying root node is present
    const rootNodeButton = `id=btn-treeview-node-${studyName}`;
    await page.waitForSelector(rootNodeButton);

    // Close study
    const closeButton = page.locator('id=close');
    await closeButton.click();

    // Verifying correct redirection to study management
    await page.waitForURL('/study-management', { timeout: 15000 });

}
