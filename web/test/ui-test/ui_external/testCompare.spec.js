import { test, expect } from '@playwright/test';
import {
  goToDeploymentSetup, selectENMSchema,
  selectENMSize,
  selectIpVersion,
  selectReleaseNumber,
  selectReleaseVersion,
  DEPLOYMENT_SETUP_URL,
  selectProduct
} from "../testUtils.js";
export const COMPARISON_URL = "http://localhost:5002/#/compare";

test('test comparison - check changes are displayed', async ({ page }) => {
  await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
  await page.goto(COMPARISON_URL);
  await selectProduct(page, 'Physical ENM');
  await selectReleaseNumber(page, "from-release-number", 0);
  await selectReleaseVersion(page, "from-release-version", 1);
  await selectReleaseNumber(page, "to-release-number",  1);
  await selectReleaseVersion(page, "to-release-version", 0);
  await selectIpVersion(page, "ipv4");
  await selectENMSize(page, "ENMOnRack");
  await selectENMSchema(page, "ENMOnRack IPv4");
  await page.getByRole('button', { name: 'Compare Releases' }).click();

  await page.click('.main-row:nth-child(1) .icon.icon-chevron-right');
  const detailsText = await page.textContent('.details-row:not(.hidden) .cell-details div');
  expect(detailsText).toContain('No data to display for removed key.');
  await page.click('.main-row:nth-child(1) .icon.icon-chevron-down');
  await page.getByRole('row', { name: ' fb_dpmediation_1_ipaddress' }).getByRole('button').click();
  const headings = await page.$$eval('.details-row:not(.hidden) h3', headings => {
    return headings.map(heading => heading.textContent);
  });
  expect(headings[0]).toEqual('From Value Change(s)');
  expect(headings[1]).toEqual('To Value Change(s)');

  const messages = await page.$$eval('.details-row:not(.hidden) ul li', messages => {
    return messages.map(message => message.textContent);
  });
  expect(messages[0]).toContain('IP address for the 1st Service Group of the fallback node dpmediation');
  expect(messages[1]).toContain('Some changed display name');
});

test('test comparison - no changes present', async ({ page }) => {
  await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
  await page.goto(COMPARISON_URL);
  await selectProduct(page, 'Physical ENM');
  await selectReleaseNumber(page, "from-release-number", 0);
  await selectReleaseVersion(page, "from-release-version", 1);
  await selectReleaseNumber(page, "to-release-number",  1);
  await selectReleaseVersion(page, "to-release-version", 0);
  await selectIpVersion(page, "ipv4");
  await selectENMSize(page, "extraLarge");
  await selectENMSchema(page, "extraLarge IPv4");
  await page.getByRole('button', { name: 'Compare Releases' }).click();
  expect(await page.textContent('#comparison-no-changes:not(.hidden) h3')).toContain('No changes Found.');
});

test('test old version history pop up is displayed', async ({ page }) => {
  await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
  await page.goto(COMPARISON_URL);
  await selectProduct(page, 'Physical ENM');
  await page.getByRole('button', { name: 'History before ENM 23.4' }).click();
  let dialog = page.locator('#old-version-history-dialog');
  await expect(dialog).toBeVisible;
  await expect(dialog).toContainText('23.16');
  await expect(dialog).toContainText('16/10/2023: Removed \'scp_SCP_vip_internal\' parameter from ENM On Rack.');
  await expect(dialog).toContainText('27/11/2023: Update to have neo4j passwords at Initial Install.');
  await expect(dialog).toContainText('History Before 23.4');
  await expect(dialog).toContainText('Refer to the Revision History in the SED Excel referenced in the 23.15 Release Note for information on what has changed in the SED prior to 23.4.');
});