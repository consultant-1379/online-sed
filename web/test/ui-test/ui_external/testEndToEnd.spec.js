import { test, expect } from '@playwright/test';
import {
    stepCategory,
    path,
    goToDeploymentSetup,
    selectUseCase,
    selectSprintNumber,
    selectReleaseVersion,
    selectIpVersion,
    toggleUploadSchemaFromFileSwitch,
    fillCategoryEndToEnd,
    selectENMSize,
    fillAutoPopulateCENM,
    finishAndDownload,
    setupDeploymentForCENM,
    selectPopulateFromPreviousSED,
    selectENMSchema
} from '../testUtils.js';
import {
  fillCloudNativeCategories
} from '../testcENMUtils.js';
import {
    fillExcludeIPs,
    fillAutoPopulatePENM,
    finishAndDownloadAfterFixingErrors,
    fillExcludeIPsPreserved,
    checkAutoPopulatePENM
} from '../testpENMUtils.js'
import fs from 'fs';

async function selectSchemaFromFile(page, product, filename) {
    await toggleUploadSchemaFromFileSwitch(page);
    const dataTransfer = await page.evaluateHandle(async ({ fileHex, localFileName, localFileType }) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File([fileHex], localFileName, { type: localFileType })
      );
      return dataTransfer;
    },
    {
      fileHex: (fs.readFileSync('test/resources/' + product + '/' + filename,'utf-8')),
      localFileName: filename,
      localFileType: 'text/plain',
    }
    );
    await page.dispatchEvent('#drag-schema-file', 'drop', { dataTransfer });
}

test('test e2e install for physical ENM medium production dual', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await page.locator('#deployment-product').getByRole('button', { name: 'Please select...' }).click();
    await page.locator("text=" + "Physical ENM").click();
    await selectUseCase(page, "Install");
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(0);
    await selectIpVersion(page, "dual");
    await selectSchemaFromFile(page, 'pENM', 'full__medium__production_Dual_schema.json');
    await selectENMSize(page, "medium");
    await selectENMSchema(page, "medium Dual");
    await page.locator('#upgrade label i').click();
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await fillExcludeIPs(page);
    await page.locator('li:has-text("Site Details")').click();
    await stepCategory(page);
    await fillCategoryEndToEnd(page);
    await page.locator('li:has-text("Auto Populate")').click();
    await fillAutoPopulatePENM(page);
    while(await page.getByRole('button', { name: 'Next' }).isVisible() == true)
    {
      await fillCategoryEndToEnd(page);
      await stepCategory(page);
    }
    await fillCategoryEndToEnd(page);
    await finishAndDownloadAfterFixingErrors(page);
});

