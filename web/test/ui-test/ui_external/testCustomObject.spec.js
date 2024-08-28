import { expect, test } from '@playwright/test';
import {
    selectUseCase,
    DEPLOYMENT_SETUP_URL,
    selectIpVersion,
    goToDeploymentSetup,
    selectProduct,
    selectReleaseVersion,
    stepCategory,
    selectReleaseNumber,
    selectENMSize,
    selectPopulateFromPreviousSED
} from '../testUtils.js';

async function skipCategoriestoIngressNX(page) {
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
}

async function prepareCENMDeployment(page, product, useCase, version, size, uploadFilePath) {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, product);
    await selectUseCase(page, useCase);
    await selectReleaseNumber(page);
    await selectReleaseVersion(page);
    await selectIpVersion(page, version);
    await selectENMSize(page, size);
    if (useCase === 'Upgrade'){
        await selectPopulateFromPreviousSED(page, uploadFilePath);
        await page.getByRole('button', { name: 'Confirm' }).click();
    } else {
        await page.locator('#upgrade label i').click();
    }
    await page.getByRole('button', { name: 'Setup Deployment' }).click();
    await  skipCategoriestoIngressNX(page);
}

test('Test custom Object behaviour - Should allow to add annotations using customObject', async ({ page }) => {
    //Creating setup deployment to add annotation
    await prepareCENMDeployment(page, "Cloud Native ENM", "Install", "Dual", "small");
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#noRec')).toBeVisible();

    //Add a row and input data, save and check that data is preserved
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_0').fill('key1');
    await page.locator('#objectValue_0').fill('value1');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#objectKey_0')).toBeVisible();
    await expect(page.locator('#objectValue_0')).toBeVisible();
    await expect(page.locator('#noRec')).not.toBeVisible();
});

test('Test custom Object behaviour - Should not allow to add rows with empty or invalid inputs', async ({ page }) => {
    //Creating setup deployment to add annotation
    await prepareCENMDeployment(page, "Cloud Native ENM", "Install", "dual", "small");
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#noRec')).toBeVisible();

    //Add a row and input data, add a second row, leave inputs empty and trying to add new row should not be allowed
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_0').fill('key1');
    await page.locator('#objectValue_0').fill('value1');
    await page.getByRole('button', { name: 'Add entry' }).click();
    await expect(page.locator('#objectKey_1')).toBeVisible();
    await expect(page.locator('#objectValue_1')).toBeVisible();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await expect(page.getByText("Please ensure all required fields are correctly populated")).toBeVisible({ timeout: 3000 });
    await page.locator('.top-row > i').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText("Please ensure all required fields are correctly populated")).toBeVisible({ timeout: 3000 });
    await page.locator('.top-row > i').click();
    //Add on second row, invalid inputs and trying to add new row should not be allowed
    await page.locator('#objectKey_1').fill('key 2');
    await page.locator('#objectValue_1').fill('value2');
    await page.getByRole('button', { name: 'Add entry' }).click();
    await expect(page.getByText("Please ensure all required fields are correctly populated")).toBeVisible({ timeout: 3000 });
    await page.locator('.top-row > i').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText("Please ensure all required fields are correctly populated")).toBeVisible({ timeout: 3000 });
});

test('Test custom Object behaviour - Should display error message when adding duplicated keys', async ({ page }) => {
    //Creating setup deployment to add annotation
    await prepareCENMDeployment(page, "Cloud Native ENM", "Install", "dual", "small");
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#noRec')).toBeVisible();

    //Add a row and input data, add a second row, with duplicated key
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_0').fill('key1');
    await page.locator('#objectValue_0').fill('value1');
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_1').fill('key1');
    await expect(page.locator('#objectKey_1')).toBeVisible();
    await expect(page.locator('#object_1').getByText('Duplicated key')).toBeVisible();
    await page.locator('#delete_1').click();
    await expect(page.locator('#object_1')).not.toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#object_1')).not.toBeVisible();
});

test('Test custom Object behaviour - Should allow to delete customObject', async ({ page }) => {
    //Creating setup deployment to add annotation
    await prepareCENMDeployment(page, "Cloud Native ENM", "Install", "dual", "small");
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#noRec')).toBeVisible();

    //Add a row and input data, save and check that data is preserved
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_0').fill('key1');
    await page.locator('#objectValue_0').fill('value1');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#objectKey_0')).toBeVisible();
    await expect(page.locator('#objectValue_0')).toBeVisible();

    //Deleting entry
    await page.locator('#delete_0').click();
    await expect(page.locator('#object_0')).not.toBeVisible();
    await expect(page.locator('#noRec')).toBeVisible();
});

test('Test custom Object behaviour - Adding and saving customObjects should sync changes in preview table', async ({ page }) => {
   //Creating setup deployment to add annotation
    await prepareCENMDeployment(page, "Cloud Native ENM", "Install", "dual", "small");
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#noRec')).toBeVisible();

    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_0').fill('key1');
    await page.locator('#objectValue_0').fill('value1');
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_1').fill('key2');
    await page.locator('#objectValue_1').fill('value2');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('#object_0')).toBeVisible();
    await expect(page.locator('#object_1')).toBeVisible();
    await page.locator('#closeBtn').click();
    await page.getByRole('link', { name: 'Preview and Export' }).click();

    // Check customObject on preview page
    const expectedJson = {
      "key1": "value1",
      "key2": "value2"
    };
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    const customObjectText = await page.locator('#annotations').locator('#response-display').textContent();
    expect(JSON.parse(customObjectText)).toEqual(expectedJson);
});

test('Test custom Object behaviour - When importing form previous SED file, customObjects should be displayed correctly', async ({ page }) => {
    await prepareCENMDeployment(page, "Cloud Native ENM", "Upgrade", "dual", "small", 'test/resources/cENM/cENM_Small_dual.yaml');
    await page.getByRole('button', { name: 'Add Ingress NX annotations' }).click();
    await expect(page.locator('input#objectKey_0')).toHaveValue('metallb.universe.tf/loadBalancerIPs');
    await expect(page.locator('input#objectValue_0')).toHaveValue('10.150.57.119,2001:1b70:82b9:016c:0000:0000:0000:001b');
 });