import {expect, test} from '@playwright/test';
import {
    createDeploymentSetupCloudNative, DEPLOYMENT_SETUP_URL,
    goToDeploymentSetup, selectProduct,
    setupDryRunIpv4Deployment,
    stepCategory
} from '../testUtils.js';


test('Test toleration - Add single toleration save and should see changes in preview table', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);

    await page.getByRole('button', { name: 'Add Toleration' }).click();

    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-0').locator('input').fill('key1');
    await page.locator('#toleration-operator-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-0').getByText('Equal', { exact: true }).click();
    await page.locator('#toleration-value-0').locator('input').fill('value1');
    await page.locator('#toleration-effect-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-0').getByText('NoSchedule', { exact: true }).click();
    await page.locator('#saveTolerationBtn').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    // Check Toleration on preview page
    const expectedJson = [{key: "key1", "operator": "Equal", "value": "value1", "effect": "NoSchedule"}];
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    const tolerationText = await page.locator('#other').locator('#tolerations').locator('#response-display').textContent();
    expect(JSON.parse(tolerationText)).toEqual(expectedJson);
});

test('Test toleration - Add multiple toleration save and should see changes in preview table', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);

    await page.getByRole('button', { name: 'Add Toleration' }).click();
    // Add 1st toleration
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-0').locator('input').fill('key1');
    await page.locator('#toleration-operator-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-0').getByText('Equal', { exact: true }).click();
    await page.locator('#toleration-value-0').locator('input').fill('value1');
    await page.locator('#toleration-effect-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-0').getByText('NoSchedule', { exact: true }).click();

    // test that values are displayed after closing and reopening the Add toleration dialog
    await page.locator('#saveTolerationBtn').click();
    await page.getByRole('button', { name: 'Add Toleration' }).click();
    expect(await page.locator('#toleration-key-0').locator('input').inputValue()).toEqual("key1");
    expect(await page.locator('#toleration-value-0').locator('input').inputValue()).toEqual("value1");
    expect(await page.locator('#toleration-effect-0').innerText()).toEqual("NoSchedule");
    expect(await page.locator('#toleration-operator-0').innerText()).toEqual("Equal");

    // Add 2nd toleration
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-1').locator('input').fill('key1');
    await page.locator('#toleration-operator-1').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-1').getByText('Equal', { exact: true }).click();
    await page.locator('#toleration-value-1').locator('input').fill('value1');
    await page.locator('#toleration-effect-1').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-1').getByText('NoSchedule', { exact: true }).click();

    // Add 3rd toleration
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-2').locator('input').fill('key3');
    await page.locator('#toleration-operator-2').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-2').getByText('Exists', { exact: true }).click();
    await page.locator('#toleration-effect-2').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-2').getByText('NoSchedule', { exact: true }).click();

    await page.locator('#delete-toleration-1').click(); // Delete the 2nd toleration
    await page.locator('#saveTolerationBtn').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    // Check Toleration on preview page
    const expectedJson = [
      {key: "key1", "operator": "Equal", "value": "value1", "effect": "NoSchedule"},
      {key: "key3", "operator": "Exists", "effect": "NoSchedule"}
    ];
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    const tolerationText = await page.locator('#other').locator('#tolerations').locator('#response-display').textContent();
    expect(JSON.parse(tolerationText)).toEqual(expectedJson);
});

test('Test toleration - Check toleration can not be saved if invalid or incomplete', async ({ page }) => {
    const expectedMessage = "Please ensure all Toleration(s) are correctly populated or deleted.";
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await page.getByRole('button', { name: 'Add Toleration' }).click();

    // No data populated
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#saveTolerationBtn').click();
    expect(await page.locator('.notification').first().locator('.description')).toHaveText(expectedMessage);
    await page.locator('.notification').first().locator('.top-row').locator('.icon-cross').click(); // close notification dialog

    // Invalid Key
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-0').locator('input').fill('key 1');
    await page.locator('#toleration-operator-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-0').getByText('Equal', { exact: true }).click();
    await page.locator('#toleration-value-0').locator('input').fill('value1');
    await page.locator('#toleration-effect-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-0').getByText('NoSchedule', { exact: true }).click();
    await page.locator('#saveTolerationBtn').click();
    expect(await page.locator('.notification').first().locator('.description')).toHaveText(expectedMessage);
    await page.locator('.notification').first().locator('.top-row').locator('.icon-cross').click(); // close notification dialog

    // No Operator specified
    await page.locator('#delete-toleration-0').click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-0').locator('input').fill('key1');
    await page.locator('#toleration-effect-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-0').getByText('NoSchedule', { exact: true }).click();
    await page.locator('#saveTolerationBtn').click();
    expect(await page.locator('.notification').first().locator('.description')).toHaveText(expectedMessage);
    expect(await page.locator('#toleration-value-0').locator('input')).toBeDisabled();
    await page.locator('.notification').first().locator('.top-row').locator('.icon-cross').click(); // close notification dialog

    // Invalid value
    await page.locator('#delete-toleration-0').click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-0').locator('input').fill('key1');
    await page.locator('#toleration-operator-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-0').getByText('Equal', { exact: true }).click();
    await page.locator('#toleration-value-0').locator('input').fill('value 1');
    await page.locator('#toleration-effect-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-0').getByText('NoSchedule', { exact: true }).click();
    await page.locator('#saveTolerationBtn').click();
    expect(await page.locator('.notification').first().locator('.description')).toHaveText(expectedMessage);
    await page.locator('.notification').first().locator('.top-row').locator('.icon-cross').click(); // close notification dialog


    // No Effect specified
    await page.locator('#delete-toleration-0').click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-0').locator('input').fill('key1');
    await page.locator('#toleration-operator-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-0').getByText('Equal', { exact: true }).click();
    await page.locator('#toleration-value-0').locator('input').fill('value1');
    await page.locator('#saveTolerationBtn').click();
    expect(await page.locator('.notification').first().locator('.description')).toHaveText(expectedMessage);
    await page.locator('.notification').first().locator('.top-row').locator('.icon-cross').click(); // close notification dialog
});

test('Test toleration immutability - All entries are disabled/readonly at upgrade', async ({ page }) => {
    await goToDeploymentSetup(page, DEPLOYMENT_SETUP_URL);
    await selectProduct(page, "Cloud Native ENM");
    await createDeploymentSetupCloudNative(page, 'Upgrade', 'test/resources/cENM/cENM_fully_populated.yaml');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);

    await page.getByRole('button', { name: 'Add Toleration' }).click();

    expect (await isInputReadOnly(page, 'toleration-key-0')).toBe(true);
    expect(await page.locator('#toleration-operator-0').getByRole('button')).toBe.disabled;
    expect (await isInputReadOnly(page, 'toleration-value-0')).toBe(true);
    expect(await page.locator('#toleration-effect-0').getByRole('button')).toBe.disabled;
    expect(await page.locator('#saveTolerationBtn')).toBe.disabled;
    expect(page.locator('#addTolerationBtn')).toBe.disabled;
});

async function isInputReadOnly(page, tdId) {
    return await page.$eval(`td#${tdId} input`, input => input.readOnly);
}