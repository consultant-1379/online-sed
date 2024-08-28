import yaml from 'js-yaml';
export { yaml };
import path from 'path';
export { path };
import downloadsFolder from 'downloads-folder';
export { downloadsFolder };
import {
    stepCategory,
    RWX_STORAGE_CLASS,
    RWO_STORAGE_CLASS
} from '../ui-test/testUtils';

export async function fillCloudNativeCategories(page){
    await fillCategoryInputFields(page);
    await stepCategory(page);
    await fillCategoryBackupUsingSchema(page);
    await stepCategory(page);
    await fillCategoryConfigurationUsingSchema(page);
    await stepCategory(page);
    await fillCategorySecurityUsingSchema(page);
    await stepCategory(page);
    await fillCategoryInputFields(page);
    await stepCategory(page);
    await fillCategoryInputFields(page);
    await stepCategory(page);
    await fillCategoryIngressNXUsingSchema(page);
    await stepCategory(page);
    await page.getByRole('button', { name: 'Continue' }).click();

}

export async function fillCategoryInputFields(page) {
    let rows = await page.locator('div.content:visible').locator('div.row.table');
    let rowIndicator=0;
    let rowNumber = await rows.count()-1;
    while (rowIndicator != rowNumber){
        let row = await rows.nth(rowIndicator+1);
        if(await row.locator('input').count()>0){
            let value = await row.locator('.column').nth(2).textContent();
            await row.locator('input').fill(value);
        }
        rowIndicator++;
    }
}

export async function fillCategoryBackupUsingSchema(page){
    await fillCategoryInputFields(page);
    await addBackupSchedulingSchedules(page);
}

export async function fillCategoryConfigurationUsingSchema(page){
    await fillCategoryInputFields(page);
    await page.locator('#timezone').getByRole('button', { name: 'Please select...' }).click();
    await page.locator("text=" + "Africa/Abidjan").click();
    await addNodeSelector(page);
    await addToleration(page);
}

export async function fillCategorySecurityUsingSchema(page){
    await fillCategoryInputFields(page);
    await page.locator('#certificatesRevListDistributionPointServiceDnsEnable').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator('.item').nth(1).click();
    await page.locator('#certificatesRevListDistributionPointService_IPv4_enable').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator('.item').nth(1).click();
    await page.locator('#certificates_rev_list_distribution_point_service_IPv6_enable').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('div.select.open').locator("div.options-list").locator('.item').nth(1).click();
    await addSCCResource(page);
}

export async function fillCategoryIngressNXUsingSchema(page){
    await fillCategoryInputFields(page);
    await addAnnotation(page);
}

export async function addBackupSchedulingSchedules(page){
    await page.locator('#backup_scheduling_schedules').locator('button').click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectArray-input-every-0').fill('1w');
    await page.locator('#objectArray-input-start-0').fill('2100-01-01T01:01:01');
    await page.getByRole('button', { name: 'Save' }).click();
}

export async function addNodeSelector(page){
    await page.locator('#nodeSelector ').locator('button').click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#nodeKey_0').fill('node');
    await page.locator('#nodeValue_0').fill('cENM_Nodes');
    await page.getByRole('button', { name: 'Save' }).click();
}

export async function addAnnotation(page){
    await page.locator('#annotations').locator('button').click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#objectKey_0').fill('metallb.universe.tf/loadBalancerIPs');
    await page.locator('#objectValue_0').fill('10.42.14.167,2001:1b70:82b9:9f::1:1b');
    await page.getByRole('button', { name: 'Save' }).click();
}

export async function addToleration(page){
    await page.getByRole('button', { name: 'Add Toleration' }).click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#toleration-key-0').locator('input').fill('key1');
    await page.locator('#toleration-operator-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-operator-0').getByText('Equal', { exact: true }).click();
    await page.locator('#toleration-value-0').locator('input').fill('value1');
    await page.locator('#toleration-effect-0').getByRole('button', { name: 'Please select...' }).click();
    await page.locator('#toleration-effect-0').getByText('NoSchedule', { exact: true }).click();
    await page.locator('#saveTolerationBtn').click();
}

export async function addSCCResource(page){
    await page.locator('#sccResources ').locator('button').click();
    await page.getByRole('button', { name: 'Add entry' }).click();
    await page.locator('#entry_val_0').fill('val1');
    await page.getByRole('button', { name: 'Save' }).click();
}