import { test, expect } from '@playwright/test';
import {
    goToDeploymentSetup,
    selectENMSize,
    selectReleaseVersion,
    selectIpVersion,
    stepCategory,
    DEPLOYMENT_SETUP_URL,
    selectENMSchema,
    selectUseCase,
    selectProduct,
    selectReleaseNumber,
    selectSprintNumber
} from '../testUtils.js';

async function setupIpv4Deployment(page){
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

async function setupDualDeployment(page){
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await page.locator('#ip-version').getByRole('button', { name: 'ipv4' }).click();
    await page.locator("text=" + "dual").click();
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge Dual");
    await page.locator("text=Setup Deployment").click();
}

test('test schema updated after changes in Deployment Setup and clicking continue', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await page.goto('#/sitedetails');
    const ipVersion = page.locator('#ip_version').locator('input');
    await expect(ipVersion).toHaveValue('ipv4');
    await setupDualDeployment(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await stepCategory(page);
    await page.goto('#/sitedetails');
    const ipVersionD = page.locator('#ip_version').locator('input');
    await expect(ipVersionD).toHaveValue('dual');
});

test('test Exclusion of IP page is loaded after a change in Deployment Setup and clicking continue', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await page.goto('#/sitedetails');
    const ipVersion = page.locator('#ip_version').locator('input');
    await expect(ipVersion).toHaveValue('ipv4');
    await setupDualDeployment(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('http://localhost:5002/#/excludeipaddresses');
});

test('test schema is not updated after changes in Deployment Setup and clicking cancel' , async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await page.goto('#/sitedetails');
    const ipVersion = page.locator('#ip_version').locator('input');
    await expect(ipVersion).toHaveValue('ipv4');
    await setupDualDeployment(page);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect(ipVersion).toHaveValue('ipv4');
});

test('test nav bar links are disabled if IP version is changed in Deployment Setup a second time' , async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await page.goto('#/sitedetails');
    const ipVersion = page.locator('#ip_version').locator('input');
    await expect(ipVersion).toHaveValue('ipv4');
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await page.locator('#ip-version').getByRole('button', { name: 'ipv4' }).click();
    await page.locator("text=" + "dual").click();
    const navBarLink =  page.getByRole('button', { name: 'Setup Deployment' });
    await expect(navBarLink).toBeDisabled();
});

test('test deployment type select is not displayed in the cloud native product selection', async ({ page }) => {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, "Cloud Native ENM");
    await selectUseCase(page, 'Install');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await expect(page.locator("div:has-text('Select Deployment Type')")).toHaveCount(0);
});

test('test product line dropdown list has two items' , async ({ page }) => {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, "Physical ENM");
    await selectUseCase(page, 'Install');
    await page.locator('#release-number').getByRole('button', { releaseNumber: 'Please select...' }).click();
    await expect(page.locator('div.select.open').locator("div.options-list").locator('.item')).toHaveCount(2);
});

test('test R-state dropdown list has one item' , async ({ page }) => {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, "Physical ENM");
    await selectUseCase(page, 'Install');
    await selectReleaseNumber(page);
    await page.locator('#release-version').getByRole('button', { releaseNumber: 'Please select...' }).click();
    await expect(page.locator('div.select.open').locator("div.options-list").locator('.item')).toHaveCount(1);
});