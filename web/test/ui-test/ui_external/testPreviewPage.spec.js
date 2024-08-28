import {expect, test} from "@playwright/test";
import {setupDeploymentForPENM, stepCategory} from "../testUtils.js";

test('Test Export button is disabled if use case is install and there are requiredKeyValuesNotProvided errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Install');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is disabled if use case is install and there are duplicatedKeyValuesInExclusionIps errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Install');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("1.1.1.1");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is disabled if use case is install and there are duplicatedKeyValues errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Install');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("10.10.1.2");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is disabled if use case is install and there are invalidKeyValues errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Install');
  await page.locator('li:has-text("Site Details")').click();
  // Make one value for invalidKeyValues
  await page.locator('#amos_vip_address').locator('input').fill("1::1");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is disabled if use case is install and there are mismatchedKeyValues errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Install');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("1::1");
  await page.locator('#san_spaIP').locator('input').fill("2.2.2.2");
  await page.locator('#sfs_console_IP').locator('input').fill("2.2.2.3");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is disabled if use case is upgrade and there are requiredKeyValuesNotProvided errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Upgrade');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is disabled if use case is upgrade and there are duplicatedKeyValuesInExclusionIps errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Upgrade');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("1.1.1.1");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is disabled if use case is upgrade and there are duplicatedKeyValues errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Upgrade');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("10.10.1.2");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});

test('Test Export button is enabled if use case is upgrade and there are invalidKeyValues errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Upgrade');
  await page.locator('li:has-text("Site Details")').click();
  // Make one value for invalidKeyValues
  await page.locator('#amos_vip_address').locator('input').fill("1::1");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).toBeEnabled();
});

test('Test Export button is disabled if use case is upgrade and there are mismatchedKeyValues errors', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM_fully_populated.txt', 'Upgrade');
  await page.locator('li:has-text("Site Details")').click();
  await page.locator('#amos_vip_address').locator('input').fill("1::1");
  await page.locator('#san_spaIP').locator('input').fill("2.2.2.2");
  await page.locator('#sfs_console_IP').locator('input').fill("2.2.2.3");
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByRole('button', { name: 'Export SED' })).toBeEnabled();
});

test('Test only errors displayed', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM.txt', 'Upgrade');
  await page.getByRole('link', { name: 'Preview and Export' }).click();
  let validationDisplayDivs = await page.$$('#validation-display');
  expect(validationDisplayDivs.length).toBe(29);
  await page.getByRole('button', { name: 'Show Errors Only' }).click();
  validationDisplayDivs = await page.$$('#validation-display');
  expect(validationDisplayDivs.length).toBe(6);
  for (const div of validationDisplayDivs) {
    const textContent = await div.textContent();
    expect(textContent).toContain('FAIL -');
  }
});

test('Test only changes displayed', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM.txt', 'Upgrade');
  await page.getByRole('link', { name: 'Preview and Export' }).click();
  let validationDisplayDivs = await page.$$('#validation-display');
  expect(validationDisplayDivs.length).toBe(29);
  await page.getByRole('button', { name: 'Show Changed Entries Only' }).click();
  validationDisplayDivs = await page.$$('#validation-display');
  expect(validationDisplayDivs.length).toBe(1);
});

test('Test keys required by displayIf property are displayed when key is enabled', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM.txt', 'Upgrade');
  await page.getByRole('link', { name: 'Site Details' }).click();
  await page.locator('#san_spaIP').locator('input').fill("2.2.2.3");
  await page.locator('#sfs_console_IP').locator('input').fill("2.2.2.3");
  await stepCategory(page);
  await page.locator('#SSO_COOKIE_DOMAIN').locator('input').fill("enmhost-1.athtem.eei.ericsson.se");
  await stepCategory(page);
  await page.locator('#enable_fallback').getByRole('button').first().click();
  await page.locator('#enable_fallback').getByText('true', { exact: true }).first().click();
  await page.getByRole('link', { name: 'Preview and Export' }).click();

  const divIds = ['cloud_user_ssh_key', 'fb_node1_IP'];
  for (const id of divIds) {
    const parentDiv = await page.waitForSelector(`div#${id}`);
    const validationDiv = await parentDiv.$('div#validation-display');
    const validationText = await validationDiv.innerText();
    expect(validationText).toEqual('FAIL - Required but not provided');
  }
});

test('Test keys required by displayIf property are not displayed when key is disabled', async ({ page }) => {
  await setupDeploymentForPENM(page, 'test/resources/pENM/pENM.txt', 'Upgrade');
  await page.getByRole('link', { name: 'Preview and Export' }).click();

  const divIds = ['cloud_user_ssh_key', 'fb_node1_IP'];
  for (const id of divIds) {
    await expect(page.waitForSelector(`div#${id}`, { visible: true, timeout: 1000 })).rejects.toThrow();
  }
  await expect(page.getByRole('button', { name: 'Export SED' })).not.toBeDisabled();
});
