import { test, expect } from '@playwright/test';
import {
    goToDeploymentSetup, selectENMSize, selectIpVersion, selectPopulateFromPreviousSED,
    selectProduct, selectReleaseVersion, selectSprintNumber, selectUseCase,
    stepCategory
} from "../testUtils.js";

const DEPLOYMENT_SETUP_URL_INTERNAL = "http://localhost:5003/#/deploymentsetup";

async function goToInternalDeploymentSetup(page, url){
    await page.goto(url);
}

test('test API docs link availible on internal SED', async ({ page }) => {
    await goToInternalDeploymentSetup(page, DEPLOYMENT_SETUP_URL_INTERNAL);
    const apiLink = page.locator('#API_docs_URl');
    expect(apiLink).toBeVisible;
});

const commonTestSetup = async (page, csarLite) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await page.locator('div#dry-run').locator('.ball').click();
    await selectProduct(page, "Cloud Native ENM");
    await selectUseCase(page, 'Upgrade');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, 'ipv4');
    await selectENMSize(page, 'extraLarge');

    if (csarLite) {
        await page.locator('div#csar-lite').locator('.ball').click();
    }

    await selectPopulateFromPreviousSED(page, 'test/resources/cENM/eric-enm-integration-extra-large-production-values-undefined.yaml');
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
};

test('test upgrade for CSAR Lite for cENM', async ({ page }) => {
    await commonTestSetup(page, true);
    await expect(page.locator('#registry_url').locator('input')).toHaveCount(0);
    await expect(page.locator('#registry_url_internal').locator('input')).toHaveCount(1);
});

test('test upgrade for full CSAR for cENM', async ({ page }) => {
    await commonTestSetup(page, false);
    await expect(page.locator('#registry_url').locator('input')).toHaveCount(1);
    await expect(page.locator('#registry_url_internal').locator('input')).toHaveCount(0);
});