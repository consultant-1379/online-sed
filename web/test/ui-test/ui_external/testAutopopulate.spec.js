import { test, expect } from '@playwright/test';
import {
    goToDeploymentSetup,
    selectENMSize,
    selectReleaseVersion,
    selectIpVersion,
    selectENMSchema,
    selectProduct,
    DEPLOYMENT_SETUP_URL,
    stepCategory, selectUseCase,
    selectReleaseNumber, setupDeploymentForCENM
} from '../testUtils.js';

const INVALID_IPV4_VIPS_IPADDRESS_START = 'invalid';
const INVALID_IPV4_VIPS_IPADDRESS_END = 'invalid';
const IPV4_VIPS_IPADDRESS_START = '10.11.12.13';
const SMALLER_IPV4_VIPS_IPADDRESS_END = '10.11.12.0';

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
    await page.locator("text=Setup Deployment").click();
    await stepCategory(page);
}

test('test error outputs - empty ip', async ({ page }) => {
    await setupDeployment(page);
    const startIPError = page.locator('#start_ip_error');
    await expect(startIPError).toBeEmpty();
});

test('test error outputs - invalid ip', async ({ page }) => {
    await setupDeployment(page);
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill(INVALID_IPV4_VIPS_IPADDRESS_START);
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill(INVALID_IPV4_VIPS_IPADDRESS_END);
    const startIPError = await page.locator('#start_ip_error');
    await expect(startIPError).toHaveText("Input must follow the IPv4 format and can only contain the following characters: 0-9 and .");
});

test('test autopopulate button should be disabled if input invalid', async ({ page }) => {
    await setupDeployment(page);
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill(IPV4_VIPS_IPADDRESS_START);
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill(INVALID_IPV4_VIPS_IPADDRESS_END);
    const button = page.locator('#autopopulate_button');
    await expect(button).toBeDisabled(true);
});

test('test autopopulate button should be disabled if end ip is smaller than start ip', async ({ page }) => {
    await setupDeployment(page);
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill(IPV4_VIPS_IPADDRESS_START);
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill(SMALLER_IPV4_VIPS_IPADDRESS_END);
    const button = page.locator('#autopopulate_button');
    await expect(button).toBeDisabled(true);
});

test('test next available ip - none filled in', async ({ page }) => {
    await setupDeployment(page);
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill(IPV4_VIPS_IPADDRESS_START);
    const nextIP = await page.locator('#find-next-available-address');
    await expect(nextIP).toHaveText(IPV4_VIPS_IPADDRESS_START);
});

test('test autopopulate validation - prompt pop-up & text', async ({ page }) => {
    await setupDeployment(page);
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill("10.42.14.164");
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill("10.42.14.165");
    await page.getByRole('button', { name: 'Autopopulate' }).first().click();
    var dialog = page.locator('#confirmation-dialog');
    await expect(dialog).toBeVisible(true);
    await expect(dialog).toHaveText("Confirm Only 2 out of the remaining 4 required addresses have been supplied. Are you sure you want to proceed?CancelContinue");
});

test('test next available ip - next available', async ({ page }) => {
    await setupDeployment(page);
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill("10.42.14.164");
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill("10.42.14.168");
    await page.locator('#autopopulate_button').click();
    const nextIP = await page.locator('#find-next-available-address');
    await expect(nextIP).toHaveText("10.42.14.167");
});

test('test next available ip - ips unavailable', async ({ page }) => {
    await setupDeployment(page);
    await page.locator('div.content:visible').locator('div.row.table').locator('input').nth(0).fill("10.42.14.164");
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill("10.42.14.164");
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill("10.42.14.167");
    await page.locator('#autopopulate_button').click();
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill("10.42.14.164");
    const nextIP = await page.locator('#find-next-available-address');
    await expect(nextIP).toHaveText("None Available in Selected Range");
});

test('test import of Autopopulate IPs for cENM', async ({ page }) => {
    await setupDeploymentForCENM(page, 'ipv4', 'extraLarge', 'Upgrade', 'test/resources/cENM/cENM_fully_populated.yaml');
    const ipv4_vips_ipaddress_start = page.locator('#ipv4_vips_ipaddress_start').locator('input');
    const ipv4_vips_ipaddress_end = page.locator('#ipv4_vips_ipaddress_end').locator('input');
    await expect(ipv4_vips_ipaddress_start).toHaveValue('10.11.12.13');
    await expect(ipv4_vips_ipaddress_end).toHaveValue('10.11.12.113');
});