import { test, expect } from '@playwright/test';
import {
    fillCategories,
    setupIpv4Deployment,
    stepCategory,
    POD_NETWORK_CIDR,
    RWX_STORAGE_CLASS,
    RWO_STORAGE_CLASS,
    HOST_PORT,
    HOSTNAME_PREFIX,
    PULL_SECRET,
    IPV4_VIPS_IPADDRESS_START,
    IPV4_VIPS_IPADDRESS_END,
    FALLBACK_IP,
    CLOUD_USER_SSH_KEY,
    ENVIRONMENT_MODEL,
    SMRS_PORT,
    FALLBACK_IP_DEPENDENT,
    fillCategoryIpv4,
    fillCategoryStorage,
    fillCategoryOther,
    HTTPD_FQDN,
    SSO_COOKIE_DOMAIN,
    goToDeploymentSetup,
    DEPLOYMENT_SETUP_URL,
    finishAndDownload,
    TEST_DEFAULT_TRUE_KEY,
    TEST_DEFAULT_FALSE_KEY,
    TEST_DEFAULT_FREETEXT_KEY
} from '../testUtils.js';
import fs from 'fs';


async function goNextCategory(page){
    const button = await page.getByRole('button', { name: 'Next' });
    await button.click();
}

async function fillAutoPopulate(page){
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill(IPV4_VIPS_IPADDRESS_START);
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill(IPV4_VIPS_IPADDRESS_END);
    const nextIP = await page.locator('#find-next-available-address');
    await expect(nextIP).toHaveText("10.11.12.13");
    await page.getByRole('button', { name: 'Autopopulate' }).first().click();
    await page.locator('#hostname_prefix').locator('input').fill(HOSTNAME_PREFIX);
    await page.getByRole('button', { name: 'Autopopulate' }).last().click();
    await goNextCategory(page);
}

test('test installation', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await fillAutoPopulate(page);
    await fillCategories(page);
    var downloadedFilePath = await finishAndDownload(page);
    var resultData = fs.readFileSync(downloadedFilePath, 'utf8');
    var resultDataObject = resultData.split("\n").reduce((acc, str) => {
        const [key, value] = str.split("=");
        acc[key] = value;
        return acc;
      }, {});

    expect(IPV4_VIPS_IPADDRESS_START).toStrictEqual(resultDataObject.ipv4_vips_ipaddress_start);
    expect(IPV4_VIPS_IPADDRESS_END).toStrictEqual(resultDataObject.ipv4_vips_ipaddress_end);
    expect('10.11.12.15').toStrictEqual(resultDataObject.amos_vip_address);
    expect('10.11.12.13').toStrictEqual(resultDataObject.fm_vip_address);
    expect(POD_NETWORK_CIDR).toStrictEqual(resultDataObject.podNetworkCIDR);
    expect(RWX_STORAGE_CLASS).toStrictEqual(resultDataObject.rwx_storageClass);
    expect(RWO_STORAGE_CLASS).toStrictEqual(resultDataObject.rwo_storageClass);
    expect('true').toStrictEqual(resultDataObject.enable_fallback);
    expect(FALLBACK_IP).toStrictEqual(resultDataObject.fb_node1_IP);
    expect(CLOUD_USER_SSH_KEY).toStrictEqual(resultDataObject.cloud_user_ssh_key);
    expect(HOST_PORT).toStrictEqual(resultDataObject.hostPort);
    expect(PULL_SECRET).toStrictEqual(resultDataObject.pullSecret);
    expect(SMRS_PORT).toStrictEqual(resultDataObject.smrs_sftp_securePort);
    expect(ENVIRONMENT_MODEL).toStrictEqual(resultDataObject.environment_model);
    expect(HTTPD_FQDN).toStrictEqual(resultDataObject.httpd_fqdn);
    expect(SSO_COOKIE_DOMAIN).toStrictEqual(resultDataObject.SSO_COOKIE_DOMAIN);
    expect(resultDataObject[TEST_DEFAULT_FALSE_KEY]).toBe("false");
    expect(resultDataObject[TEST_DEFAULT_TRUE_KEY]).toBe("true");
    expect(resultDataObject[TEST_DEFAULT_FREETEXT_KEY]).toBe("hello");
});

