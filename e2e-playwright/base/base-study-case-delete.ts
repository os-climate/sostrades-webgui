import { Page, expect } from '@playwright/test';

export async function baseStudyCaseDeletion(page: Page, listStudies: any, needToLoadStudies: boolean) {

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

    if (needToLoadStudies) {
        const [response] = await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/api/data/study-case'), { timeout: 90000 })
        ]);
        /***
         * Update 19/10/2022
         * Add log if the status of the response is not 200
         */
        if (response.status() !== 200) {
            const body = await response.body();
            console.log(`\nResponse load studies: ${body} `);
        }
    }
    // Click on checkbox of each study
    selectCheckbox.forEach( async study => {
        await page.click(study);
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
    const [responseDelete] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/data/study-case/delete'), { timeout: 60000 }),
    ]);
    /***
     * Update 19/10/2022
     * Add log if the status of the response is not 200
     */
    if (responseDelete.status() !== 200) {
        const body = await responseDelete.body();
        console.log(`\nResponse delete studies: ${body} `);
    }

}
