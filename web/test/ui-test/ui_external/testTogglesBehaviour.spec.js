import { test, expect } from '@playwright/test';
import {
  selectENMSize,
  selectReleaseVersion,
  selectIpVersion,
  setupDeploymentForPENM,
  selectENMSchema,
  selectUseCase,
  selectReleaseNumber,
  createDeploymentSetupCloudNative
} from '../testUtils.js';

test.describe('test', async () => {
  test.describe.configure({ mode: 'serial' });

  async function createDeploymentSetup(page, enmSchema){
    await selectUseCase(page, 'Install');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, enmSchema);
    await expect(page.locator('#upgrade')).toBeVisible(true);
    await expect(page.locator('div#upgrade').getByLabel('On')).toBeVisible(true);
    await expect(page.locator('#file-name')).not.toBeVisible(true);
    await page.locator('#upgrade label i').click();
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  test('test behavior of toggles when select Product resets the components', async ({ page }) => {
    //Creating first deployment with passwords excluded and importing from previous SED file
    await setupDeploymentForPENM(page, 'test/resources/pENM/pENM.txt', 'Upgrade');
    await expect(page.locator('input#exclusion_ip_0')).toHaveValue('1.1.1.1');
    await expect(page.locator('input#exclusion_ip_1')).toHaveValue('1.1.1.2');
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    await expect(page.locator('#password1')).not.toBeVisible();
    /* Creating second deployment: When select product is clicked, toggles should be reset.
       Include passwords should be true, the toggle to upload previous SED should be hidden,
       all data imported from previous SED file should be deleted.
       If Dry-run  mode is enabled, it should not change once it has been selected*/
    await page.getByRole('link', { name: 'Deployment Setup' }).click();
    await expect(page.locator('div#include-passwords').getByLabel('Include')).not.toBeVisible(true);
    await expect(page.locator('#upgrade')).toBeVisible(true);
    await page.locator('div#dry-run').locator('.ball').click();
    await expect(page.locator('div#dry-run').getByLabel('On')).toBeVisible(true);
    // This step will reset all fields except for Dry-run:
    await page.locator('#deployment-product').getByRole('button', { name: 'Physical ENM' }).click();
    await expect(page.locator('div#dry-run').getByLabel('On')).toBeVisible(true);
    await page.locator('div.item').filter({ hasText: 'Physical ENM'}).click();
    await expect(page.locator('div#include-passwords').getByLabel('Include')).toBeVisible(true);
    await expect(page.locator('#upgrade')).not.toBeVisible(true);
    await createDeploymentSetup(page, 'extraLarge IPv4');
    await expect(page.locator('input#exclusion_ip_0')).toHaveValue('');
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    await expect(page.locator('#password1')).toBeVisible();
    // Creating third deployment to test behavior of Dry-run (should be enabled)
    await page.getByRole('link', { name: 'Deployment Setup' }).click();
    await expect(page.locator('div#include-passwords').getByLabel('Include')).toBeVisible(true);
    await expect(page.locator('#upgrade')).toBeVisible(true);
    await expect(page.locator('div#dry-run').getByLabel('On')).toBeVisible(true);
    await page.locator('#deployment-product').getByRole('button', { name: 'Physical ENM' }).click();
    await expect(page.locator('div#dry-run').getByLabel('On')).toBeVisible(true);
    await page.locator('div.item').filter({ hasText: 'Cloud Native ENM'}).click();
    await createDeploymentSetupCloudNative(page, 'Install');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('link', { name: 'Site Details' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
  });

});