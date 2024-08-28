import { test, expect } from '@playwright/test';
import {
  goToDeploymentSetup,
  selectDropdownById,
  selectProduct
} from "../testUtils.js";

test('test field array, options change can display properly', async ({ page }) => {
    await goToDeploymentSetup(page, "http://localhost:5003/#/deploymentsetup");
    await page.goto("http://localhost:5003#/compare");
    await selectProduct(page, 'Physical ENM');
    await selectDropdownById(page, '#from-sprint-number', '24.03');
    await selectDropdownById(page, '#from-release-version', '24.03.107');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await selectDropdownById(page, '#to-sprint-number', '24.05');
    await selectDropdownById(page, '#to-release-version', '24.05.106');
    await selectDropdownById(page, '#ip-version', 'ipv4');
    await selectDropdownById(page, '#deployment-size', 'ENMOnRack');
    await selectDropdownById(page, '#schema-file', 'ENMOnRack IPv4');
    await page.getByRole('button', { name: 'Compare Releases' }).click();
    await page.getByRole('row', { name: 'LMS_timezone Updated Key' }).getByRole('cell').first().click();
    
    const detailsText = await page.textContent('.details-row:not(.hidden) .cell-details div');
    const headings = await page.$$eval('.details-row:not(.hidden) h3', headings => {
      return headings.map(heading => heading.textContent);
    });
    expect(headings[0]).toEqual('From Value Change(s)');
    expect(headings[1]).toEqual('To Value Change(s)');
  
    const messages = await page.$$eval('.details-row:not(.hidden) ul li', messages => {
      return messages.map(message => message.textContent);
    });
    expect(messages[0]).toContain('Africa/Abidjan, Africa/Accra, Africa/Addis_Ababa');
    expect(messages[0]).not.toContain('[option Option]');
  });