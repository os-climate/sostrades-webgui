import { Page, expect } from '@playwright/test';

export async function baseStudyCaseEdition(page: Page, studyName: string, newStudyName: string, studyGroup: string, newStudyGroup: string) {

    await page.goto('/');
    // Go to study management
    await page.click('id=main-menu-button');
    await page.hover('id=study-menu-button');
    await page.click('id=study_management-menu-button');

    // Hover on specific row to show actions buttons
    const rowToHover = `id=row-study-management-${studyGroup}-${studyName}`;
    await page.hover(rowToHover, { timeout: 15000 });

    // Start loading of studycase
    const editButton = `id=btn-study-management-edit-${studyGroup}-${studyName}`;
    await page.click(editButton);

    // Verify modal study edition
    const title = page.locator('app-study-case-edit');
    await expect(title).toHaveText(/Edit study/, { timeout: 15000 });


    // Fill Study Name
    const study = page.locator(`id=studyName`);
    await study.click();
    await study.fill(newStudyName);

    // Selection reference
    const references = page.locator('id=group');
    await expect(references).toHaveText(studyGroup, { timeout: 15000 });
    await references.click();
    const selectedReference = page.locator(`mat-option:has-text("${newStudyGroup}")`);
    await selectedReference.click();
    await expect(references).toHaveText(newStudyGroup, { timeout: 15000 });

    // Valid the edition
    const submit = page.locator('id=submit');
    await submit.click();

    // Verify modal validation
    const warning = page.locator('app-validation-dialog');
    await expect(warning).toHaveText(/Warning/, { timeout: 15000 });

    // Valid the modal
    const buttonOk = page.locator('id=buttonOk');
    await buttonOk.click();

    // Hover on specific row to show actions buttons
    const hover = `id=row-study-management-${newStudyGroup}-${newStudyName}`;
    await page.hover(hover);

    // Load study
    const loadButton = `id=btn-study-management-load-${newStudyGroup}-${newStudyName}`;
    await page.click(loadButton);

    // Verifying correct redirection to study workspace
    await page.waitForURL('**/study-workspace**', { timeout: 90000 });

    // Verifying correct study name for My current study place
    const currentStudyNameTextLocator = page.locator('id=text-sidenav-study-loaded-name');
    await expect(currentStudyNameTextLocator).toHaveText(`: ${newStudyName}`);

    // Verifying root node is present
    const rootNodeButton = `id=btn-treeview-node-${newStudyName}`;
    await page.waitForSelector(rootNodeButton, { timeout: 15000 });

}
