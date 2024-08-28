import { test, expect } from '@playwright/test';
import {
  goToDeploymentSetup,
  selectENMSize,
  selectReleaseVersion,
  selectProduct,
  selectPopulateFromPreviousSED,
  selectIpVersion,
  DEPLOYMENT_SETUP_URL,
  path,
  stepCategory,
  ENVIRONMENT_MODEL,
  setupDeploymentForPENM,
  selectENMSchema,
  fillCategoriesNoPasswords,
  fillCategoryIpv4,
  fillCategoryStorage,
  fillCategoryFallback,
  fillCategoryOtherNoPasswords,
  selectUseCase,
  selectReleaseNumber,
  selectSprintNumber,
  fillCategoriesForUpgradeWithImmutableParams,
  finishAndDownloadWithValidationErrors, setupDeploymentForCENM,
  TEST_DEFAULT_FALSE_KEY,
  TEST_DEFAULT_TRUE_KEY,
  TEST_DEFAULT_FREETEXT_KEY
} from '../testUtils.js';
import fs from 'fs';
import yaml from "js-yaml";

test.describe('test', async () => {
  test.describe.configure({ mode: 'serial' });

  async function uploadSedFileViaDragAndDropForPENM(page){
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, "Physical ENM");
    await selectUseCase(page, 'Upgrade');
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge IPv4");
    const dataTransfer = await page.evaluateHandle( async ({ fileHex, localFileName, localFileType }) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File([fileHex], localFileName, { type: localFileType })
      );
      return dataTransfer;
    },
    {
      fileHex: (fs.readFileSync('test/resources/pENM/pENM.txt','utf-8')),
      localFileName: 'pENM.txt',
      localFileType: 'text/plain',
    }
  );
    await page.dispatchEvent('#drag-sed-file', 'drop', { dataTransfer });

    expect(page.locator('#file-name')).toHaveText("File Name: pENM.txt");
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
  }

  async function finishAndDownloadTXT(page){
      let passwordKeyExists = false;
      const passwordKey = 'password1'
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export SED' }).click();

      const download = await downloadPromise;
      expect(download);

      const suggestedFileName = "pENM.txt";
      const filePath = path.join("downloads", suggestedFileName);
      await download.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBeTruthy();
      var array = fs.readFileSync(filePath).toString().split("\n");
      array.forEach((entry) => {
        var [key, value] = entry.split('=');
        if (key === "environment_model") {
          expect(ENVIRONMENT_MODEL).toStrictEqual(value);
        } else if (key === passwordKey) {
          passwordKeyExists = true;
        } else if (key === TEST_DEFAULT_FALSE_KEY) {
          expect(value).toBe("true");
        } else if (key === TEST_DEFAULT_TRUE_KEY) {
          expect(value).toBe("false");
        } else if (key === TEST_DEFAULT_FREETEXT_KEY) {
          expect(value).toBe("not hello");
        }
      });
      expect(passwordKeyExists).toStrictEqual(false);
  }

  test('test upgrade for pENM', async ({ page }) => {
      await setupDeploymentForPENM(page, 'test/resources/pENM/pENM.txt', 'Upgrade');
      await stepCategory(page);
      await page.getByRole('button', { name: 'Autopopulate' }).first().click();
      await page.getByRole('button', { name: 'Autopopulate' }).last().click();
      await stepCategory(page);
      await fillCategoriesNoPasswords(page);
      await page.getByRole('button', { name: 'Back' }).click();
      await page.locator('#'+TEST_DEFAULT_TRUE_KEY).getByRole('button').first().click();
      await page.locator('#'+TEST_DEFAULT_TRUE_KEY).getByText('false', { exact: true }).first().click();
      await page.locator('#'+TEST_DEFAULT_FALSE_KEY).getByRole('button').first().click();
      await page.locator('#'+TEST_DEFAULT_FALSE_KEY).getByText('true', { exact: true }).first().click();
      await page.locator('#'+TEST_DEFAULT_FREETEXT_KEY).locator('input').fill("not hello");
      await page.getByRole('button', { name: 'Continue' }).click();
      await finishAndDownloadTXT(page);
  });

  test('test upgrade for Import pENM', async ({ page }) => {
      await setupDeploymentForPENM(page, 'downloads/pENM.txt', 'Upgrade');
      await stepCategory(page);
      await page.getByRole('button', { name: 'Autopopulate' }).last().click();
      await stepCategory(page);
      await fillCategoriesNoPasswords(page);
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export SED' }).click();
      const download = await downloadPromise;
      expect(download);
  });

  test('test upgrade for Import pENM when a field is invalid', async ({ page }) => {
      await setupDeploymentForPENM(page, 'downloads/pENM.txt', 'Upgrade');
      await stepCategory(page);
      await page.getByRole('button', { name: 'Autopopulate' }).nth(1).click();
      await stepCategory(page);
      await fillCategoryIpv4(page);
      
      // Make one field invalid
      await page.locator('#amos_vip_address').locator('input').fill("1::1");
      await stepCategory(page);
      await fillCategoryStorage(page);
      await stepCategory(page);
      await fillCategoryFallback(page);
      await stepCategory(page);
      await fillCategoryOtherNoPasswords(page);
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.locator('#header-name-display').first()).toContainText('Parameter Key');
      await expect(page.locator('#name-display').first()).toContainText(['amos_vip_address']);
      await expect(page.locator('#header-validation-column').first()).toContainText('Validation');
      await expect(page.locator('#validation-display').first()).toContainText('FAIL - Invalid value');
});

  test('test upgrade for Import pENM with Drag and Drop', async ({ page }) => {
    await uploadSedFileViaDragAndDropForPENM(page);
    await stepCategory(page);
    await page.getByRole('button', { name: 'Autopopulate' }).last().click();
    await stepCategory(page);
    await fillCategoriesForUpgradeWithImmutableParams(page);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export SED' }).click();
    const download = await downloadPromise;
    expect(download);
  });

  test('test upgrade for Import pENM, check IP excluded IP details are imported and displayed', async ({ page }) => {
      await uploadSedFileViaDragAndDropForPENM(page);
      await expect(page.locator('input#exclusion_ip_0')).toHaveValue('1.1.1.1');
      await expect(page.locator('input#exclusion_ip_1')).toHaveValue('1.1.1.2');
      await expect(page.locator('input#exclusion_description_0')).toHaveValue('some ip excluded');
      await expect(page.locator('input#exclusion_description_1')).toHaveValue('some other ip excluded');
  });

  test('test imported data column on preview details page', async ({ page }) => {
      await setupDeploymentForPENM(page, 'test/resources/pENM/pENM.txt', 'Upgrade');
      await page.locator('li:has-text("Preview and Export")').click();
      await expect(page.locator('#header-name-display').first()).toContainText('Parameter Key');
      await expect(page.locator('#name-display').first()).toContainText('amos_vip_address');
      await page.getByRole('button', { name: 'Show Variable Names' }).click();
      await expect(page.locator('#header-name-display').first()).toContainText('Parameter Name');
      await expect(page.locator('#name-display').first()).toContainText(['AMOS IPv4 Virtual IP']);
      await expect(page.locator('#import-display').first()).toContainText(['10.10.1.3']);
  });

  test('test tool behaves the same after loading the deployment setup multiple times', async ({ page }) => {
      await setupDeploymentForPENM(page, 'test/resources/pENM/extraLarge__production_IPv4-R1GK(for testing).txt', 'Upgrade');
      await stepCategory(page);
      await stepCategory(page);
      await expect(page.locator('#amos_vip_address').locator('input')).toBeEmpty();
      await expect(page.locator('#fm_vip_address').locator('input')).toBeEmpty();
      await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
      await page.locator('#amos_vip_address').locator('input').fill('2.2.10.10');
      await stepCategory(page);
      await expect(page.locator('#rwx_storageClass').locator('input')).toBeEmpty();
      await stepCategory(page);
      //Loading the deployment a second time
      await page.getByRole('link', { name: 'Deployment Setup' }).click();
      await page.getByRole('button', { name: 'Setup Deployment' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('link', { name: 'Site Details' }).click();
      await expect(page.locator('#fm_vip_address').locator('input')).toBeEmpty();
      await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
      await page.locator('#amos_vip_address').locator('input').fill('2.2.10.10');
      await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
      await stepCategory(page);
      //Loading the deployment a third time
      await page.getByRole('link', { name: 'Deployment Setup' }).click();
      await page.getByRole('button', { name: 'Setup Deployment' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByRole('link', { name: 'Site Details' }).click();
      await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
      await page.locator('#amos_vip_address').locator('input').fill('2.2.10.10');
      await expect(page.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  test('test Setup Deployment button should be disabled if no previous SED file is uploaded', async ({ page }) => {
    await page.goto("http://localhost:5003/#/deploymentsetup");
    await page.locator('div#dry-run').locator('.ball').click();
    await selectProduct(page, "Physical ENM");
    await selectUseCase(page, 'Upgrade');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await selectENMSize(page, "extraLarge");
    await selectENMSchema(page, "extraLarge IPv4");
    await page.locator('#upgrade label i').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('button', { name: 'Setup Deployment' })).toBeDisabled();
    await selectPopulateFromPreviousSED(page,'test/resources/pENM/pENM.txt');
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
  });

  test('test import and export for complex objects', async ({ page }, testInfo) => {
    var nodeSelectors = {
        key1: "value1",
        key2: "value2",
    };
    var sccResources = [
      "value1",
      "value2",
      "value3",
    ];
    var tolerations = [
      {
        key: "Key1",
        operator: "Exists",
        effect: "PreferNoSchedule",
        tolerationSeconds: "3",
      },
      {
        key: "Key2",
        operator: "Equal",
        value: "Value",
        effect: "NoSchedule",
      },
    ];

    await setupDeploymentForCENM(page, 'ipv4', 'extraLarge', 'Upgrade', 'test/resources/cENM/eric-enm-integration-extra-large-production-values-undefined.yaml');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Check NodeSelector imported values
    var nodeSelectorOpenBtn = page.locator('#nodeSelector').locator('#displayObjectDialog');
    await nodeSelectorOpenBtn.click();

    var row0 = await page.locator('#node_0');
    await expect(row0.locator('#nodeKey_0')).toHaveValue('key1');
    await expect(row0.locator('#nodeValue_0')).toHaveValue(nodeSelectors['key1']);

    var row1 = await page.locator('#node_1');
    await expect(row1.locator('#nodeKey_1')).toHaveValue('key2');
    await expect(row1.locator('#nodeValue_1')).toHaveValue(nodeSelectors['key2']);

    await page.locator('#closeBtn').click();

    // Check sccResources imported values
    var sccOpenBtn = page.locator('#sccResources').locator('#displayObjectDialog');
    await sccOpenBtn.click();

    await expect(page.locator('#entry_0').locator('#entry_val_0')).toHaveValue(sccResources[0]);
    await expect(page.locator('#entry_1').locator('#entry_val_1')).toHaveValue(sccResources[1]);
    await expect(page.locator('#entry_2').locator('#entry_val_2')).toHaveValue(sccResources[2]);
    await page.locator('#closeBtn').click();

    // Check tolerations imported values
    await page.getByRole('button', { name: 'Add Toleration' }).click();
    await expect(page.locator('#toleration-key-0').locator('input')).toHaveValue(tolerations[0].key);
    await expect(page.locator('#toleration-operator-0').getByRole('button', { name: tolerations[0].operator })).toBeVisible();
    await expect(page.locator('#toleration-value-0').locator('input')).toHaveValue('');
    await expect(page.locator('#toleration-effect-0').getByRole('button', { name: tolerations[0].effect })).toBeVisible();

    await expect(page.locator('#toleration-key-1').locator('input')).toHaveValue(tolerations[1].key);
    await expect(page.locator('#toleration-operator-1').getByRole('button', { name: tolerations[1].operator })).toBeVisible();
    await expect(page.locator('#toleration-value-1').locator('input')).toHaveValue(tolerations[1].value);
    await expect(page.locator('#toleration-effect-1').getByRole('button', { name: tolerations[1].effect })).toBeVisible();
    await page.locator('#closeTolerationBtn').click();

    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var downloadedFilePath = await finishAndDownloadWithValidationErrors(page);
    var resultData = fs.readFileSync(downloadedFilePath, 'utf8');
    var resultDataObject = yaml.load(resultData);
    await expect(resultDataObject.global.nodeSelector).toEqual(nodeSelectors);
    await expect(resultDataObject.global.tolerations).toEqual(tolerations);
    await expect(resultDataObject.global.sccResources).toEqual(sccResources);
  });
});