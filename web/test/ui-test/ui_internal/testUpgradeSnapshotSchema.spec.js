import { test, expect } from '@playwright/test';
import {
  goToDeploymentSetup,
  selectReleaseVersion,
  selectIpVersion,
  toggleUploadSchemaFromFileSwitch,
  uploadSchemaFileViaDragAndDrop,
  selectUseCase,
  selectProduct,
  selectSprintNumber,
  selectENMSize,
  toggleUploadIntegrationValuesFromFileSwitch,
  uploadBaseYamlFileViaDragAndDrop
} from '../testUtils.js';

test.describe('test upload snapshot schema', async () => {
  test.describe.configure({ mode: 'serial' });

  test('test upload of schema file for pENM', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await selectProduct(page, "Physical ENM");
    await selectUseCase(page, 'Install');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await toggleUploadSchemaFromFileSwitch(page);
    await uploadSchemaFileViaDragAndDrop(page);
    await expect(page.locator('#file-name')).toHaveText("File Name: ui_test_schema.json");
    await page.locator('div.dropdown:has-text("Populate from previous SED")').locator('.ball').click();
    const button = await page.waitForSelector('button:has-text("Setup Deployment")');
    expect(await button.isDisabled()).toBe(false);
  });

  test('test upload of schema file for cENM', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await selectProduct(page, "Cloud Native ENM");
    await selectUseCase(page, 'Install');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await toggleUploadSchemaFromFileSwitch(page);
    await uploadSchemaFileViaDragAndDrop(page);
    await selectENMSize(page, "extraLarge");
    await expect(page.locator('#file-name')).toHaveText("File Name: ui_test_schema.json");
    await page.locator('div.dropdown:has-text("Populate from previous SED")').locator('.ball').click();
    const button = await page.waitForSelector('button:has-text("Setup Deployment")');
    expect(await button.isDisabled()).toBe(false);
  });

  test('test missing upload of schema file for cENM', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await selectProduct(page, "Cloud Native ENM");
    await selectUseCase(page, 'Install');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await toggleUploadSchemaFromFileSwitch(page);
    await selectENMSize(page, "extraLarge");
    await page.locator('div.dropdown:has-text("Populate from previous SED")').locator('.ball').click();
    const button = await page.waitForSelector('button:has-text("Setup Deployment")');
    expect(await button.isDisabled()).toBe(true);
  });

  test('test upload of yaml base file for cENM', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await selectProduct(page, "Cloud Native ENM");
    await selectUseCase(page, 'Install');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await toggleUploadSchemaFromFileSwitch(page);
    await uploadSchemaFileViaDragAndDrop(page);
    await toggleUploadIntegrationValuesFromFileSwitch(page);
    await uploadBaseYamlFileViaDragAndDrop(page);
    await selectENMSize(page, "extraLarge");
    await page.locator('div.dropdown:has-text("Populate from previous SED")').locator('.ball').click();
    const button = await page.waitForSelector('button:has-text("Setup Deployment")');
    expect(await button.isDisabled()).toBe(false);
  });

  test('test missing upload of yaml base file for cENM', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await selectProduct(page, "Cloud Native ENM");
    await selectUseCase(page, 'Install');
    await selectSprintNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, "ipv4");
    await toggleUploadSchemaFromFileSwitch(page);
    await uploadSchemaFileViaDragAndDrop(page);
    await toggleUploadIntegrationValuesFromFileSwitch(page);
    await selectENMSize(page, "extraLarge");
    await page.locator('div.dropdown:has-text("Populate from previous SED")').locator('.ball').click();
    const button = await page.waitForSelector('button:has-text("Setup Deployment")');
    expect(await button.isDisabled()).toBe(true);
  });
});