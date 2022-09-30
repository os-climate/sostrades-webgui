import { Page, expect } from "@playwright/test";

export async function baseStudyCaseSwitchToEditionMode(page: Page) {
  // This function consider study case is already loaded and in read only mode

  //wait the button switch to edition mode
  const switchButtonId = `id=study-switch-to-edition-button`
  await page.waitForSelector(switchButtonId);

  //check computation is not available
  await page.$("id=btn-treeview-start-calculation >> visible=false")
  
  //switch to edition mode
  await page.click(switchButtonId);

  //check computation is available
  await page.$("id=btn-treeview-start-calculation >> visible=true")
}
