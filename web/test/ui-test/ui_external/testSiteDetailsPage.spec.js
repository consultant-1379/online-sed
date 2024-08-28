import { test, expect } from '@playwright/test';
import {
    setupIpv4Deployment, fillCategory, stepCategory, setupDryRunIpv4Deployment, setupImportPENMDryRun, setupDeploymentForPENM, fillCategoryIpv4,
    setupDeploymentForCENM
} from '../testUtils.js';

async function fillCategoriesToOther(page) {
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);
}

test('test duplicates error message', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.locator('text=Site Details').click();
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    await page.locator('#fm_vip_address').locator('input').fill('10.42.14.164');
    await page.locator('#amos_vip_address').locator('input').fill('10.42.14.164');
    const amosIpLocation = page.locator('#error_message_amos_vip_address');
    const fmIpLocation = page.locator('#error_message_fm_vip_address');
    await page.locator('#amos_vip_address').locator('input').blur();
    await expect(amosIpLocation).toContainText("Duplicate Entry Error. See preview page for details.");
    await expect(fmIpLocation).toContainText("Duplicate Entry Error. See preview page for details.");
});

test('test validation issue category display message', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.locator('text=Site Details').click();
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    await page.locator('#fm_vip_address').locator('input').fill('10.42.14.164');
    await page.locator('#amos_vip_address').locator('input').fill('10.42.14.164');
    await expect(page.locator('div:has-text("Validation issues in the table")')).toBeVisible;
});

test('test validation issue category display message category complete', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    await page.locator('#fm_vip_address').locator('input').fill('10.42.14.164');
    await page.locator('#podNetworkCIDR').locator('input').fill('192.168.0.0/16');
    await page.locator('#amos_vip_address').locator('input').fill('10.42.14.168');
    await page.locator('#sfs_console_IP').locator('input').fill("10.11.12.113");
    await page.locator('#san_spaIP').locator('input').fill("10.11.12.113");
    await expect(page.locator('div:has-text("Validation issues in the table")')).not.toBeVisible;
});

test('test parameters displayed in Site Details page sorted alphabetically', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    if (await page.locator("#header-name-display").getByText('Parameter Name').first().isVisible()) {
        var selector = await page.locator('div:has-text("Toggle Variable Names")').locator('.ball').first();
        await selector.click();
    }
    var firstRow = await page.locator('#name-display').nth(0).innerHTML();
    var secondRow = await page.locator('#name-display').nth(1).innerHTML();
    var thirdRow = await page.locator('#name-display').nth(2).innerHTML();
    expect(firstRow < secondRow).toBe(true);
    expect(secondRow < thirdRow).toBe(true);
});

test('test toggle variable names switch value persists categories', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    var toggleKey = await page.locator('div:has-text("Toggle Variable Names")').locator('.ball').first();
    await toggleKey.click();
    expect(await toggleKey.isChecked()).toBeFalsy();
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    await expect(page.locator('#header-name-display').first()).toContainText('Parameter Name');
});

test('test display error message with invalid IPv4 CIDR address', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    const inputBox = page.locator('#fm_vip_address').locator('input');
    const errorMessage = page.locator('#error_message_fm_vip_address');
    await page.locator('#fm_vip_address').locator('input').fill('192.168.0.0/16');
    await expect(inputBox).toBeFocused();
    await expect(errorMessage).not.toBeVisible();
    await page.locator('#podNetworkCIDR').locator('input').fill('192.128.0.0/16');
    await expect(errorMessage).toContainText("Input must follow the IPv4 format and can only contain the following characters:");
  });

  test('test display error message for mismatch in values', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await page.locator('#fm_vip_address').locator('input').fill('10.42.14.164');
    await page.locator('#podNetworkCIDR').locator('input').fill('192.168.0.0/16');
    await page.locator('#amos_vip_address').locator('input').fill('10.42.14.168');
    await page.locator('#sfs_console_IP').locator('input').fill("10.11.12.113");
    await page.locator('#san_spaIP').locator('input').fill("10.11.12.113");
    await page.locator('#svc_CM_vip_ipaddress').locator('input').fill('11.12.32.1');
    await page.getByRole('button', { name: 'Next' }).click();
    await fillCategory(page);
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);
    const errorMessageHttpd = page.locator('#error_message_httpd_fqdn');
    await expect(errorMessageHttpd).not.toBeVisible();
    await fillCategory(page);
    await expect(page.getByRole('button', { name: 'Continue' })).not.toBeDisabled(true);
    await page.locator('#httpd_fqdn').locator('input').fill('enmhost-2.athtem.eei.ericsson.se');
    await page.locator('body').click();
    await expect(errorMessageHttpd).toContainText("Invalid entry. Value must match the key SSO_COOKIE_DOMAIN which has the value: enmhost-1.athtem.eei.ericsson.se");
    await expect(page.getByRole('button', { name: 'Continue' })).not.toBeDisabled(true);
    
    // Test on preview page for mismatch value
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    var storageCat = await page.locator('#storage')
    await expect(otherCat.locator('#httpd_fqdn').locator('#validation-display')).toHaveText('FAIL - Mismatched value  Must match value of SSO_COOKIE_DOMAIN');
    await expect(storageCat.locator('#SSO_COOKIE_DOMAIN').locator('#validation-display')).toHaveText('FAIL - Mismatched value  Must match value of httpd_fqdn');
});

