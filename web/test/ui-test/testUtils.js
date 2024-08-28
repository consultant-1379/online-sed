import yaml from 'js-yaml';
export { yaml };
export const POD_NETWORK_CIDR = '192.168.0.0/1';
export const RWX_STORAGE_CLASS = 'nfs-enm';
export const RWO_STORAGE_CLASS = 'network-block';
export const HOST_PORT = '9100';
export const PULL_SECRET = 'csar-secret';
export const IPV4_VIPS_IPADDRESS_START = '10.11.12.13';
export const HOSTNAME_PREFIX = 'rn2enm';
export const IPV4_VIPS_IPADDRESS_END = '10.11.12.113';
export const FALLBACK_IP = '10.59.132.70';
export const FALLBACK_IP_DEPENDENT = '10.59.132.71';
export const SMRS_PORT = '1025';
export const ENVIRONMENT_MODEL = 'extraLarge__production_IPv4_dd.xml';
export const SSO_COOKIE_DOMAIN = "enmhost-1.athtem.eei.ericsson.se";
export const HTTPD_FQDN = "enmhost-1.athtem.eei.ericsson.se";
export const CLOUD_USER_SSH_KEY = 'file:///root/.ssh/vm_private_key.pub';
export const FB_NODE1_WWPN2 = "50:01:43:80:24:D5:35:D7";
export const TEST_DEFAULT_TRUE_KEY= "test_default_true_key";
export const TEST_DEFAULT_FALSE_KEY= "test_default_false_key";
export const TEST_DEFAULT_FREETEXT_KEY= "test_default_freetext_key";
export const IPV6_VIPS_IPADDRESS_START= '2001:1b70:6207:2c:0:1016:1001:4';
export const IPV6_VIPS_IPADDRESS_END='2001:1b70:6207:2c:0:1016:1001:100';


import path from 'path';
export { path };
import downloadsFolder from 'downloads-folder';
import fs from "fs";
export { downloadsFolder };
import { expect } from '@playwright/test';
export const DEPLOYMENT_SETUP_URL = "http://localhost:5002/#/deploymentsetup";

export async function goToDeploymentSetup(page, url){
    await page.goto(url);
}

export async function selectENMSize(page, enmSize) {
    await page.locator('#deployment-size').getByRole('button', { name: 'Please select...' }).click();
    await page.getByText(enmSize, { exact: true }).click();
}

export async function selectENMSchema(page, schema) {
    await page.locator('#schema-file').getByRole('button', { name: 'Please select...' }).click();
    await page.getByText(schema, { exact: true }).click();
}

export async function setupIpv4Deployment(page) {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, 'Physical ENM');
    await selectUseCase(page, 'Install');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge IPv4");
    await page.locator('#upgrade label i').click();
    await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(0);
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}

export async function setupDryRunIpv4Deployment(page) {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await page.locator('div#dry-run').locator('.ball').click();
    await selectProduct(page, 'Physical ENM');
    await selectUseCase(page, 'Install');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge IPv4");
    await page.locator('#upgrade label i').click();
    await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(0);
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}

export async function setupDryRunIpv6Deployment(page) {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await page.locator('div#dry-run').locator('.ball').click();
    await selectProduct(page, 'Physical ENM');
    await selectUseCase(page, 'Install');
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv6_ext");
    await selectENMSize(page, "medium");
    await selectENMSchema(page, "medium IPv6 EXT");
    await page.locator('#upgrade label i').click();
    await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(0);
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}

export async function setupDeploymentForPENM(page, filePath, useCase) {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, 'Physical ENM');
    await selectUseCase(page, useCase);
    await page.locator('div#include-passwords').locator('.ball').click();
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge IPv4");
    await selectPopulateFromPreviousSED(page, filePath);
    await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(0);
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}

export async function setupImportPENMDryRun(page, filePath) {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, 'Physical ENM');
    await selectUseCase(page, 'Upgrade');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge IPv4");
    await selectPopulateFromPreviousSED(page, filePath);
    await page.locator('div#dry-run').locator('.ball').click();
    await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(0);
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}

export async function selectProduct(page, product) {
    await page.locator('#deployment-product').getByRole('button', { name: 'Please select...' }).click();
    await page.locator("text=" + product).click();
}

