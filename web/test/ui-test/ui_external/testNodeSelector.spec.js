import { test, expect } from '@playwright/test';
import {
    setupDryRunIpv4Deployment,
    stepCategory, fillCategory
} from '../testUtils.js';


test('Test add nodeSelector, save and should see changes in component and preview table', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategory(page);
    await page.locator('#sfs_console_IP').locator('input').fill("10.11.12.113");
    await page.locator('#san_spaIP').locator('input').fill("10.11.12.113");
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);

    // Open nodeSelector
    var openBtn = page.locator('#nodeSelector').locator('#displayObjectDialog');
    await openBtn.click();
    expect(page.locator('#noRec')).toHaveText('No record.');

    await page.locator('#addBtn').click();

    var row1 = await page.locator('#node_0');
    expect(row1.locator('#nodeKey_0')).toHaveValue('');
    expect(row1.locator('#nodeValue_0')).toHaveValue('');

    // Check no invalid message
    var keyError = row1.locator('#invalid_node_key_error');
    var valueError = row1.locator('#invalid_node_key_error');
    expect(keyError).not.toBeVisible();
    expect(valueError).not.toBeVisible();

    // Fill first nodeSelector
    var newKey = 'key1';
    var newVal = 'val1';
    var nodeKey = await row1.locator('#nodeKey_0');
    var nodeValue = await row1.locator('#nodeValue_0');
    await nodeKey.fill(newKey);
    await nodeValue.fill(newVal);

    // Fill second nodeSelector
    await page.locator('#addBtn').click();

    var newKey2 = 'key2';
    var newVal2 = 'val1';
    var row2 = await page.locator('#node_1');
    var nodeKey2 = await row2.locator('#nodeKey_1');
    var nodeValue2 = await row2.locator('#nodeValue_1');
    await nodeKey2.fill(newKey2);
    await nodeValue2.fill(newVal2);

    // Save nodeSelectors
    await page.locator('#saveBtn').click();

    // Check success notification banner
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toHaveText("SuccessEntries have been saved");
    await notificationBanner.locator('.top-row > i').click();

    await openBtn.click();

    expect(nodeKey).toHaveValue(newKey);
    expect(nodeValue).toHaveValue(newVal);

    await page.locator('#closeBtn').click();

    // Check node Selector on preview page
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#nodeSelector').locator('#response-display')).toHaveText('{ "key1": "val1", "key2": "val1" }');
});

test('Test add invalid nodeSelector, save and should not save and see changes in component and preview', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategory(page);
    await page.locator('#sfs_console_IP').locator('input').fill("10.11.12.113");
    await page.locator('#san_spaIP').locator('input').fill("10.11.12.113");
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);

    // Open nodeSelector
    var openBtn = page.locator('#nodeSelector').locator('#displayObjectDialog');
    await openBtn.click();

    await page.locator('#addBtn').click();

    var row1 = await page.locator('#node_0');
    var nodeKey = await row1.locator('#nodeKey_0');
    var nodeValue = await row1.locator('#nodeValue_0');

    // Check no invalid message when a new row is added
    var keyError = row1.locator('#invalid_node_key_error');
    var valueError = row1.locator('#invalid_node_key_error');
    expect(keyError).not.toBeVisible();
    expect(valueError).not.toBeVisible();

    await nodeKey.fill("key");
    await nodeValue.fill("value");

    // Check invalid message when the value is being removed
    await nodeKey.fill("");
    expect((await keyError.textContent()).length).toBeGreaterThan(0);

    // Try adding new node selector row shows error
    await page.locator('#addBtn').click();
    
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toHaveText("WarningFill in empty entry values before adding another");
    await notificationBanner.locator('.top-row > i').click();

    // Try saving node selector changes shows error
    await page.locator('#saveBtn').click();
    expect(notificationBanner).toHaveText("WarningPlease ensure all required fields are correctly populated");
    await notificationBanner.locator('.top-row > i').click();

    await nodeValue.fill("");
    expect((await valueError.textContent()).length).toBeGreaterThan(0);

    // Try adding new node selector row shows error
    await page.locator('#addBtn').click();

    notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toHaveText("WarningFill in empty entry values before adding another");
    await notificationBanner.locator('.top-row > i').click();

    // Try saving node selector changes shows error
    await page.locator('#saveBtn').click();
    expect(notificationBanner).toHaveText("WarningPlease ensure all required fields are correctly populated");
    await notificationBanner.locator('.top-row > i').click();

    // to remove
    await page.locator('#closeBtn').click();

    // Check node Selector on preview page
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#nodeSelector').locator('#response-display')).toHaveText("");
});

