import yaml from 'js-yaml';
export { yaml };
import path from 'path';
export { path };
import downloadsFolder from 'downloads-folder';
export { downloadsFolder };
import { expect } from '@playwright/test';
import {
    stepCategory,
    finishAndDownload
} from '../ui-test/testUtils';

export async function fillExcludeIPs(page){
    await page.locator('#exclusion_ip_0').fill("1.1.1.1");
    await page.locator('#exclusion_description_0').fill("some ip excluded");
    await stepCategory(page);
}

export async function fillExcludeIPsPreserved(page){
    await expect(page.locator('#exclusion_ip_0')).toHaveValue('1.1.1.1');
    await expect(page.locator('#exclusion_description_0')).toHaveValue('some ip excluded');
    await page.locator('#exclusion_ip_0').fill("1.1.1.0");
    await page.getByRole('button', { name: 'Add IP address' }).click();
    await page.locator('#exclusion_ip_1').fill("1.1.1.2");
    await page.locator('#exclusion_description_1').fill("some other ip excluded");
    await stepCategory(page);
}

export async function fillAutoPopulatePENM(page) {
    await page.locator('#jgroups_ipaddress_start_input').fill("10.53.16.0");
    await page.locator('#jgroups_ipaddress_end_input').fill("10.53.16.14");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(0).click();
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toBeVisible();;
    await page.locator('#backup_ipaddress_start_input').fill("10.53.19.0");
    await page.locator('#backup_ipaddress_end_input').fill("10.53.19.14");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(1).click();
    await page.locator('#internal_ipaddress_start_input').fill("10.53.17.0");
    await page.locator('#internal_ipaddress_end_input').fill("10.53.17.199");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(2).click();
    await page.locator('#storage_ipaddress_start_input').fill("10.53.15.2");
    await page.locator('#storage_ipaddress_end_input').fill("10.53.15.60");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(3).click();
    await page.locator('#ipv6address_ipaddress_start_input').fill("2001:1b70:8298:4406:0000:0000:0000:0000/64");
    await page.locator('#ipv6address_ipaddress_end_input').fill("2001:1b70:8298:4406:0000:0000:0000:00ff/64");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(4).click();
    await stepCategory(page);
}

export async function checkAutoPopulatePENM(page) {
    await expect(page.locator('#jgroups_ipaddress_start_input')).toHaveValue('10.53.16.0');
    await expect(page.locator('#jgroups_ipaddress_end_input')).toHaveValue('10.53.16.14');
    await page.getByRole('button', { name: 'Autopopulate' }).nth(0).click();
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toBeVisible();
    await page.locator('#backup_ipaddress_start_input').fill("10.53.19.15");
    await page.locator('#backup_ipaddress_end_input').fill("10.53.19.29");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(1).click();
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toBeVisible();
    await page.getByRole('button', { name: 'Autopopulate' }).nth(2).click();
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toBeVisible();
    await page.locator('#storage_ipaddress_start_input').fill("10.53.15.2");
    await page.locator('#storage_ipaddress_end_input').fill("10.53.15.60");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(3).click();
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toBeVisible();
    await page.locator('#ipv6address_ipaddress_start_input').fill("2001:1b70:8298:4406:0000:0000:0000:0000/64");
    await page.locator('#ipv6address_ipaddress_end_input').fill("2001:1b70:8298:4406:0000:0000:0000:00ff/64");
    await page.getByRole('button', { name: 'Autopopulate' }).nth(4).click();
    var notificationBanner = await page.locator('.notification').first();
    expect(notificationBanner).toBeVisible();
    await stepCategory(page);
}

export async function finishAndDownloadAfterFixingErrors(page) {
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('#show_errors_button').click();
    await expect(page.locator('#enmVlans')).toBeVisible();
    let validationDisplayDivs = await page.$$('#validation-display');
    expect(validationDisplayDivs.length).toBe(1);
    for (const div of validationDisplayDivs) {
      const textContent = await div.textContent();
      expect(textContent).toContain('FAIL -');
    }
    await page.getByRole('button', { name: 'Export SED' }).click();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByText('2. ENM Vlans').click();
    await page.locator('#storage_gateway').locator('input').fill('10.59.134.1');
    await page.locator('li:has-text("Preview and Export")').click();
    await expect(page.getByText('No data to display')).toBeVisible();
    await finishAndDownload(page);
}