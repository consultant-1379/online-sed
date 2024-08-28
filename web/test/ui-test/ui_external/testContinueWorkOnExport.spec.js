import { test, expect } from '@playwright/test';
import {
    goToDeploymentSetup,
    selectENMSize,
    selectReleaseVersion,
    selectIpVersion,
    DEPLOYMENT_SETUP_URL,
    selectENMSchema,
    selectUseCase,
    selectReleaseNumber,
    selectProduct,
} from '../testUtils.js';

test('test user active session exists until confirmed new deployment setup', async ({ page }) => {
    // setup deployment
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, "Physical ENM");
    await selectUseCase(page, 'Install');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "ENMOnRack");
    await selectENMSchema(page, "ENMOnRack IPv4");
    await page.locator('div.dropdown:has-text("Populate from previous SED")').locator('.ball').click();
    await page.locator('div#dry-run').locator('.ball').click();
    await page.getByRole('button', { name: 'Setup Deployment' }).click();

    // navigate to 'Site Details' page and populate a field
    await page.getByRole('link', { name: 'Site Details' }).click();
    await page.locator('#amos_vip_address').getByPlaceholder('Placeholder').fill('10.10.10.10');

    // navigate to 'Preview and Export' and check if value exists and export sed file
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    await expect(page.getByRole('table').locator('div').filter({ hasText: 'amos_vip_address' }).nth(1)).toContainText('10.10.10.10');
    await page.getByRole('button', { name: 'Export SED' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Continue' }).click();
    const download = await downloadPromise;

    // verify that value still exists on the 'Preview and Export'
    await expect(page.getByRole('table').locator('div').filter({ hasText: 'amos_vip_address' }).nth(1)).toContainText('10.10.10.10');

    // navigate to 'Site Details' and check if previously set value still exists
    await page.getByRole('link', { name: 'Site Details' }).click();
    await page.locator('#amos_vip_address').getByPlaceholder('Placeholder').click();
    await expect( page.locator('#amos_vip_address').getByPlaceholder('Placeholder')).toHaveValue('10.10.10.10');

    // navigate back to 'Deployment Setup', change the deployment setup parameter and cancel operation on prompt
    await page.getByRole('link', { name: 'Deployment Setup' }).click();
    await page.getByRole('button', { name: 'ENMOnRack IPv4' }).click();
    await page.getByText('ENMOnRack IPv4 2evt', { exact: true }).click();
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // navigate to 'Site Details' and check if previously set field still has the value
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect( page.locator('#amos_vip_address').getByPlaceholder('Placeholder')).toHaveValue('10.10.10.10');
    await page.getByRole('button', { name: 'Next' }).click();

    // navigate to 'Preview and Export' and verify that value still exists
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    await expect(page.getByRole('table').locator('div').filter({ hasText: 'amos_vip_address' }).nth(1)).toContainText('10.10.10.10');

    // navigate back to 'Deployment Setup', change one deployment parameter and confirm operation on prompt
    await page.getByRole('link', { name: 'Deployment Setup' }).click();
    await page.getByRole('button', { name: 'ENMOnRack IPv4' }).click();
    await page.getByText('ENMOnRack IPv4 2evt', { exact: true }).click();
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // navigate to 'Site Details' and check if previously set field is empty
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect( page.locator('#amos_vip_address').getByPlaceholder('Placeholder')).toBeEmpty();

    // verify that values doesn't exist in the 'Preview and Export'
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    await expect(page.locator('#amos_vip_address #response-display')).toBeEmpty();
});