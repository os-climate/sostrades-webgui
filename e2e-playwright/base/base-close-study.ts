import { Page} from '@playwright/test';

export async function baseCloseStudyCase(page: Page) {

// Close study
 const closeButton = page.locator('id=close');
 await closeButton.click();

}
