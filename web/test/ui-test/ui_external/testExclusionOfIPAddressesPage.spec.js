import { test, expect } from '@playwright/test';
import {
    setupIpv4Deployment,
    fillAutoPopulate,
    stepCategory
} from '../testUtils.js';

const IPV4_ADDRESS = '10.11.12.13';
const INVALID_INPUT = '10.42.14.1611';

test('test exclude IP error message for invalid input', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.getByRole('button', { name: 'Add IP address' }).click();
    await page.locator('#exclusion_ip_0').fill(INVALID_INPUT);
    await page.locator('#exclusion_ip_0').blur();
    await expect(page.locator('#invalid_entry_error').first()).toContainText("Invalid entry. Please enter a valid IPv4, IPv6 or IPv6 CIDR address.");
});

test('test exclude IP no error message for valid IPV4_ADDRESS input', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.getByRole('button', { name: 'Add IP address' }).click();
    await page.locator('#exclusion_ip_0').fill(IPV4_ADDRESS);
    await expect(page.locator('#invalid_entry_error')).toBeHidden;
});

test('test exclude IP NOT used by auto populate', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.locator('#exclusion_ip_0').fill(IPV4_ADDRESS);
    await stepCategory(page);
    await fillAutoPopulate(page);
    const errorMessageLocation = await page.locator('#fm_vip_address')
    await expect(errorMessageLocation).not.toContainText(IPV4_ADDRESS);
});

test('test error message when user input value in exclusion list', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.locator('#exclusion_ip_0').fill(IPV4_ADDRESS);
    await stepCategory(page);
    await stepCategory(page);
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    await page.locator('#fm_vip_address').locator('input').fill(IPV4_ADDRESS);
    expect(page.locator('#error_message_fm_vip_address')).not.toBeVisible();
    await page.locator('#fm_vip_address').locator('input').blur();
    await expect(page.locator('#error_message_fm_vip_address')).toContainText("Invalid entry. This value is included in the IP exclusion list. Please enter a unique value.");
});

test('test error message for duplicate entry in Exclusion list', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.locator('#exclusion_ip_0').fill(IPV4_ADDRESS);
    await page.getByRole('button', { name: 'Add IP address' }).click();
    await page.locator('#exclusion_ip_1').fill(IPV4_ADDRESS);
    await expect(page.locator('#duplicate_entry_error').first()).toContainText("Duplicate entry. Please see Preview Details and Export page for information");
    await expect(page.locator('#duplicate_entry_error')).toHaveCount(2);
});

test('test input for entry in Exclusion list', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.getByRole('button', { name: 'Add IP address' }).click();
    await expect(page.locator('#exclusion_ip_1')).toHaveCount(0);
    await page.locator('#exclusion_ip_0').fill(IPV4_ADDRESS);
    await page.getByRole('button', { name: 'Add IP address' }).click();
    await expect(page.locator('#exclusion_ip_1')).toHaveCount(1);
});
