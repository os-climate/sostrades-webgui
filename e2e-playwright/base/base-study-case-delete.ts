import { Page, expect } from '@playwright/test';

export async function baseStudyCaseDeletion(page: Page, listStudies: any) {

const selectCheckbox = [];

// Go to study management
await page.goto('/');
await page.click('id=main-menu-button');
await page.hover('id=study_management-menu-button');
await page.click('id=study_case-menu-button');

// Push each study from dictonnary on a array
Object.values(listStudies).forEach(element => {
    const name = element[0];
    const group = element[1];
    selectCheckbox.push(`id=checkbox-study-management-${name}-${group}`);

});

await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/data/study-case') && resp.status() === 200),
]);

// Click on checkbox of each study
selectCheckbox.forEach( async e => {
    await page.click(e);
});

// Click on delete
const deletion = page.locator('id=deletion');
deletion.click();

// Verify modal study creation
const title = page.locator('app-validation-dialog');
await expect(title).toHaveText(/Are you sur ?/, { timeout: 15000 });

// Valid the modal
const buttonOk = page.locator('id=buttonOk');
await buttonOk.click();

// Verify deletion is done
await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/main/study-case') && resp.status() === 200, { timeout: 30000 }),
]);

}