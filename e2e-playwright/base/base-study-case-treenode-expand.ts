import { Page, expect } from "@playwright/test";

export async function baseStudyCaseTreenodeExpand(page: Page, nodeNameSpace: string) {
  // This function consider study case is already loaded

  try {
    await page.waitForSelector(`id=btn-treeview-node-${nodeNameSpace}`, { timeout: 10000 })
  } catch (error) {
    await expandTreeNode(page, nodeNameSpace);
  }
}

async function expandTreeNode(page: Page, nodeNameSpace: string) {
  const splittedNamespace = nodeNameSpace.split('.');

  let currentNamespace = splittedNamespace[0];

  for (let index = 1; index < splittedNamespace.length; index++) {
    try {
      await page.waitForSelector(`id=btn-treeview-node-${currentNamespace}.${splittedNamespace[index]}`, { timeout: 10000 })
    } catch (error) {
      await page.click(`id=btn-treeview-expand-${currentNamespace}`)
    } finally {
      currentNamespace += `.${splittedNamespace[index]}`
    }
  }
}
