import { test, expect } from '@playwright/test';
import {
    setupDryRunIpv4Deployment, stepCategory, setupDeploymentForCENM
} from '../testUtils.js';


test('Test schedules - Add single schedules save and should see changes in preview table', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);

    await page.getByRole('button', { name: 'Add Backup Scheduling Schedules' }).click();

    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-every-0').fill('2d10m');
    await page.locator('#objectArray-input-start-0').fill('2024-01-25T12:00:00');
    await page.locator('#objectArray-input-stop-0').fill('2025-01-24T12:00:00');
    await page.locator('#saveBtn').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    // Check Schedule on preview page
    const expectedJson = [{every: "2d10m", start: "2024-01-25T12:00:00", stop:"2025-01-24T12:00:00"}];
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    const scheduleText = await page.locator('#other').locator('#backup_scheduling_schedules').locator('#response-display').textContent();
    expect(JSON.parse(scheduleText)).toEqual(expectedJson);
});

test('Test schedule - Add multiple schedule save and should see changes in preview table', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);

    await page.getByRole('button', { name: 'Add Backup Scheduling Schedules' }).click();
    // Add 1st schedule
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-every-0').fill('2d10m');
    await page.locator('#objectArray-input-start-0').fill('2024-01-25T12:00:00');
    await page.locator('#objectArray-input-stop-0').fill('2025-01-24T12:00:00');

    // test that values are displayed after closing and reopening the Add schedule dialog
    await page.locator('#saveBtn').click();
    await page.getByRole('button', { name: 'Add Backup Scheduling Schedules' }).click();
    expect(await page.locator('#objectArray-input-every-0').inputValue()).toEqual("2d10m");
    expect(await page.locator('#objectArray-input-start-0').inputValue()).toEqual("2024-01-25T12:00:00");
    expect(await page.locator('#objectArray-input-stop-0').inputValue()).toEqual("2025-01-24T12:00:00");

    // Add 2nd schedule
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-every-1').fill('10m');
    await page.locator('#objectArray-input-start-1').fill('2024-01-21T02:00:00');
    await page.locator('#objectArray-input-stop-1').fill('2025-01-19T10:00:00');

    // Add 3rd schedule
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-every-2').fill('1w2d');
    await page.locator('#objectArray-input-start-2').fill('2024-03-21T02:00:00');
    await page.locator('#objectArray-input-stop-2').fill('2025-03-19T10:00:00');

    await page.locator('#delete-object-array-1').click(); // Delete the 2nd schedule
    await page.locator('#saveBtn').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    // Check Schedules on preview page
    const expectedJson = [
      {every: "2d10m", start: "2024-01-25T12:00:00", stop:"2025-01-24T12:00:00"},
      {every: "1w2d", start: "2024-03-21T02:00:00", stop:"2025-03-19T10:00:00"}
    ];
    await page.getByRole('link', { name: 'Preview and Export' }).click();
    const scheduleText = await page.locator('#other').locator('#backup_scheduling_schedules').locator('#response-display').textContent();
    expect(JSON.parse(scheduleText)).toEqual(expectedJson);
});

test('Test add invalid schedules, save and should not save and see changes in component and preview', async ({ page }) => {
    await setupDryRunIpv4Deployment(page);
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    const expectedMessage = "WarningPlease ensure all required fields are correctly populated";

    await page.getByRole('button', { name: 'Add Backup Scheduling Schedules' }).click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#saveBtn').click();
    let notificationBanner = await page.locator('.notification').first();
    await expect(notificationBanner).toHaveText(expectedMessage);

    // Invalid Entry
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-every-0').fill('');
    await page.locator('#saveBtn').click();
    notificationBanner = await page.locator('.notification').first();
    await expect(notificationBanner).toHaveText(expectedMessage);
});

test('Test source_label array input, save should be allowed with valid entries', async ({ page }) => {
    const expectedMessage = "SuccessEntries have been saved";
    await setupDeploymentForCENM(page, 'ipv4', 'extraLarge', 'Upgrade', 'test/resources/cENM/cENM_fully_populated.yaml');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await page.locator('.top-row > i').click();
    await page.getByRole('button', { name: 'Add PM server external remote' }).click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-source_labels-1').fill('test');
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-source_labels-2').fill('qbc,123,123\n123');
    await page.getByRole('button', { name: 'Save' }).click();
    let notificationBanner = await page.locator('.notification').first();
    await expect(notificationBanner).toHaveText(expectedMessage);
    await page.getByRole('button', { name: 'Add PM server external remote' }).click();
    const text = await page.$eval('#objectArray-input-source_labels-1', textarea => textarea.value);
    await expect(text).toBe('test');
});

test('Test source_label array input, save should not be allowed with invalid entries', async ({ page }) => {
    const expectedMessage = "WarningPlease ensure all required fields are correctly populated";
    await setupDeploymentForCENM(page, 'ipv4', 'extraLarge', 'Upgrade', 'test/resources/cENM/cENM_fully_populated.yaml');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await page.locator('.top-row > i').click();
    await page.getByRole('button', { name: 'Add PM server external remote' }).click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-source_labels-1').fill('qbc');
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-source_labels-2').fill('qbc,12 3,123\n123');
    await page.getByRole('button', { name: 'Save' }).click();
    let notificationBanner = await page.locator('.notification').first();
    await expect(notificationBanner).toHaveText(expectedMessage);
});

test('Test source_label array imported correctly from state', async ({ page }) => {
    const expectedMessage = "SuccessEntries have been saved";
    await setupDeploymentForCENM(page, 'ipv4', 'extraLarge', 'Upgrade', 'test/resources/cENM/cENM_fully_populated.yaml');
    await page.getByRole('link', { name: 'Site Details' }).click();
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await stepCategory(page);
    await page.locator('.top-row > i').click();
    await page.getByRole('button', { name: 'Add PM server external remote' }).click();
    const text = await page.$eval('#objectArray-input-source_labels-0', textarea => textarea.value);
    await expect(text).toBe('test,test');
});