test('Test add duplicate nodeSelector, save and should not save and see changes in component and preview', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategory(page);
    await page.locator('#sfs_console_IP').locator('input').fill("10.11.12.113");
    await page.locator('#san_spaIP').locator('input').fill("10.11.12.113");
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);

    // Open nodeSelector
    var openBtn = page.locator('#nodeSelector').locator('#displayObjectDialog');
    await openBtn.click();

    // First row
    await page.locator('#addBtn').click();

    var row1 = await page.locator('#node_0');
    var nodeKey = await row1.locator('#nodeKey_0');
    var nodeValue = await row1.locator('#nodeValue_0');

    // Check no invalid message when a new row is added
    var keyErrorR1 = row1.locator('#invalid_node_key_error');
    var valueErrorR1 = row1.locator('#invalid_node_key_error');
    var duplicateErrorR1 = row1.locator('#duplicate_entry_error');
    expect(keyErrorR1).not.toBeVisible();
    expect(valueErrorR1).not.toBeVisible();
    expect(duplicateErrorR1).not.toBeVisible();

    await nodeKey.fill("key");
    await nodeValue.fill("value");

    // Second row
    await page.locator('#addBtn').click();

    var row2 = await page.locator('#node_1');
    var nodeKey2 = await row2.locator('#nodeKey_1');
    var nodeValue2 = await row2.locator('#nodeValue_1');

    // Check no invalid message when a new row is added
    var keyErrorR2 = row2.locator('#invalid_node_key_error');
    var valueErrorR2 = row2.locator('#invalid_node_key_error');
    var duplicateErrorR2 = row2.locator('#duplicate_entry_error');
    expect(keyErrorR2).not.toBeVisible();
    expect(valueErrorR2).not.toBeVisible();
    expect(duplicateErrorR2).not.toBeVisible();

    await nodeKey2.fill("key");
    await nodeValue2.fill("value");

    // Duplicate message show on both entry
    expect(duplicateErrorR1).toHaveText("Duplicate nodeKey");
    expect(duplicateErrorR2).toHaveText("Duplicate nodeKey");

    // Try saving node selector changes shows error
    await page.locator('#saveBtn').click();

    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toHaveText("WarningPlease ensure all required fields are correctly populated");
    await notificationBanner.locator('.top-row > i').click();

    await page.locator('#closeBtn').click();

    // Check node Selector on preview page
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#nodeSelector').locator('#response-display')).toHaveText("");
});

test('test delete and save nodeSelector, should see the changes in component and preview table ', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await fillCategory(page);
    await page.locator('#sfs_console_IP').locator('input').fill("10.11.12.113");
    await page.locator('#san_spaIP').locator('input').fill("10.11.12.113");
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);
    await fillCategory(page);
    await stepCategory(page);

    var table = await page.locator('#entryTable');
    var trs = await table.locator('tr');

    // Open nodeSelector
    var openBtn = page.locator('#nodeSelector').locator('#displayObjectDialog');
    await openBtn.click();

    // First row
    await page.locator('#addBtn').click();

    var row1 = await page.locator('#node_0');
    var nodeKey = await row1.locator('#nodeKey_0');
    var nodeValue = await row1.locator('#nodeValue_0');
    await nodeKey.fill("key");
    await nodeValue.fill("value");

    // Second row
    await page.locator('#addBtn').click();

    var row2 = await page.locator('#node_1');
    var nodeKey2 = await row2.locator('#nodeKey_1');
    var nodeValue2 = await row2.locator('#nodeValue_1');

    // Check no invalid message when a new row is added
    var keyErrorR2 = row2.locator('#invalid_node_key_error');
    var valueErrorR2 = row2.locator('#invalid_node_key_error');
    var duplicateErrorR2 = row2.locator('#validation-error-message');
    expect(keyErrorR2).not.toBeVisible();
    expect(valueErrorR2).not.toBeVisible();
    expect(duplicateErrorR2).not.toBeVisible();

    await nodeKey2.fill("key1");
    await nodeValue2.fill("value1");

    // Save nodeSelectors
    await page.locator('#saveBtn').click();

    // Open nodeSelectors and see the saved changes
    await openBtn.click();;
    expect(nodeKey).toHaveValue("key")
    expect(nodeValue).toHaveValue("value");
    expect(nodeKey2).toHaveValue("key1");
    expect(nodeValue2).toHaveValue("value1");
    expect(await trs.count()).toBe(3);

    // Remove first nodeSelector
    await row1.locator('#delete_0').click();
    expect(await trs.count()).toBe(2);

    // Save nodeSelectors
    await page.locator('#saveBtn').click();

    // Open nodeSelectors and see the saved changes
    await openBtn.click();
    expect(await trs.count()).toBe(2);
    expect(await trs.nth(1).locator('#nodeKey_0')).toHaveValue("key1")
    expect(await trs.nth(1).locator('#nodeValue_0')).toHaveValue("value1")

    // Check node Selector on preview page
    await page.locator('#closeBtn').click();
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#nodeSelector').locator('#response-display')).toHaveText('{ "key1": "value1" }');
});