export async function selectReleaseNumber(page, id='release-number', index=0) {
    await page.locator('#' + id).getByRole('button', { releaseNumber: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator('.item').nth(index).click();
}

export async function selectSprintNumber(page) {
    await page.locator('#sprint-number').getByRole('button', { releaseNumber: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator('.item').nth(0).click();
}

export async function selectReleaseVersion(page, id='release-version', index=0) {
    await page.locator('#' + id).getByRole('button', { name: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator('.item').nth(index).click();
}

export async function selectUseCase(page, useCase) {
    await page.locator('#use-case').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator("text=" + useCase).click();
}

export async function selectIpVersion(page, ipVersion) {
    await page.locator('#ip-version').getByRole('button', { name: 'Please select...' }).click();
    await page.locator("text=" + ipVersion).click();
}

export async function selectDropdownById(page, id, option) {
    await page.locator(id).getByRole('button', { name: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator("text=" + option).first().click();
}

export async function selectSchemaFile(page, schemaName) {
    await page.locator('#schema-file').getByRole('button', { name: 'Please select...' }).click();
    await page.locator("text=" + schemaName).click();
}

export async function selectPopulateFromPreviousSED(page, filePath) {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Choose SED file');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.resolve(filePath));
}

export async function fillCategory(page) {
    let rows = await page.locator('div.content:visible').locator('div.row.table');
    let rowIndicator=0;
    let rowNumber = await rows.count()-1;
    while (rowIndicator != rowNumber){
        let row = await rows.nth(rowIndicator+1);
        if(await row.locator('input').count()>0){
            let value = await row.locator('.column').nth(2).textContent();
            if(value == "Passw0rd" || value == "passw0rd"){
              value = "Passw0rd#";
            }
            await row.locator('input').fill(value);
        }

        rowIndicator++;
    }
}

export async function fillCategoryEndToEnd(page) {
    let rows = await page.locator('div.content:visible').locator('div.row.table');
    let rowIndicator=0;
    let rowNumber = await rows.count()-1;
    while (rowIndicator != rowNumber){
        let row = await rows.nth(rowIndicator+1);
        if(await row.locator('input').count()>0){
            let value = await row.locator('.column').nth(2).textContent();
            if(value == "Passw0rd" || value == "passw0rd"){
              value = "Passw0rd#";
            }
            await row.locator('input').fill(value);
        }
        else if(await row.locator('button').count()>0) {
            await row.locator('button').click();
            await page.locator('div.select.open').locator("div.options-list").locator('.item').nth(1).click();
        }
        rowIndicator++;
    }
}

export async function stepCategory(page){
    await page.getByRole('button', { name: 'Next' }).click();
}

export async function fillCategories(page){
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategoryStorage(page);
    await stepCategory(page);
    await fillCategoryFallback(page);
    await stepCategory(page);
    await fillCategoryOther(page);
    await page.getByRole('button', { name: 'Continue' }).click();
}

export async function fillCategoriesNoPasswords(page){
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategoryStorage(page);
    await stepCategory(page);
    await fillCategoryFallback(page);
    await stepCategory(page);
    await fillCategoryOtherNoPasswords(page);
    await page.getByRole('button', { name: 'Continue' }).click();
}

export async function fillCategoriesForUpgradeWithImmutableParams(page) {
    await fillCategoryIpv4(page);
    await stepCategory(page);
    await fillCategoryStorage(page);
    await stepCategory(page);
    await fillCategoryFallback(page);
    await stepCategory(page);
    await fillCategoryOtherForUpgrade(page);
    await page.getByRole('button', { name: 'Continue' }).click();
}

export async function stepCategories(page){
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await page.getByRole('button', { name: 'Continue' }).click();
}

export async function fillAutoPopulate(page){
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill(IPV4_VIPS_IPADDRESS_START);
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill(IPV4_VIPS_IPADDRESS_END);
    await page.getByRole('button', { name: 'Autopopulate' }).first().click();
    await page.locator('#hostname_prefix').locator('input').fill(HOSTNAME_PREFIX);
    await page.getByRole('button', { name: 'Autopopulate' }).last().click();
    await stepCategory(page);
}

export async function fillAutoPopulateCENM(page){
    await page.locator('#ipv4_vips_ipaddress_start').locator('input').fill(IPV4_VIPS_IPADDRESS_START);
    await page.locator('#ipv4_vips_ipaddress_end').locator('input').fill(IPV4_VIPS_IPADDRESS_END);
    await page.getByRole('button', { name: 'Autopopulate' }).first().click();
    await page.locator('#ipv6_vips_ipaddress_start').locator('input').fill(IPV6_VIPS_IPADDRESS_START);
    await page.locator('#ipv6_vips_ipaddress_end').locator('input').fill(IPV6_VIPS_IPADDRESS_END);
    await page.getByRole('button', { name: 'Autopopulate' }).nth(1).click();
    await stepCategory(page);
}

export async function fillCategoryIpv4(page){
    await page.locator('#podNetworkCIDR').locator('input').fill(POD_NETWORK_CIDR);
    await page.locator('#sfs_console_IP').locator('input').fill("10.11.12.113");
    await page.locator('#san_spaIP').locator('input').fill("10.11.12.113");
}

export async function fillCategoryStorage(page){
    await page.locator('#rwx_storageClass').locator('input').fill(RWX_STORAGE_CLASS);
    await page.locator('#rwo_storageClass').locator('input').fill(RWO_STORAGE_CLASS);
    await page.locator('#SSO_COOKIE_DOMAIN').locator('input').fill(SSO_COOKIE_DOMAIN);
}

export async function fillCategoryFallback(page){
    await page.locator('#enable_fallback').getByRole('button').first().click();
    await page.locator('#enable_fallback').getByText('true', { exact: true }).first().click();
    await page.locator('#fb_node1_IP').locator('input').fill(FALLBACK_IP);
    await page.locator('#cloud_user_ssh_key').locator('input').fill(CLOUD_USER_SSH_KEY);
    await page.locator('#fb_node1_WWPN2').locator('input').fill(FB_NODE1_WWPN2);
    await page.locator('#enable_fallback_domain_proxy').getByRole('button').first().click();
    await page.locator('#enable_fallback_domain_proxy').getByText('true', { exact: true }).first().click();
    await page.locator('#fb_dpmediation_1_ipaddress').locator('input').fill(FALLBACK_IP_DEPENDENT);
}

export async function fillCategoryOther(page){
    await page.locator('#hostPort').locator('input').fill(HOST_PORT);
    await page.locator('#pullSecret').locator('input').fill(PULL_SECRET);
    await page.locator('#smrs_sftp_securePort').locator('input').fill(SMRS_PORT);
    await page.locator('#environment_model').locator('input').fill(ENVIRONMENT_MODEL);
    await page.locator('#httpd_fqdn').locator('input').fill(HTTPD_FQDN);
    await page.locator('#password1').locator('input').fill('passw0rd');
    await page.locator('#password2').locator('input').fill('passw0rd');
    await page.locator('#evt_node2_IP').locator('input').fill('1.2.3.4');
    await page.locator('#visinamingsb_service').locator('input').fill('12.23.19.91');
    await page.locator('#itservices_0_vip_address').locator('input').fill('10.42.14.175');
    await page.locator('#itservices_1_vip_address').locator('input').fill('10.42.14.176');

}

export async function fillCategoryOtherNoPasswords(page){
    await page.locator('#hostPort').locator('input').fill(HOST_PORT);
    await page.locator('#pullSecret').locator('input').fill(PULL_SECRET);
    await page.locator('#smrs_sftp_securePort').locator('input').fill(SMRS_PORT);
    await page.locator('#environment_model').locator('input').fill(ENVIRONMENT_MODEL);
    await page.locator('#httpd_fqdn').locator('input').fill(HTTPD_FQDN);
    await page.locator('#evt_node2_IP').locator('input').fill('1.2.3.4');
}

export async function fillCategoryOtherForUpgrade(page){
    await page.locator('#hostPort').locator('input').fill(HOST_PORT);
    await page.locator('#pullSecret').locator('input').fill(PULL_SECRET);
    await page.locator('#smrs_sftp_securePort').locator('input').fill(SMRS_PORT);
    await page.locator('#environment_model').locator('input').fill(ENVIRONMENT_MODEL);
    await page.locator('#httpd_fqdn').locator('input').fill(HTTPD_FQDN);
    await page.locator('#password1').locator('input').fill('passw0rd');
    await page.locator('#password2').locator('input').fill('passw0rd');
    await page.locator('#evt_node2_IP').locator('input').fill('1.2.3.4');
}

export async function toggleUploadSchemaFromFileSwitch(page) {
    var uploadSchemaFromFileSwitch = page.locator('id=upload-schema-selector').locator('.ball').first();
    await uploadSchemaFromFileSwitch.click();
}

export async function toggleUploadIntegrationValuesFromFileSwitch(page) {
    var uploadBaseYamlFromFileSwitch = page.locator('id=upload-base-yaml-selector').locator('.ball').first();
    await uploadBaseYamlFromFileSwitch.click();
}

export async function uploadBaseYamlFileViaDragAndDrop(page) {
    const dataTransfer = await page.evaluateHandle(async ({ fileHex, localFileName, localFileType }) => {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(
                new File([fileHex], localFileName, { type: localFileType })
            );
            return dataTransfer;
        },
        {
            fileHex: (fs.readFileSync('test/resources/cENM/cENM_Small_dual.yaml','utf-8')),
            localFileName: 'ui_test_schema.json',
            localFileType: 'text/plain',
        }
    );
    await page.dispatchEvent('#drag-yaml-template-file', 'drop', { dataTransfer });
}

export async function uploadSchemaFileViaDragAndDrop(page) {
    const dataTransfer = await page.evaluateHandle(async ({ fileHex, localFileName, localFileType }) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File([fileHex], localFileName, { type: localFileType })
      );
      return dataTransfer;
    },
    {
      fileHex: (fs.readFileSync('res/schema/test/penm/ui_test_schema.json','utf-8')),
      localFileName: 'ui_test_schema.json',
      localFileType: 'text/plain',
    }
  );
    await page.dispatchEvent('#drag-schema-file', 'drop', { dataTransfer });
}

export async function uploadSchemaFileViaDragAndDropForPENM_IPV6(page) {
    const dataTransfer = await page.evaluateHandle(async ({ fileHex, localFileName, localFileType }) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File([fileHex], localFileName, { type: localFileType })
      );
      return dataTransfer;
    },
    {
      fileHex: (fs.readFileSync('test/resources/pENM/medium__production_IPv6_EXT_schema.json','utf-8')),
      localFileName: 'medium__production_IPv6_EXT_schema.json',
      localFileType: 'text/plain',
    }
  );
    await page.dispatchEvent('#drag-schema-file', 'drop', { dataTransfer });
}

// Check setup deployment page should reset values to default
export async function checkSetupDeploymentPageReset(page){
    await page.getByRole('link', { name: 'Deployment Setup' }).click();
    var dryRunToggle = page.locator('#dry-run').locator('.ball').first();
    await expect(await dryRunToggle.isChecked()).toBeFalsy();
    var includePasswordToggle = page.locator('#include-passwords').locator('.ball').first();
    await expect(await includePasswordToggle.isChecked()).toBeFalsy();
    await expect(page.locator('#release-version').getByRole('button', { name: 'Please select...' })).toBeVisible();
    await expect(page.locator('#ip-version').getByRole('button', { name: 'Please select...' })).toBeVisible();
    await expect(page.locator('#deployment-size').getByRole('button', { name: 'Please select...' })).toBeVisible();
    await expect(page.locator('#schema-file').getByRole('button', { name: 'Please select...' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Setup Deployment' })).toBeDisabled(true);
}

export async function finishAndDownload(page) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export SED' }).click();
    const download = await downloadPromise;
    const suggestedFileName = download.suggestedFilename();
    const filePath = path.join("downloads", suggestedFileName);
    await download.saveAs(filePath);
    expect(fs.existsSync(filePath)).toBeTruthy();
    return filePath;
}

export async function finishAndDownloadWithValidationErrors(page) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export SED' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    const download = await downloadPromise;
    const suggestedFileName = download.suggestedFilename();
    const filePath = path.join("downloads", suggestedFileName);
    await download.saveAs(filePath);
    expect(fs.existsSync(filePath)).toBeTruthy();
    return filePath;
}
export async function createDeploymentSetupCloudNative(page, useCase, uploadFilePath){
    await selectUseCase(page, useCase);
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    if (useCase === 'Upgrade'){
        await selectPopulateFromPreviousSED(page,uploadFilePath);
    } else {
        await page.locator('#upgrade label i').click();
    }
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}

export async function setupDeploymentForCENM(page, ipVersion, enmSize, useCase, uploadFilePath){
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await page.locator('div#dry-run').locator('.ball').click();
    await selectProduct(page, "Cloud Native ENM");
    await selectUseCase(page, useCase);
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, ipVersion);
    await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(0);
    await selectENMSize(page, enmSize);
    await selectPopulateFromPreviousSED(page, uploadFilePath);
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
}