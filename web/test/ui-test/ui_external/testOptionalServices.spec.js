import { test, expect } from '@playwright/test';
import {
    setupImportPENMDryRun,
    stepCategory,
    FALLBACK_IP,
    setupIpv4Deployment,
    FALLBACK_IP_DEPENDENT,
    fillAutoPopulate,
    fillCategoryIpv4,
    fillCategoryStorage,
    fillCategoryOther,
    CLOUD_USER_SSH_KEY,
    uploadSchemaFileViaDragAndDropForPENM_IPV6,
    toggleUploadSchemaFromFileSwitch,
    selectUseCase,
    selectReleaseVersion,
    selectIpVersion,
    selectSprintNumber,
    selectProduct, setupDeploymentForCENM
} from '../testUtils.js';

test('test optoinal service enabled and its dependent key to be required, disabled and only its enable key should be shown in preview', async ({ page }) => {
    await setupIpv4Deployment(page);
    await stepCategory(page);
    await fillAutoPopulate(page);
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategoryStorage(page);
    await stepCategory(page);

    // Check input field has been set to required when optional services is enabled
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('true', { exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled(true);
    await page.locator('#fb_node1_IP').locator('input').fill(FALLBACK_IP);
    await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled(true);
    await page.locator('#enable_fallback_domain_proxy').getByRole('button').first().click();
    await page.locator('#enable_fallback_domain_proxy').getByText('true', { exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled(true);
    await page.locator('#fb_dpmediation_1_ipaddress').locator('input').fill(FALLBACK_IP_DEPENDENT);
    await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled(true);
    await page.locator('#cloud_user_ssh_key').locator('input').fill(CLOUD_USER_SSH_KEY);
    await expect(page.locator('#fb_node1_WWPN2').locator('input')).toBeEmpty();
    await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled(true);
    await stepCategory(page);
    await fillCategoryOther(page);

    // Check if user input is visible in preview page
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    await expect(page.locator('#fallbackNodeApplications').locator('#fb_node1_IP')).toBeVisible();
    await expect(page.locator('#fallbackNodeApplications').locator('#fb_node1_IP').locator('#response-display')).toHaveText(FALLBACK_IP);
    await expect(page.locator('#fallbackNodeApplications').locator('#fb_dpmediation_1_ipaddress')).toBeVisible();
    await expect(page.locator('#fallbackNodeApplications').locator('#fb_dpmediation_1_ipaddress').locator('#response-display')).toHaveText(FALLBACK_IP_DEPENDENT);

    // Return to optional service and set it back to false
    await page.getByRole('link', { name: 'Site Details' }).click();
    await page.locator('div:nth-child(3) > .sphere').click();
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('false', { exact: true }).first().click();

    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var fallbackCat = await page.locator('#fallbackNodeApplications');
    await expect(fallbackCat.locator('#enable_fallback')).toBeVisible();
    await expect(fallbackCat.locator('#enable_fallback').locator('#response-display')).toHaveText('false');
    await expect(fallbackCat.locator('#fb_node1_IP')).not.toBeVisible();
    await expect(fallbackCat.locator('#enable_fallback_domain_proxy')).not.toBeVisible();
    await expect(fallbackCat.locator('#fb_dpmediation_1_ipaddress')).not.toBeVisible();
});

test('test optionalService input removed in site details and preview when disabled', async ({ page }) => {
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
    await page.locator('#enable_fallback_domain_proxy').getByRole('button').first().click();
    await page.locator('#enable_fallback_domain_proxy').getByText('true', { exact: true }).first().click();
    await page.locator('#fb_dpmediation_1_ipaddress').locator('input').fill(FALLBACK_IP_DEPENDENT);

    // Disable and enable it again
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('false', { exact: true }).first().click();
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('true', { exact: true }).first().click();
    await page.locator('#enable_fallback_domain_proxy').getByRole('button').first().click();
    await page.locator('#enable_fallback_domain_proxy').getByText('true', { exact: true }).first().click();

    // Check user inputs are removed
    await expect(page.locator('#fb_node1_IP').locator('input')).toHaveText("");
    await expect(page.locator('#fb_dpmediation_1_ipaddress').locator('input')).toHaveText("");

    // Disable and continue to next
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('false', { exact: true }).first().click();

    await stepCategory(page);
    await fillCategoryOther(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    var fallbackCat = await page.locator('#fallbackNodeApplications');
    await expect(fallbackCat.locator('#enable_fallback')).toBeVisible();
    await expect(fallbackCat.locator('#enable_fallback').locator('#response-display')).toHaveText('false');
    await expect(fallbackCat.locator('#fb_node1_IP')).not.toBeVisible();
    await expect(fallbackCat.locator('#enable_fallback_domain_proxy')).not.toBeVisible();
    await expect(fallbackCat.locator('#fb_dpmediation_1_ipaddress')).not.toBeVisible();
});

test('test import SED with optional service disabled and do not see dependent keys in preview page', async ({ page }) => {
    await setupImportPENMDryRun(page, 'test/resources/pENM/pENM.txt');
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var fallbackCat = await page.locator('#fallbackNodeApplications');
    await expect(fallbackCat.locator('#enable_fallback')).toBeVisible();
    await expect(fallbackCat.locator('#enable_fallback').locator('#response-display')).toHaveText('false');
    await expect(fallbackCat.locator('#fb_node1_IP')).not.toBeVisible();
    await expect(fallbackCat.locator('#enable_fallback_domain_proxy')).not.toBeVisible();
    await expect(fallbackCat.locator('#fb_dpmediation_1_ipaddress')).not.toBeVisible();
});

test('test optional service enabled for a ipv6 setup, no keys should be visible unless displayIf key is true', async ({ page }) => {
    await page.goto("http://localhost:5003/#/deploymentsetup");
    await selectProduct(page, 'Physical ENM');
    await selectUseCase(page, 'Install');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv6_ext");
    await toggleUploadSchemaFromFileSwitch(page);
    await uploadSchemaFileViaDragAndDropForPENM_IPV6(page);
    await expect(page.locator('#file-name')).toHaveText("File Name: medium__production_IPv6_EXT_schema.json");
    await page.locator('#upgrade label i').click();
    await page.locator('div#dry-run').locator('.ball').click();
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await expect(page.locator('#enable_fallback_category')).toBeVisible(true);
    await expect(page.locator('#enable_fallback_category').locator('button.btn.current-options')).toHaveText("false");
    //Checking other keys depending on enable_fallback_category are not visible
    await expect(page.locator('#fb_node1_IPv6')).not.toBeVisible(true);
    await expect(page.locator('#fb_mssnmpfm_5_ipv6address')).not.toBeVisible(true);
    await expect(page.locator('#cloud_user_ssh_key')).not.toBeVisible(true);
    await expect(page.locator('#enable_fallback_fm_services_ipv6')).not.toBeVisible(true);
    await expect(page.locator('#enable_fallback_domain_proxy')).not.toBeVisible(true);

    //Enable enable_fallback_category
    await page.locator('#enable_fallback_category').getByRole('button').first().click();
    await page.locator('#enable_fallback_category').getByText('true', { exact: true }).first().click();
    await expect(page.locator('#enable_fallback_fm_services_ipv6')).toBeVisible(true);
    await expect(page.locator('#enable_fallback_domain_proxy')).toBeVisible(true);
    await expect(page.locator('#cloud_user_ssh_key')).toBeVisible(true);
    await expect(page.locator('#fb_node1_IPv6')).toBeVisible(true);
    await expect(page.locator('#fb_node1_eth3_macaddress')).toBeVisible(true);

    //Enable enable_fallback_fm_services_ipv6
    await expect(page.locator('#enable_fallback_fm_services_ipv6').locator('button.btn.current-options')).toHaveText("false");
    await expect(page.locator('#fb_mssnmpfm_5_ipv6address')).not.toBeVisible(true);
    await expect(page.locator('#fb_nbfmsnmp_1_ipv6address')).not.toBeVisible(true);
    await page.locator('#enable_fallback_fm_services_ipv6').getByRole('button').first().click();
    await page.locator('#enable_fallback_fm_services_ipv6').getByText('true', { exact: true }).first().click();
    await expect(page.locator('#fb_mssnmpfm_5_ipv6address')).toBeVisible(true);
    await expect(page.locator('#fb_nbfmsnmp_1_ipv6address')).toBeVisible(true);

    //No keys that have enable_fallback_fm_services_ipv4 should be displayed
    await expect(page.locator('#fb_comecimpolicy_1_ip_internal')).not.toBeVisible(true);
    await expect(page.locator('#fb_gossiprouter01_internal')).not.toBeVisible(true);
    await expect(page.locator('#enable_fallback_fm_services_ipv4')).not.toBeVisible(true);
    await expect(page.locator('#fb_mssnmpfm_4_ip_internal')).not.toBeVisible(true);

    // Return to optional service and set it back to false
    await page.locator('#enable_fallback_fm_services_ipv6').getByRole('button').first().click();
    await page.locator('#enable_fallback_fm_services_ipv6').getByText('false', { exact: true }).first().click();
    await expect(page.locator('#fb_mssnmpfm_5_ipv6address')).not.toBeVisible(true);
    await expect(page.locator('#fb_nbfmsnmp_1_ipv6address')).not.toBeVisible(true);
    await page.locator('#enable_fallback_category').getByRole('button').first().click();
    await page.locator('#enable_fallback_category').getByText('false', { exact: true }).first().click();
    await expect(page.locator('#fb_node1_IPv6')).not.toBeVisible(true);
    await expect(page.locator('#fb_mssnmpfm_5_ipv6address')).not.toBeVisible(true);
    await expect(page.locator('#cloud_user_ssh_key')).not.toBeVisible(true);
    await expect(page.locator('#enable_fallback_fm_services_ipv6')).not.toBeVisible(true);
    await expect(page.locator('#enable_fallback_domain_proxy')).not.toBeVisible(true);
});

test('test optional parameter, key should not be visible when displayIfNot key is true and' +
    ' should be visible when displayIfNot key is false', async ({ page }) => {
    await setupDeploymentForCENM(page, 'ipv4', 'extraLarge', 'Upgrade', 'test/resources/cENM/eric-enm-integration-extra-large-production-values-undefined.yaml');
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await expect(page.locator('#ingress_RBAC_service_account_name')).not.toBeVisible(true);
    await page.locator('#ingress_RBAC_create').getByRole('button').first().click();
    await page.locator('#ingress_RBAC_create').getByText('false', { exact: true }).first().click();
    await expect(page.locator('#ingress_RBAC_service_account_name')).toBeVisible(true);
});