test('test fallback displayIf dependent functionality both true', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await fillAutoPopulate(page);
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategoryStorage(page);
    await stepCategory(page);
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('true', { exact: true }).first().click();
    await page.locator('#fb_node1_IP').locator('input').fill(FALLBACK_IP);
    await page.locator('#cloud_user_ssh_key').locator('input').fill(CLOUD_USER_SSH_KEY);
    await page.locator('#enable_fallback_domain_proxy').getByRole('button').first().click();
    await page.locator('#enable_fallback_domain_proxy').getByText('true', { exact: true }).first().click();
    await page.locator('#fb_dpmediation_1_ipaddress').locator('input').fill(FALLBACK_IP_DEPENDENT);
    await stepCategory(page);
    await fillCategoryOther(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    var downloadedFilePath = await finishAndDownload(page);
    var resultData = fs.readFileSync(downloadedFilePath, 'utf8');
    var resultDataObject = resultData.split("\n").reduce((acc, str) => {
        const [key, value] = str.split("=");
        acc[key] = value;
        return acc;
      }, {});

    expect('true').toStrictEqual(resultDataObject.enable_fallback);
    expect(FALLBACK_IP).toStrictEqual(resultDataObject.fb_node1_IP);
    expect('true').toStrictEqual(resultDataObject.enable_fallback_domain_proxy);
    expect(FALLBACK_IP_DEPENDENT).toStrictEqual(resultDataObject.fb_dpmediation_1_ipaddress);
});

test('test fallback displayIf dependent functionality one true', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await fillAutoPopulate(page);
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategoryStorage(page);
    await stepCategory(page);
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('true', { exact: true }).first().click();
    await page.locator('#fb_node1_IP').locator('input').fill(FALLBACK_IP);
    await page.locator('#cloud_user_ssh_key').locator('input').fill(CLOUD_USER_SSH_KEY);
    await expect(page.locator('#fb_dpmediation_1_ipaddress').locator('input')).toHaveCount(0);

    await stepCategory(page);
    await fillCategoryOther(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    var downloadedFilePath = await finishAndDownload(page);

    var resultData = fs.readFileSync(downloadedFilePath, 'utf8');
    var resultDataObject = resultData.split("\n").reduce((acc, str) => {
        const [key, value] = str.split("=");
        acc[key] = value;
        return acc;
      }, {});

    expect('true').toStrictEqual(resultDataObject.enable_fallback);
    expect(FALLBACK_IP).toStrictEqual(resultDataObject.fb_node1_IP);
    expect(CLOUD_USER_SSH_KEY).toStrictEqual(resultDataObject.cloud_user_ssh_key);
    expect('false').toStrictEqual(resultDataObject.enable_fallback_domain_proxy);
});

test('test fallback displayIf dependent functionality both false', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await fillAutoPopulate(page);
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategoryStorage(page);
    await stepCategory(page);
    await expect(page.locator('#fb_node1_IP').locator('input')).toHaveCount(0);
    await expect(page.locator('#fb_dpmediation_1_ipaddress').locator('input')).toHaveCount(0);
    await expect(page.locator('#cloud_user_ssh_key').locator('input')).toHaveCount(0);


    await stepCategory(page);
    await fillCategoryOther(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    var downloadedFilePath = await finishAndDownload(page);

    var resultData = fs.readFileSync(downloadedFilePath, 'utf8');
    var resultDataObject = resultData.split("\n").reduce((acc, str) => {
        const [key, value] = str.split("=");
        acc[key] = value;
        return acc;
      }, {});

    expect('false').toStrictEqual(resultDataObject.enable_fallback);
});

test('test variable name column on site details page', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await fillAutoPopulate(page);
    var selector = page.locator('div:has-text("Toggle Variable Names")').locator('.ball').first();
    await expect(page.locator('#header-name-display').first()).toContainText('Parameter Key');
    await expect(page.locator('#name-display').first()).toContainText('amos_vip_address');
    await selector.click();
    await expect(page.locator('#header-name-display').first()).toContainText('Parameter Name');
    await expect(page.locator('#name-display').first()).toContainText(['AMOS IPv4 Virtual IP']);
});

test('test variable name column on preview details page', async ({ page }) => {
    await setupIpv4Deployment(page);
    await page.locator('li:has-text("Preview and Export")').click();
    var selector = page.locator('div:has-text("Toggle Variable Names")').locator('.ball').first();
    await expect(page.locator('#header-name-display').first()).toContainText('Parameter Key');
    await expect(page.locator('#name-display').first()).toContainText('amos_vip_address');
    await page.getByRole('button', { name: 'Show Variable Names' }).click();
    await expect(page.locator('#header-name-display').first()).toContainText('Parameter Name');
    await expect(page.locator('#name-display').first()).toContainText(['AMOS IPv4 Virtual IP']);
});

test('test API docs link not availible on external SED', async ({ page }) => {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    const apiLink = page.locator('#API_docs_URl');
    expect(apiLink).not.toBeVisible;
});
