import { test, expect } from '@playwright/test';
import {
    goToDeploymentSetup,
    selectENMSize,
    selectReleaseVersion,
    selectProduct,
    selectIpVersion,
    stepCategory,
    DEPLOYMENT_SETUP_URL,
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

test('test wizard step preserved after page switch', async ({ page }) => {
    await setupDeployment(page);
    await stepCategory(page);
    await page.goto('#/autopopulate');
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await page.goto('#/previewexport');
    await page.goto('#/sitedetails');
    const num = await page.locator('div.wizard-content').locator('div.content:not(.hidden)').locator('#hostPort').count();
    expect(num).toBe(1);
});