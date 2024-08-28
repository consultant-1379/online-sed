import { expect, test } from '@playwright/test';
import {
    selectUseCase,
    DEPLOYMENT_SETUP_URL,
    selectIpVersion,
    goToDeploymentSetup,
    selectProduct,
    selectReleaseVersion,
    stepCategory,
    selectReleaseNumber,
    selectENMSize,
    selectPopulateFromPreviousSED
} from '../testUtils.js';

async function skipCategoriestoConfiguration(page) {
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
}

async function prepareCENMDeployment(page, product, useCase, version, size) {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, product);
    await selectUseCase(page, useCase);
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, version);
    await selectENMSize(page, size);
    await page.locator('#upgrade label i').click();
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}

test('Test date time picker behaviour - Should allow to add schedules', async ({ page }) => {
    await prepareCENMDeployment(page, "Cloud Native ENM", "Install", "Dual", "small");
    await skipCategoriestoConfiguration(page);
    await page.getByRole('button', { name: 'Add Backup Scheduling Schedules' }).click();
    await expect(page.locator('#noRec')).toBeVisible();

    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-every-0').fill('1w');
    await page.locator('#objectArray-input-start-0').fill('2100-01-01T01:01:01');
    await page.getByText('Add entry Save').click();
    await page.getByRole('button', { name: 'Save' }).click();

    await page.locator('li:has-text("Preview and Export")').click();
    const customObjectText = await page.locator('#backup_scheduling_schedules').locator('#response-display').textContent();

    expect(JSON.parse(customObjectText)).toEqual([ { "every": "1w", "start": "2100-01-01T01:01:01" } ]);
});
