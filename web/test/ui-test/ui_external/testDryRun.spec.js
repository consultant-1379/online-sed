import { test, expect } from '@playwright/test';
import {
    checkSetupDeploymentPageReset,
    goToDeploymentSetup,
    selectENMSize,
    selectReleaseVersion,
    selectIpVersion,
    stepCategories,
    selectProduct,
    DEPLOYMENT_SETUP_URL,
    stepCategory,
    selectENMSchema,
    selectUseCase,
    selectReleaseNumber
} from '../testUtils.js';

async function setupDeployment(page){
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, "Physical ENM");
    await selectUseCase(page, 'Install');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge IPv4");
    await page.locator('div.dropdown:has-text("Populate from previous SED")').locator('.ball').click();
    await page.locator('div#dry-run').locator('.ball').click();
    await page.locator("text=Setup Deployment").click();
}

test('test dry run', async ({ page }) => {
    await setupDeployment(page);
    await stepCategory(page);
    await stepCategories(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export SED' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    const download = await downloadPromise;
    expect(download);
});

test('test html description in more info', async ({ page }) => {
    await setupDeployment(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await page.locator('#smrs_sftp_securePort').getByText('more info').click();
    page.locator('.top > .right > .icon').click();
    await page.locator('#smrs_sftp_securePort').getByText('more info').click();
    const dialog = await page.locator('.dialog')
    await expect(await dialog).toBeVisible();
    await expect(await dialog.getByText('SMRS dynamic SFTP port')).toBeVisible();
    await expect(await dialog.getByText('Note')).toBeVisible();
    await expect(await dialog.locator('.info-table')).toBeVisible();
    await expect(await dialog.getByRole('cell', { name: 'Title 1' }).innerHTML()).toBe(" <p> <strong>Title 1</strong> </p> ");
    await expect(await dialog.getByRole('cell', { name: 'Row1' }).innerHTML()).toBe(" <p>Row1</p> ");
});