import { test, expect } from '@playwright/test';
import {
    setupDryRunIpv4Deployment,
    stepCategory, fillCategory
} from '../testUtils.js';

test('Test add array entry, save and should see changes in component and preview table', async ({ page }) => {
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

    // Open arrayDialog
    var openBtn = page.locator('#sccResources').locator('#displayObjectDialog');
    await openBtn.click();
    expect(page.locator('#noRec')).toHaveText('No record.');

    await page.locator('#addBtn').click();

    var row1 = await page.locator('#entry_0');
    expect(row1.locator('#entry_val_0')).toHaveValue('');

    // Check no invalid message
    var entryError = row1.locator('#invalid_entry_error');
    expect(entryError).not.toBeVisible();

    // Fill first row
    var newVal = 'val1';
    var arrVal = await row1.locator('#entry_val_0');
    await arrVal.fill(newVal);

    // Fill second row
    await page.locator('#addBtn').click();

    var newVal2 = 'val2';
    var arrVal2 = await page.locator('#entry_val_1');
    await arrVal2.fill(newVal2);

    // Save
    await page.locator('#saveBtn').click();

    // Check success notification banner
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toHaveText("SuccessEntries have been saved");

    await openBtn.click();

    expect(arrVal).toHaveValue(newVal);
    expect(arrVal2).toHaveValue(newVal2);

    await page.locator('#closeBtn').click();

    // Check entries on preview page
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#sccResources').locator('#response-display')).toHaveText('[ "val1", "val2" ]');
});

test('Test add invalid entry to ArrayDialog, save and should not save and see changes in component and preview', async ({ page }) => {
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

    // Open arrayDialog
    var openBtn = page.locator('#sccResources').locator('#displayObjectDialog');
    await openBtn.click();

    await page.locator('#addBtn').click();

    var row1 = await page.locator('#entry_0');
    var entry = await row1.locator('#entry_val_0');

    // Check no invalid message when a new row is added
    var valError = row1.locator('#invalid_entry_error');
    expect(valError).not.toBeVisible();

    await entry.fill("val");

    // Remove the value
    await entry.fill("");

    // Try adding new entry row shows error
    await page.locator('#addBtn').click();

    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toHaveText("WarningFill in empty entry before adding another");
    await notificationBanner.locator('.top-row > i').click();

    // Add invalid value
    await entry.fill("invalid val");

    // Try saving entries changes shows error
    await page.locator('#saveBtn').click();
    expect(notificationBanner).toHaveText("WarningPlease ensure all required fields are correctly populated");
    await notificationBanner.locator('.top-row > i').click();

    // Close the dialog without saving
    await page.locator('#closeBtn').click();

    // Check array entry on preview page
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#sccResources').locator('#response-display')).toHaveText("");
});

test('Test add duplicate entries, save and should not save and see changes in component and preview', async ({ page }) => {
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

    // Open arrayDialog
    var openBtn = page.locator('#sccResources').locator('#displayObjectDialog');
    await openBtn.click();

    // First row
    await page.locator('#addBtn').click();

    var row1 = await page.locator('#entry_0');
    var entry1 = await row1.locator('#entry_val_0');

    // Check no invalid message when a new row is added
    var valError = row1.locator('#invalid_entry_error');
    expect(valError).not.toBeVisible();

    await entry1.fill("dup1");

    // Check no invalid message when a new row is added
    var valErrorR1 = row1.locator('#invalid_entry_error');
    var duplicateErrorR1 = row1.locator('#duplicate_entry_error');
    expect(valErrorR1).not.toBeVisible();
    expect(duplicateErrorR1).not.toBeVisible();

    // Second row
    await page.locator('#addBtn').click();

    var row2 = await page.locator('#entry_1');
    var entry2 = await row2.locator('#entry_val_1');

    // Check no invalid message when a new row is added
    var valErrorR2 = row2.locator('#invalid_entry_error');
    var duplicateErrorR2 = row2.locator('#duplicate_entry_error');
    expect(valErrorR2).not.toBeVisible();
    expect(duplicateErrorR2).not.toBeVisible();

    await entry2.fill("dup1");

    // Duplicate message show on both entry
    expect(duplicateErrorR1).toHaveText("Duplicate entry");
    expect(duplicateErrorR2).toHaveText("Duplicate entry");

    // Try saving entries changes shows error
    await page.locator('#saveBtn').click();

    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toHaveText("WarningPlease ensure all required fields are correctly populated");
    await notificationBanner.locator('.top-row > i').click();

    await page.locator('#closeBtn').click();

    // Check entries on preview page
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#sccResources').locator('#response-display')).toHaveText("");
});

test('test delete and save array value, should see the changes in component and preview table ', async ({ page }) => {
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

    // Open arrayDialog
    var openBtn = page.locator('#sccResources').locator('#displayObjectDialog');
    await openBtn.click();

    // First row
    await page.locator('#addBtn').click();

    var row1 = await page.locator('#entry_0');
    var entry1 = await row1.locator('#entry_val_0');
    await entry1.fill("val1");

    // Second row
    await page.locator('#addBtn').click();

    var row2 = await page.locator('#entry_1');
    var entry2 = await row2.locator('#entry_val_1');
    await entry2.fill("val2");

    // Save values
    await page.locator('#saveBtn').click();

    // Open array dialog and see the saved changes
    await openBtn.click();;
    expect(entry1).toHaveValue("val1")
    expect(entry2).toHaveValue("val2");
    expect(await trs.count()).toBe(3);

    // Remove first row
    await row1.locator('#delete_0').click();
    expect(await trs.count()).toBe(2);

    // Save entry
    await page.locator('#saveBtn').click();

    // Open array dialog and see the saved changes
    await openBtn.click();
    expect(await trs.count()).toBe(2);
    await expect(await trs.nth(1).locator('#entry_val_0')).toHaveValue("val2")

    // Check entries on preview page
    await page.locator('#closeBtn').click();
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    var otherCat = await page.locator('#other');
    await expect(otherCat.locator('#sccResources').locator('#response-display')).toHaveText('[ "val2" ]');
});