test('test e2e install for Cloud Native ENM extraLarge production dual', async ({ page }) => {
  await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
  await page.locator('#deployment-product').getByRole('button', { name: 'Please select...' }).click();
  await page.locator("text=" + "Cloud Native ENM").click();
  await selectUseCase(page, "Install");
  await selectSprintNumber(page);
  await selectReleaseVersion(page);
  await expect(page.locator('div#csar-lite').locator('.ball')).toHaveCount(1);
  await selectIpVersion(page, "Dual");
  await selectSchemaFromFile(page, 'cENM', 'eric-enm-integration-values-sed-schema.json');
  await selectENMSize(page, "extraLarge");
  await page.locator('#upgrade label i').click();
  await page.getByRole('button', { name: 'Setup Deployment' }).click();
  await fillAutoPopulateCENM(page);
  await stepCategory(page);
  await page.locator('#amos_vip_address ').locator('input').fill('10.11.12.18');
  await stepCategory(page);
  await stepCategory(page);
  await fillCloudNativeCategories(page);
  await page.locator('#show_errors_button').click();
  await expect(page.locator('#ipv4')).toBeVisible();
  let validationDisplayDivs = await page.$$('#validation-display');
  expect(validationDisplayDivs.length).toBe(2);
  for (const div of validationDisplayDivs) {
    const textContent = await div.textContent();
    expect(textContent).toContain('FAIL -');
  }
  await page.getByRole('button', { name: 'Export SED' }).click();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByText('2. IPv4 Address').click();
  await page.locator('#amos_vip_address').locator('input').fill('10.11.12.17');
  await page.locator('li:has-text("Preview and Export")').click();
  await expect(page.getByText('No data to display')).toBeVisible();
  await finishAndDownload(page);
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByText('2. IPv4 Address').click();
  await page.locator('#amos_vip_address').locator('input').fill('10.11.12.18');
  await page.locator('li:has-text("Deployment Setup")').click();
  await page.locator('div#dry-run').locator('.ball').click();
  await page.locator('li:has-text("Preview and Export")').click();
  let downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SED' }).click();
  await expect(page.getByText('Warning')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  const download = await downloadPromise;
  const suggestedFileName = download.suggestedFilename();
  const filePath = path.join("downloads", suggestedFileName);
  await download.saveAs(filePath);
  expect(fs.existsSync(filePath)).toBeTruthy();
});

test('test e2e upgrade for Cloud Native ENM extraLarge production dual', async ({ page }) => {
  await setupDeploymentForCENM(page, "Dual", "extraLarge", "Upgrade", 'test/resources/cENM/eric-enm-integration-values-extraLarge-24.07.57.yaml');
  await stepCategory(page);
  await stepCategory(page);
  await stepCategory(page);
  await expect(page.locator('#rwo_storageClass').locator('input')).toHaveAttribute('readonly');
  await stepCategory(page);
  await page.locator('#backup_scheduling_schedules').locator('button').click();
  await expect(page.locator('#objectArray-input-every-0')).toHaveValue('1w');
  await page.locator('#closeBtn').click();
  await page.locator('#nodeSelector').locator('button').click();
  await expect(page.locator('#nodeKey_0')).toHaveValue('node');
  await expect(page.locator('#nodeValue_0')).toHaveValue('cENM_Nodes');
  await expect(page.locator('#nodeValue_0')).toHaveAttribute('readonly');
  await page.locator('#closeBtn').click();
  await page.locator('#sccResources ').locator('button').click();
  await expect(page.locator('#entry_val_0')).toHaveValue('val1');
  await expect(page.locator('#entry_val_0')).toHaveAttribute('readonly');
  await page.locator('#closeBtn').click();
  await page.getByRole('button', { name: 'Add Toleration' }).click();
  await expect(page.locator('#toleration-key-0').locator('input')).toHaveValue('key1');
  await expect(page.locator('#toleration-value-0').locator('input')).toHaveValue('value1');
  await expect(page.locator('#toleration-key-0').locator('input')).toHaveAttribute('readonly');
  await expect(page.locator('#toleration-value-0').locator('input')).toHaveAttribute('readonly');
  await page.locator('#closeTolerationBtn').click();
  await stepCategory(page);
  await stepCategory(page);
  await stepCategory(page);
  await stepCategory(page);
  await page.locator('#annotations').locator('button').click();
  await expect(page.locator('#objectKey_0')).toHaveValue('metallb.universe.tf/loadBalancerIPs');
  await expect(page.locator('#objectValue_0')).toHaveValue('10.42.14.167,2001:1b70:82b9:9f::1:1b');
  await page.locator('#closeBtn').click();
  await page.locator('#ingressControllerLoadBalancerIP').locator('input').fill('2.17.32.12');
  await page.locator('li:has-text("Preview and Export")').click();
  await page.locator('#show_changes_button').click();
  let validationDisplayDivs = await page.$$('#validation-display');
  expect(validationDisplayDivs.length).toBe(1);
  await page.getByRole('button', { name: 'Show Errors Only' }).click();
  validationDisplayDivs = await page.$$('#validation-display');
  expect(validationDisplayDivs.length).toBe(0);
  await finishAndDownload(page);
});


test('test e2e upgrade for physical ENM medium production dual', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await page.locator('#deployment-product').getByRole('button', { name: 'Please select...' }).click();
    await page.locator("text=" + "Physical ENM").click();
    await selectUseCase(page, "Upgrade");
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "dual");
    await selectSchemaFromFile(page, 'pENM', 'full__medium__production_Dual_schema.json');
    await selectENMSize(page, "medium");
    await selectENMSchema(page, "medium Dual");
    await selectPopulateFromPreviousSED(page, 'test/resources/pENM/medium__production_Dual_schema.json-24.05.106.txt');
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await fillExcludeIPsPreserved(page);
    await checkAutoPopulatePENM(page);
    await stepCategory(page);
    await expect(page.locator('#VLAN_ID_backup').locator('input')).toHaveValue('2017');
    while(await page.getByRole('button', { name: 'Next' }).isVisible() == true)
    {
      await fillCategoryEndToEnd(page);
      await stepCategory(page);
    }
    await expect(page.locator('#environment_model').locator('input')).toHaveValue('extraLarge__production_dualStack__3evt_racks_2eba.xml');
    await fillCategoryEndToEnd(page);
    await finishAndDownloadAfterFixingErrors(page);
});