//Three scenarios when use case is Upgrade, Dry-run mode is ON and we have immutable objects
test('test upgrade with immutable parameter, Dry-run mode ON -> should allow to update input for missing key/value and NOT show warning' , async ({ page }) => {
    await setupImportPENMDryRun(page, 'test/resources/pENM/incomplete_for_immutable_testing.txt');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await expect(page).toHaveURL('http://localhost:5002/#/sitedetails');
    await fillCategoriesToOther(page);
    await page.locator('#visinamingsb_service').locator('input').fill('10.42.42.172');
    const errorMessageVisinamingsb = page.locator('#error_message_visinamingsb_service');
    await page.locator('#visinamingsb_service').locator('input').blur();
    await expect(errorMessageVisinamingsb).toBeVisible(false);
    await page.locator('#itservices_0_vip_address').locator('input').fill('10.42.42.173');
    const errorMessageItservices = page.locator('#error_message_itservices_0_vip_address');
    await page.locator('#itservices_0_vip_address').locator('input').blur();
    await expect(errorMessageItservices).toBeVisible(false);
});

test('test upgrade with immutable parameter, Dry-run mode ON, missing key or value -> should allow to add invalid input and display validation error message' , async ({ page }) => {
    await setupImportPENMDryRun(page, 'test/resources/pENM/incomplete_for_immutable_testing.txt');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategoriesToOther(page);
    await page.locator('#visinamingsb_service').locator('input').fill('12.23.19.91/23');
    const errorMessageVisinamingsb = page.locator('#error_message_visinamingsb_service');
    await page.locator('#visinamingsb_service').locator('input').blur();
    await expect(errorMessageVisinamingsb).toBeVisible(true);
    await expect(errorMessageVisinamingsb).toContainText("Input must follow the IPv4 format and can only contain the following characters: 0-9 and .");
});

//Three scenarios when use case is Upgrade, Dry-run mode is OFF and we have immutable objects
test('test upgrade with immutable parameter, Dry-run mode OFF, missing key -> should allow to add invalid input and display validation error' , async ({ page }) => {
    await setupDeploymentForPENM(page, 'test/resources/pENM/incomplete_for_immutable_testing.txt', 'Upgrade');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategoriesToOther(page);
    await page.locator('#itservices_0_vip_address').locator('input').fill('10.42.42.173/2');
    const errorMessageItservices = page.locator('#error_message_itservices_0_vip_address');
    await page.locator('#itservices_0_vip_address').locator('input').blur();
    await expect(errorMessageItservices).toContainText("Input must follow the IPv4 format and can only contain the following characters: 0-9 and .");
    await page.locator('#itservices_0_vip_address').locator('input').fill('10.42.14.171');
    await page.locator('#itservices_0_vip_address').locator('input').blur();
    await expect(errorMessageItservices).toContainText("Duplicate Entry Error. See preview page for details.");
});

test('test upgrade with immutable parameter, Dry-run mode OFF, missing value -> should allow to add input and no immutable warning is displayed' , async ({ page }) => {
    await setupDeploymentForPENM(page, 'test/resources/pENM/incomplete_for_immutable_testing.txt', 'Upgrade');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategoriesToOther(page);
    await page.locator('#visinamingsb_service').locator('input').fill('12.23.19.91');
    const errorMessageVisinamingsb = page.locator('#error_message_visinamingsb_service');
    await page.locator('#visinamingsb_service').locator('input').blur();
    await expect(errorMessageVisinamingsb).toContainText("");
});

test('test upgrade with immutable parameter, Dry-run mode OFF, missing required value -> should not allow to click next until value is added' , async ({ page }) => {
    await setupDeploymentForPENM(page, 'test/resources/pENM/incomplete_for_immutable_testing.txt', 'Upgrade');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategoriesToOther(page);
    expect(page.getByRole('button', { name: 'Continue' })).not.toBeDisabled(true);
    await page.locator('#visinamingsb_service').locator('input').fill('12.23.19.91');
    await page.locator('#itservices_0_vip_address').locator('input').fill('10.42.14.175');
    await page.getByRole('button', { name: 'Continue' }).click();
});

test('test upgrade with immutable parameter, Dry-run mode OFF, previoulsy populated immutable prameter should be readonly' , async ({ page }) => {
    await setupDeploymentForPENM(page, 'test/resources/pENM/incomplete_for_immutable_testing.txt', 'Upgrade');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategoriesToOther(page);
    expect(page.getByRole('button', { name: 'Continue' })).not.toBeDisabled(true);
    const immutableValue = page.locator('#itservices_1_vip_address').locator('input');
    const noPreviousValue = page.locator('#itservices_0_vip_address').locator('input');
    await expect(immutableValue).toHaveAttribute('readonly');
    await expect(noPreviousValue).not.toHaveAttribute('readonly');
});

test('test text-area input in site-details table', async ({ page }) => {
    await setupDeploymentForCENM(page, 'ipv4', 'extraLarge', 'Upgrade', 'test/resources/cENM/cENM_fully_populated.yaml');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await page.$eval('#enmHost', textarea => textarea.value);
    await expect(page.locator('#enmHost').locator('textarea')).toHaveValue('ieatenmc12a009.athtem.eei.ericsson.se');
});